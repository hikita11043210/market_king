from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..services.ebay import EbayService
import logging

logger = logging.getLogger(__name__)

class EbayRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """商品をeBayに登録するエンドポイント"""
        try:
            ebay_service = EbayService(user_id=request.user.id)
            result = ebay_service.register_product(request.data)
            
            # 成功レスポンス
            return Response({
                'success': True,
                'message': 'Successfully registered product on eBay',
                'data': result
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to register product on eBay: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to register product on eBay',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST) 