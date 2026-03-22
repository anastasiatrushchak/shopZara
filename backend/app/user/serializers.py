"""
Serializers for user API View
"""
from django.utils import timezone
from django.contrib.auth import (
    get_user_model,
    authenticate,
)
from django.utils.translation import gettext as _

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object"""

    class Meta:
        model = get_user_model()
        fields = ['email', 'password', 'name', 'phone_number', 'address']  # Додано нові поля
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 5},
            'phone_number': {'required': False},  # Поле не є обов'язковим
            'address': {'required': False},  # Поле не є обов'язковим
        }

    def create(self, validated_data):
        """Create and return a user with encrypted password"""
        return get_user_model().objects.create_user(**validated_data)
    
    def update(self, instance, validated_data):
        """Update and return user"""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        user.updated_at = timezone.now()
        if password:
            user.set_password(password)
            user.save()
        return user 


class AuthTokenSerializer(serializers.Serializer):
    """Serializer for the user auth token"""
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False,
    )

    def validate(self, attrs):
        """Validate and authenticate the user"""
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password,
        )
        if not user:
            msg = _('Unable to authenticate with provided credentials')
            raise serializers.ValidationError(msg, code='authorization')
        user.last_login = timezone.now()
        user.save()
        attrs['user'] = user
        return attrs
