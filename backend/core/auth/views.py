"""
Authentication views for Auto Eden.
"""
import secrets
import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
from django.conf import settings

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Profile
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
    ChangeEmailSerializer,
    GoogleAuthSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class PasswordResetRequestView(APIView):
    """Request a password reset email."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email__iexact=email)
            profile, _ = Profile.objects.get_or_create(user=user)

            # Generate reset token
            token = secrets.token_urlsafe(32)
            profile.password_reset_token = token
            profile.password_reset_expires = timezone.now() + timedelta(hours=24)
            profile.save()

            # Send email
            reset_url = f"{settings.SITE_URL}/reset-password?token={token}"

            try:
                context = {
                    'user': user,
                    'reset_url': reset_url,
                    'valid_hours': 24,
                }
                html_message = render_to_string('emails/password_reset_email.html', context)
                plain_message = strip_tags(html_message)

                send_mail(
                    subject='Reset Your Auto Eden Password',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False,
                )
                logger.info(f"Password reset email sent to {email}")
            except Exception as e:
                logger.error(f"Failed to send password reset email: {e}")
                # Still return success to prevent email enumeration
        except User.DoesNotExist:
            # Don't reveal if email exists
            logger.info(f"Password reset requested for non-existent email: {email}")
            pass

        # Always return success to prevent email enumeration
        return Response({
            'detail': 'If an account exists with this email, you will receive a password reset link.'
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            profile = Profile.objects.get(
                password_reset_token=token,
                password_reset_expires__gt=timezone.now()
            )
            user = profile.user

            # Set new password
            user.set_password(new_password)
            user.save()

            # Clear reset token
            profile.password_reset_token = None
            profile.password_reset_expires = None
            profile.save()

            logger.info(f"Password reset successful for user: {user.username}")

            return Response({
                'detail': 'Password has been reset successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)

        except Profile.DoesNotExist:
            return Response({
                'detail': 'Invalid or expired reset token.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change password for authenticated user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        current_password = serializer.validated_data['current_password']
        new_password = serializer.validated_data['new_password']

        # Verify current password
        if not user.check_password(current_password):
            return Response({
                'current_password': ['Current password is incorrect.']
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        logger.info(f"Password changed for user: {user.username}")

        return Response({
            'detail': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)


class ChangeEmailView(APIView):
    """Change email for authenticated user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        new_email = serializer.validated_data['new_email']
        password = serializer.validated_data['password']

        # Verify password
        if not user.check_password(password):
            return Response({
                'password': ['Password is incorrect.']
            }, status=status.HTTP_400_BAD_REQUEST)

        # Update email
        old_email = user.email
        user.email = new_email
        user.save()

        logger.info(f"Email changed for user {user.username}: {old_email} -> {new_email}")

        return Response({
            'detail': 'Email changed successfully.',
            'email': new_email
        }, status=status.HTTP_200_OK)


class GoogleLoginView(APIView):
    """Handle Google OAuth login."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Get token from request
        id_token = serializer.validated_data.get('id_token')
        access_token = serializer.validated_data.get('access_token')

        try:
            # Verify token with Google
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests

            if id_token:
                # Verify ID token
                idinfo = google_id_token.verify_oauth2_token(
                    id_token,
                    google_requests.Request(),
                    settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
                )

                google_id = idinfo['sub']
                email = idinfo['email']
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')
                picture = idinfo.get('picture', '')
            else:
                # Use access token to get user info
                import requests
                response = requests.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                if response.status_code != 200:
                    return Response({
                        'detail': 'Invalid access token.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                userinfo = response.json()
                google_id = userinfo['sub']
                email = userinfo['email']
                first_name = userinfo.get('given_name', '')
                last_name = userinfo.get('family_name', '')
                picture = userinfo.get('picture', '')

            # Find or create user
            try:
                profile = Profile.objects.get(google_id=google_id)
                user = profile.user
            except Profile.DoesNotExist:
                # Check if user with this email exists
                try:
                    user = User.objects.get(email__iexact=email)
                    profile, _ = Profile.objects.get_or_create(user=user)
                    profile.google_id = google_id
                    profile.save()
                except User.DoesNotExist:
                    # Create new user
                    username = email.split('@')[0]
                    # Ensure unique username
                    base_username = username
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1

                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=None,  # No password for OAuth users
                        is_active=True
                    )
                    profile = Profile.objects.create(
                        user=user,
                        google_id=google_id,
                        first_name=first_name,
                        last_name=last_name,
                    )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                }
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            logger.error(f"Google OAuth error: {e}")
            return Response({
                'detail': 'Invalid Google token.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Google OAuth error: {e}")
            return Response({
                'detail': 'Authentication failed.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyEmailView(APIView):
    """Verify email with token."""
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            profile = Profile.objects.get(email_verification_token=token)
            profile.email_verified = True
            profile.email_verification_token = None
            profile.save()

            return Response({
                'detail': 'Email verified successfully.'
            }, status=status.HTTP_200_OK)

        except Profile.DoesNotExist:
            return Response({
                'detail': 'Invalid verification token.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationEmailView(APIView):
    """Resend email verification."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        if profile.email_verified:
            return Response({
                'detail': 'Email is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate new token
        token = secrets.token_urlsafe(32)
        profile.email_verification_token = token
        profile.save()

        # Send verification email
        verify_url = f"{settings.SITE_URL}/verify-email?token={token}"

        try:
            context = {
                'user': user,
                'verify_url': verify_url,
            }
            html_message = render_to_string('emails/verify_email.html', context)
            plain_message = strip_tags(html_message)

            send_mail(
                subject='Verify Your Auto Eden Email',
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )

            return Response({
                'detail': 'Verification email sent.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to send verification email: {e}")
            return Response({
                'detail': 'Failed to send verification email.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
