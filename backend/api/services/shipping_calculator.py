from datetime import date
from decimal import Decimal
from typing import Dict, Any, Tuple

from api.models.master import (
    Service,
    Countries,
    Shipping,
    ShippingSurcharge,
)

class ShippingCalculator:
    # FedExのサイズ制限定数
    NORMAL_LENGTH_LIMIT = 121  # cm
    OVERSIZE_LENGTH_LIMIT = 243  # cm
    OVERSIZE_LENGTH_GIRTH_LIMIT = 330  # cm
    OVERSIZE_SURCHARGE = Decimal('2500.00')  # 追加料金
    def __init__(self, service_id: int):
        self.service = Service.objects.get(id=service_id)

    def calculate_dimensional_weight(self, length: int, width: int, height: int) -> Decimal:
        """寸法重量を計算"""
        return Decimal(str((length * width * height) / 5000))

    def check_size_restrictions(self, length: int, width: int, height: int) -> Tuple[bool, Decimal]:
        """サイズ制限をチェックし、追加料金を計算
        Returns:
            Tuple[制限超過の有無, 追加料金]
        """
        # 長さ + 胴回り(2w + 2h)の計算
        girth = 2 * (width + height)
        length_girth_total = length + girth

        # オーバーサイズチェック
        if length > self.OVERSIZE_LENGTH_LIMIT or length_girth_total > self.OVERSIZE_LENGTH_GIRTH_LIMIT:
            return True, self.OVERSIZE_SURCHARGE
        
        # 通常サイズ超過チェック
        if length > self.NORMAL_LENGTH_LIMIT:
            return True, Decimal('1000.00')  # 通常サイズ超過の追加料金
        
        return False, Decimal('0')

    def get_surcharges(self, base_price: Decimal) -> Dict[str, Decimal]:
        """現在適用される追加料金を取得"""
        today = date.today()
        surcharges = {}
        
        active_surcharges = ShippingSurcharge.objects.filter(
            service=self.service,
            start_date__lte=today
        ).filter(end_date__isnull=True)

        for surcharge in active_surcharges:
            amount = Decimal('0')
            if surcharge.rate:
                amount = base_price * (surcharge.rate / 100)
            if surcharge.fixed_amount:
                amount += surcharge.fixed_amount
            surcharges[surcharge.surcharge_type] = amount

        return surcharges

    def calculate_shipping_cost(self, country_code: str, length: int, width: int, 
                              height: int, weight: float) -> Dict[str, Any]:
        """送料を計算"""
        try:
            country = Countries.objects.get(country_code=country_code, service=self.service)
            weight_decimal = Decimal(str(weight))
            dim_weight = self.calculate_dimensional_weight(length, width, height)
            
            # 実重量と容積重量の大きい方を使用
            calc_weight = max(weight_decimal, dim_weight)
            # 基本送料を取得
            try:
                # 重量区分の一覧を取得
                weight_ranges = Shipping.objects.filter(
                    service=self.service,
                    zone=country.zone
                ).order_by('weight').values_list('weight', flat=True)

                # 適切な重量区分を見つける
                target_weight = None
                for w in weight_ranges:
                    if calc_weight <= w:
                        target_weight = w
                        break
                if not target_weight:
                    return {
                        'success': False,
                        'error': f'この重量（{calc_weight}kg）での配送料金が設定されていません'
                    }

                # 重複チェックのためにすべてのマッチするレコードを取得
                matching_rates = Shipping.objects.filter(
                    service=self.service,
                    zone=country.zone,
                    weight=target_weight
                ).values('id', 'service_id', 'zone', 'weight', 'basic_price')

                # 最新のレコード（IDが最大のもの）を取得
                shipping_rate = Shipping.objects.filter(
                    service=self.service,
                    zone=country.zone,
                    weight=target_weight
                ).order_by('-id').first()

                if not shipping_rate:
                    return {
                        'success': False,
                        'error': f'送料の取得に失敗しました'
                    }

                basic_price = shipping_rate.basic_price
            except Exception as e:
                print(e)
                return {
                    'success': False,
                    'error': f'送料の取得に失敗しました: {str(e)}'
                }

            # サイズ制限チェックと追加料金計算
            is_oversized, size_surcharge = self.check_size_restrictions(length, width, height)

            # その他の追加料金（燃料サーチャージなど）
            surcharges = self.get_surcharges(basic_price)
            if is_oversized:
                surcharges['OVERSIZE'] = size_surcharge
            
            # 合計金額を計算
            total_surcharges = sum(surcharges.values())
            total_amount = basic_price + total_surcharges

            return {
                'success': True,
                'message': 'データの取得に成功しました',
                'data': {
                    'base_rate': float(basic_price),
                    'surcharges': {k: float(v) for k, v in surcharges.items()},
                    'total_amount': float(total_amount),
                    'weight_used': float(calc_weight),
                    'zone': country.zone,
                    'is_oversized': is_oversized,
                    'weight_range': float(target_weight)  # デバッグ用に重量区分も返す
                }
            }

        except (Countries.DoesNotExist, Shipping.DoesNotExist) as e:
            return {
                'success': False,
                'error': str(e)
            } 