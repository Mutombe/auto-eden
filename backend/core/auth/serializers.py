"""
Authentication serializers for Auto Eden.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from dj_rest_auth.registration.serializers import RegisterSerializer
from core.models import Profile

User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    """Custom registration serializer with additional fields."""
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        data['phone'] = self.validated_data.get('phone', '')
        return data

    def save(self, request):
        user = super().save(request)
        # Create or update profile with phone
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.first_name = self.validated_data.get('first_name', '')
        profile.last_name = self.validated_data.get('last_name', '')
        profile.phone = self.validated_data.get('phone', '')
        profile.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset."""
    email = serializers.EmailField()

    def validate_email(self, value):
        # Normalize email
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset."""
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        return data


class ChangeEmailSerializer(serializers.Serializer):
    """Serializer for changing email."""
    new_email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_new_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already in use.')
        return value


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth authentication."""
    access_token = serializers.CharField(required=False)
    id_token = serializers.CharField(required=False)

    def validate(self, data):
        if not data.get('access_token') and not data.get('id_token'):
            raise serializers.ValidationError(
                'Either access_token or id_token is required.'
            )
        return data
