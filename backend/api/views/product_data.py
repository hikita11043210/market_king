from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class ProductDataAPIView(APIView):
    def post(self, request):
        """
        商品データの取得リクエストを作成
        """
        try:
            # リクエストの内容をログ出力
            logger.info("リクエスト受信:")
            logger.info(f"Request Data: {request.data}")
            logger.info(f"Request Headers: {request.headers}")

            source = request.data.get('source')
            url = request.data.get('url')
            category_id = request.data.get('categoryId')

            # 受け取ったパラメータの値をログ出力
            logger.info(f"Received parameters - source: {source}, url: {url}, category_id: {category_id}")

            # バリデーション
            if not all([source, url, category_id]):
                logger.warning("必須パラメータ不足")
                return Response(
                    {'message': '必須パラメータが不足しています'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ヤフオクの場合の処理
            if source == 'yahoo_auction':
                logger.info("ヤフオクのリクエストを処理中")
                
                # 仮のレスポンス
                response_data = {
                    'success': True,
                    'message': 'リクエストを受け付けました',
                    'data': {
                        'url': url,
                        'categoryId': category_id,
                        'source': source
                    }
                }
                logger.info(f"レスポンス送信: {response_data}")
                return Response(response_data)
            else:
                logger.warning(f"未対応の仕入れ元: {source}")
                return Response(
                    {'message': '未対応の仕入れ元です'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            logger.error(f"エラー発生: {str(e)}", exc_info=True)
            return Response(
                {'message': f'予期せぬエラーが発生しました: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 