from rest_framework import serializers
from ..models.user import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'name',
            'family_name',
            'given_name',
            'picture',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
