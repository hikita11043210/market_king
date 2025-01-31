from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string
from ..models import Setting
from ..validations.ebay import validate_product_data, validate_api_headers
from .currency import CurrencyService
import os
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Any
from xml.dom import minidom
from io import StringIO
from xml.etree import ElementTree

logger = logging.getLogger(__name__)

# エラーメッセージ
ERROR_MESSAGES = {
    'missing_credentials': 'eBayの認証情報が設定されていません',
    'invalid_credentials': '無効な認証情報です',
    'token_error': 'トークンの取得に失敗しました',
}

class EbayService:
    NS = "urn:ebay:apis:eBLBaseComponents"

    def __init__(self, user_id: int):
        try:
            setting = Setting.objects.get(id_id=user_id)
            # 必要な認証情報が全て設定されているか確認
            if not all([
                setting.ebay_client_id,
                setting.ebay_client_secret,
                setting.ebay_dev_id,
                setting.ebay_auth_token
            ]):
                missing_fields = []
                if not setting.ebay_client_id:
                    missing_fields.append("Client ID")
                if not setting.ebay_client_secret:
                    missing_fields.append("Client Secret")
                if not setting.ebay_dev_id:
                    missing_fields.append("Dev ID")
                if not setting.ebay_auth_token:
                    missing_fields.append("Auth Token")
                raise ValidationError(f"以下のeBay認証情報が設定されていません: {', '.join(missing_fields)}")
                
            self.client_id = setting.ebay_client_id
            self.client_secret = setting.ebay_client_secret
            self.dev_id = setting.ebay_dev_id
            self.auth_token = setting.ebay_auth_token
            
            # 開発環境はTrue、本番環境はFalse
            self.is_sandbox = getattr(settings, 'EBAY_IS_SANDBOX', True)
            self.base_url = getattr(settings, 'EBAY_SANDBOX_URL') if self.is_sandbox else getattr(settings, 'EBAY_PRODUCTION_URL')
            
            if not self.base_url:
                raise ValidationError('eBayのAPIエンドポイントが設定されていません')
            
            logger.info(f"Initialized EbayService with base_url: {self.base_url}")
            
        except Setting.DoesNotExist:
            raise ValidationError("eBayの認証情報が設定されていません。各種設定画面で設定してください。")
        except Exception as e:
            logger.error(f"Failed to initialize EbayService: {str(e)}")
            raise

    def _get_access_token(self) -> str:
        """OAuthアクセストークンを取得"""
        cached_token = cache.get(f"ebay_access_token_{self.client_id}")
        if cached_token:
            return cached_token

        try:
            auth_url = f"{self.base_url}/identity/v1/oauth2/token"
            auth_data = {
                'grant_type': 'refresh_token',
                'refresh_token': self.auth_token,
                'scope': 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
            }
            
            response = requests.post(
                auth_url,
                data=auth_data,
                auth=(self.client_id, self.client_secret),
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if not response.ok:
                logger.error(f"Token request failed: {response.status_code}")
                logger.error(f"Response: {response.content.decode('utf-8')}")
                raise ValidationError("アクセストークンの取得に失敗しました")

            token_data = response.json()
            access_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in', 7200)  # デフォルト2時間

            if not access_token:
                raise ValidationError("アクセストークンの取得に失敗しました")

            # キャッシュに保存（有効期限の5分前に期限切れ）
            cache.set(
                f"ebay_access_token_{self.client_id}",
                access_token,
                expires_in - 300
            )

            return access_token

        except Exception as e:
            logger.error(f"Failed to get access token: {str(e)}")
            raise ValidationError("アクセストークンの取得に失敗しました")

    def register_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """eBayに商品を登録"""
        try:
            # バリデーション
            validate_product_data(product_data)
            
            # 日本円からUSDに変換
            if product_data['currency'] == 'JPY':
                product_data['startPrice']['value'] = CurrencyService.convert_amount(
                    product_data['startPrice']['value'],
                    'JPY',
                    'USD'
                )
                product_data['startPrice']['currencyId'] = 'USD'
                
                if 'shippingServiceOptions' in product_data['shippingDetails']:
                    for option in product_data['shippingDetails']['shippingServiceOptions']:
                        if 'shippingServiceCost' in option:
                            option['shippingServiceCost']['value'] = CurrencyService.convert_amount(
                                option['shippingServiceCost']['value'],
                                'JPY',
                                'USD'
                            )
                            option['shippingServiceCost']['currencyId'] = 'USD'
                
                product_data['currency'] = 'USD'

            # XMLテンプレートをレンダリング
            xml_request = render_to_string('ebay/add_fixed_price_item.xml', {
                'token': self.auth_token,
                'product_data': product_data
            }).strip()

            # APIリクエストを送信
            response = self._send_request('AddFixedPriceItem', xml_request)
            
            # 成功レスポンスのパース
            item_id = response.find(f'.//{{{self.NS}}}ItemID')
            if item_id is None:
                raise ValidationError("商品登録に失敗しました：ItemIDが見つかりません")
            
            fees = response.findall(f'.//{{{self.NS}}}Fee')
            fee_list = []
            for fee in fees:
                name = fee.find(f'{{{self.NS}}}Name')
                amount = fee.find(f'.//{{{self.NS}}}Amount')
                if name is not None and amount is not None:
                    fee_list.append({
                        'Name': name.text,
                        'Amount': {
                            'value': amount.text,
                            'currencyID': amount.attrib.get('currencyID', 'USD')
                        }
                    })
            
            return {
                'ItemID': item_id.text,
                'Fees': {
                    'Fee': fee_list
                }
            }

        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Failed to register product: {str(e)}")
            raise ValidationError("商品の登録に失敗しました")

    def get_item(self, item_id: str) -> Dict[str, Any]:
        """eBayの商品情報を取得"""
        try:
            xml_request = f"""<?xml version="1.0" encoding="utf-8"?>
<GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
<RequesterCredentials>
<eBayAuthToken>{self.auth_token}</eBayAuthToken>
</RequesterCredentials>
<ItemID>{item_id}</ItemID>
<DetailLevel>ReturnAll</DetailLevel>
</GetItemRequest>"""

            # APIリクエストを送信
            response = self._send_request('GetItem', xml_request)
            
            # 商品情報を取得
            item = response.find(f'.//{{{self.NS}}}Item')
            if item is None:
                raise ValidationError("商品情報が見つかりません")
            
            # 必要な情報を抽出
            return {
                'ItemID': self._get_element_text(item, 'ItemID'),
                'Title': self._get_element_text(item, 'Title'),
                'Description': self._get_element_text(item, 'Description'),
                'CurrentPrice': {
                    'Value': self._get_element_text(item, './/CurrentPrice'),
                    'CurrencyID': item.find('.//CurrentPrice').get('currencyID') if item.find('.//CurrentPrice') is not None else None
                },
                'ListingStatus': self._get_element_text(item, 'ListingStatus'),
                'ViewItemURL': self._get_element_text(item, 'ViewItemURL'),
            }

        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Failed to get item info: {str(e)}")
            raise ValidationError("商品情報の取得に失敗しました")

    def _send_request(self, call_name: str, xml_request: str) -> ElementTree.Element:
        """eBay APIにリクエストを送信"""
        try:
            headers = {
                'X-EBAY-API-CALL-NAME': call_name,
                'X-EBAY-API-SITEID': getattr(settings, 'EBAY_API_SITE_ID', '0'),
                'X-EBAY-API-COMPATIBILITY-LEVEL': getattr(settings, 'EBAY_API_COMPATIBILITY_LEVEL', '967'),
                'X-EBAY-API-APP-NAME': self.client_id,
                'X-EBAY-API-DEV-NAME': self.dev_id,
                'X-EBAY-API-CERT-NAME': self.client_secret,
                'Content-Type': 'application/xml',
            }

            validate_api_headers(headers)
            response = requests.post(f"{self.base_url}/ws/api.dll", data=xml_request, headers=headers)

            if not response.ok:
                logger.error(f"API request failed: {response.content.decode('utf-8')}")
                raise ValidationError("APIリクエストに失敗しました")

            root = ElementTree.fromstring(response.content)
            
            # エラーチェック
            errors = root.findall(f'.//{{{self.NS}}}Errors')
            if errors:
                error_messages = []
                for error in errors:
                    error_id = error.find(f'{{{self.NS}}}ErrorCode')
                    error_message = error.find(f'{{{self.NS}}}LongMessage')
                    if error_message is not None:
                        error_messages.append(f"Error {error_id.text if error_id is not None else 'Unknown'}: {error_message.text}")
                if error_messages:
                    raise ValidationError(error_messages)
            
            return root

        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"API request failed: {str(e)}")
            raise ValidationError("APIリクエストに失敗しました")

    def _get_element_text(self, element: ElementTree.Element, path: str) -> str:
        """XMLから要素のテキストを取得（存在しない場合はNone）"""
        el = element.find(f'.//{{{self.NS}}}{path}')
        return el.text if el is not None else None 