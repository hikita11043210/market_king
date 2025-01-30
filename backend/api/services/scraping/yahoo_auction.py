import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class YahooAuctionService:
    BASE_URL = "https://auctions.yahoo.co.jp/search/search"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def search_items(self, params):
        """
        Yahoo!オークションの検索を実行し、結果を取得する

        Args:
            params (dict): 検索パラメータ
                - p: 検索キーワード
                - auccat: カテゴリ指定
                - va: キーワードフィルター
                - aucmax_bidorbuy_price: 最高即決価格
                - price_type: 価格の種類
                - max: 価格上限
                - istatus: オークション状態
                - new: 新着商品フィルター
                - is_postage_mode: 送料設定フィルター
                - dest_pref_code: 配送先都道府県コード
                - abatch: 出品形式
                - exflg: エクスプレスオークション
                - b: 開始番号
                - n: 取得件数

        Returns:
            dict: 検索結果と総件数を含む辞書
        """
        try:
            # デフォルトパラメータの設定
            default_params = {
            }

            # None値を除外しながらパラメータをマージ
            search_params = {k: v for k, v in params.items() if v is not None}
            search_params.update(default_params)

            # 最初のページを取得して総件数を確認
            first_page = self.session.get(self.BASE_URL, params=search_params)
            first_page.raise_for_status()
            soup = BeautifulSoup(first_page.text, 'html.parser')
            
            # 総件数を取得
            total_count_elem = soup.select_one('.SearchMode__result')
            total_count = 0
            if total_count_elem:
                count_text = total_count_elem.text
                import re
                count_match = re.search(r'約([0-9,]+)件', count_text)
                if count_match:
                    total_count = int(count_match.group(1).replace(',', ''))

            # 最初のページの結果を解析
            items = self._parse_search_results(soup)
            
            # 残りのページを取得（最大5ページまで）
            max_pages = min(5, (total_count + 99) // 100)
            for page in range(2, max_pages + 1):
                search_params['b'] = str((page - 1) * 100 + 1)
                response = self.session.get(self.BASE_URL, params=search_params)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                items.extend(self._parse_search_results(soup))

            return {
                'items': items,
                'total_count': total_count
            }

        except requests.RequestException as e:
            logger.error(f"リクエストエラー: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"スクレイピングエラー: {str(e)}")
            raise

    def search_categories(self, params):
        """
        カテゴリ検索を実行
        """
        # TODO: カテゴリ検索の実装
        return {
            'categories': []
        }

    def _parse_search_results(self, soup):
        """
        検索結果のHTMLをパースして商品情報を抽出する

        Args:
            soup (BeautifulSoup): パース済みのHTML

        Returns:
            list: 商品情報のリスト
        """
        items = []
        product_list = soup.select('.Product')
        for product in product_list:
            try:
                # 商品情報の抽出
                title_elem = product.select_one('.Product__title')
                url_elem = product.select_one('.Product__titleLink')
                image_elem = product.select_one('.Product__imageData')
                
                # 価格情報の取得（現在価格と即決価格を区別）
                price_containers = product.select('.Product__price')
                current_price = None
                buy_now_price = None
                
                for container in price_containers:
                    label = container.select_one('.Product__label')
                    price_value = container.select_one('.Product__priceValue')
                    if label and price_value:
                        if '現在' in label.text:
                            current_price = price_value.text.strip().replace('円', '').replace(',', '')
                        elif '即決' in label.text:
                            buy_now_price = price_value.text.strip().replace('円', '').replace(',', '')

                seller_elem = product.select_one('.Product__seller')
                end_time_elem = product.select_one('.Product__time')
                bid_count_elem = product.select_one('.Product__bid')
                shipping_elem = product.select_one('.Product__postage')
                condition_elem = product.select_one('.Product__condition')
                location_elem = product.select_one('.Product__location')
                category_elem = product.select_one('.Product__category')
                description_elem = product.select_one('.Product__description')
                payment_elem = product.select_one('.Product__payment')

                if not all([title_elem, url_elem]) or not current_price:
                    continue

                item = {
                    'title': title_elem.text.strip(),
                    'price': current_price,
                    'buy_now_price': buy_now_price,
                    'image_url': image_elem.get('src') if image_elem else None,
                    'url': url_elem.get('href') if url_elem.get('href') else None,
                    'seller': seller_elem.text.strip() if seller_elem else None,
                    'end_time': end_time_elem.text.strip() if end_time_elem else None,
                    'bid_count': bid_count_elem.text.strip() if bid_count_elem else '0',
                    'shipping': shipping_elem.text.strip() if shipping_elem else None,
                    'condition': condition_elem.text.strip() if condition_elem else None,
                    'location': location_elem.text.strip() if location_elem else None,
                    'category': category_elem.text.strip() if category_elem else None,
                    'description': description_elem.text.strip() if description_elem else None,
                    'payment_methods': payment_elem.text.strip() if payment_elem else None
                }
                items.append(item)
            except Exception as e:
                logger.warning(f"商品情報の抽出に失敗: {str(e)}")
                continue

        return items 