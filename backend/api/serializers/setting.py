from rest_framework import serializers
from ..models.master import Setting

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = [
            'yahoo_client_id',
            'yahoo_client_secret',
            'ebay_client_id',
            'ebay_client_secret'
        ] 