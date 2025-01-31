from typing import Dict, Any
from django.core.exceptions import ValidationError

def validate_product_data(product_data: Dict[str, Any]) -> None:
    """商品データのバリデーション"""
    # 必須フィールドの検証
    required_fields = [
        'title', 'description', 'primaryCategory', 'startPrice',
        'quantity', 'listingDuration', 'listingType', 'country',
        'currency', 'paymentMethods', 'condition', 'returnPolicy',
        'shippingDetails'
    ]
    
    missing_fields = [field for field in required_fields if field not in product_data]
    if missing_fields:
        raise ValidationError(f"必須フィールドが不足しています: {', '.join(missing_fields)}")

    # ネストされたフィールドの検証
    if not isinstance(product_data.get('primaryCategory'), dict) or 'categoryId' not in product_data['primaryCategory']:
        raise ValidationError("カテゴリー情報が不正です")
    
    if not isinstance(product_data.get('startPrice'), dict) or 'value' not in product_data['startPrice']:
        raise ValidationError("価格情報が不正です")

    if not isinstance(product_data.get('condition'), dict) or 'conditionId' not in product_data['condition']:
        raise ValidationError("商品状態の情報が不正です")

    if not isinstance(product_data.get('returnPolicy'), dict) or not all(k in product_data['returnPolicy'] for k in ['returnsAccepted', 'returnsPeriod', 'returnsDescription']):
        raise ValidationError("返品ポリシーの情報が不正です")

    if not isinstance(product_data.get('shippingDetails'), dict) or 'shippingServiceOptions' not in product_data['shippingDetails']:
        raise ValidationError("配送情報が不正です")

def validate_api_headers(headers: Dict[str, str]) -> None:
    """APIヘッダーのバリデーション"""
    required_headers = ['X-EBAY-API-APP-NAME', 'X-EBAY-API-DEV-NAME', 'X-EBAY-API-CERT-NAME']
    missing_headers = [header for header in required_headers if not headers[header]]
    if missing_headers:
        raise ValidationError(f"必須のeBay API認証情報が不足しています: {', '.join(missing_headers)}") 