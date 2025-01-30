from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.services.shipping_calculator import ShippingCalculator
from api.models.master import Service, Countries

class ShippingCalculatorView(APIView):
    def get(self, request):
        """利用可能なサービスと国のリストを取得"""
        try:
            services = Service.objects.all().values('id', 'service_name')
            countries = Countries.objects.all().values('country_code', 'country_name', 'country_name_jp')
            return Response({
                'success': True,
                'message': 'データの取得に成功しました',
                'data': {
                    'services': list(services),
                    'countries': list(countries)
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """送料を計算"""
        try:
            service_id = request.data.get('service_id')
            country_code = request.data.get('country_code')
            length = int(request.data.get('length', 0))
            width = int(request.data.get('width', 0))
            height = int(request.data.get('height', 0))
            weight = float(request.data.get('weight', 0))
            # 入力値の検証
            if not all([service_id, country_code, length, width, height, weight]):
                return Response({
                    'error': '必要なパラメータが不足しています'
                }, status=status.HTTP_400_BAD_REQUEST)

            calculator = ShippingCalculator(service_id)
            result = calculator.calculate_shipping_cost(
                country_code, length, width, height, weight
            )

            if result['success']:
                return Response(result)
            else:
                return Response({
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)

        except (ValueError, TypeError) as e:
            return Response({
                'error': f'入力値が不正です: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'予期せぬエラーが発生しました: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 