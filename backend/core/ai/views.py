# core/ai/views.py
"""
API views for Claude AI features.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
import logging

from .client import claude_client
from .prompts import CUSTOMER_SUPPORT_PROMPT
from core.models import Vehicle

logger = logging.getLogger(__name__)


class AIStatusView(APIView):
    """Check if AI features are enabled."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'enabled': claude_client.is_enabled(),
            'features': {
                'chat': True,
                'vehicle_analysis': True,
                'description_generation': True,
                'price_suggestion': True,
            } if claude_client.is_enabled() else {}
        })


class AIChatView(APIView):
    """
    Customer support chat powered by Claude AI.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not claude_client.is_enabled():
            return Response(
                {'error': 'AI features are not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        message = request.data.get('message', '').strip()
        conversation_history = request.data.get('history', [])

        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(message) > 2000:
            return Response(
                {'error': 'Message too long (max 2000 characters)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Limit conversation history
        if len(conversation_history) > 20:
            conversation_history = conversation_history[-20:]

        response = claude_client.chat(
            message=message,
            system_prompt=CUSTOMER_SUPPORT_PROMPT,
            conversation_history=conversation_history,
            max_tokens=512,
        )

        if response:
            return Response({'response': response})
        else:
            return Response(
                {'error': 'Failed to generate response'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VehicleAIAnalysisView(APIView):
    """
    AI-powered vehicle analysis for a specific vehicle.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, vehicle_id):
        if not claude_client.is_enabled():
            return Response(
                {'error': 'AI features are not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        vehicle = get_object_or_404(Vehicle, id=vehicle_id)

        # Only analyze visible, verified vehicles
        if not vehicle.is_visible or vehicle.verification_state != 'physical':
            return Response(
                {'error': 'Vehicle not available for analysis'},
                status=status.HTTP_404_NOT_FOUND
            )

        vehicle_data = {
            'id': vehicle.id,
            'make': vehicle.make,
            'model': vehicle.model,
            'year': vehicle.year,
            'price': float(vehicle.price or vehicle.proposed_price or 0),
            'mileage': vehicle.mileage,
            'fuel_type': vehicle.fuel_type,
            'transmission': vehicle.transmission,
            'body_type': vehicle.body_type,
            'location': vehicle.location,
        }

        analysis = claude_client.analyze_vehicle(vehicle_data)

        if analysis:
            return Response(analysis)
        else:
            return Response(
                {'error': 'Failed to analyze vehicle'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VehicleAIQuestionView(APIView):
    """
    Ask AI a question about a specific vehicle.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, vehicle_id):
        if not claude_client.is_enabled():
            return Response(
                {'error': 'AI features are not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        vehicle = get_object_or_404(Vehicle, id=vehicle_id)
        question = request.data.get('question', '').strip()

        if not question:
            return Response(
                {'error': 'Question is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(question) > 500:
            return Response(
                {'error': 'Question too long (max 500 characters)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        system_prompt = f"""You are answering questions about a specific vehicle on Auto Eden.

Vehicle Details:
- Make: {vehicle.make}
- Model: {vehicle.model}
- Year: {vehicle.year}
- Price: ${vehicle.price or vehicle.proposed_price or 'Not specified'}
- Mileage: {vehicle.mileage or 'Not specified'}
- Fuel Type: {vehicle.fuel_type or 'Not specified'}
- Transmission: {vehicle.transmission or 'Not specified'}
- Body Type: {vehicle.body_type or 'Not specified'}
- Location: {vehicle.location or 'Zimbabwe'}

Answer the question based on general knowledge about this vehicle type
and the information provided. Be helpful but don't make up specific details
about this particular listing."""

        response = claude_client.chat(
            message=question,
            system_prompt=system_prompt,
            max_tokens=512,
        )

        if response:
            return Response({'response': response})
        else:
            return Response(
                {'error': 'Failed to generate response'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateDescriptionView(APIView):
    """
    Generate a vehicle description using AI.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not claude_client.is_enabled():
            return Response(
                {'error': 'AI features are not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        data = request.data
        required_fields = ['make', 'model', 'year']

        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        description = claude_client.generate_vehicle_description(
            make=data.get('make'),
            model=data.get('model'),
            year=data.get('year'),
            mileage=data.get('mileage', 'Not specified'),
            fuel_type=data.get('fuel_type', 'Not specified'),
            transmission=data.get('transmission', 'Not specified'),
            body_type=data.get('body_type', 'Not specified'),
            condition=data.get('condition', 'good'),
            features=data.get('features', []),
        )

        if description:
            return Response({'description': description})
        else:
            return Response(
                {'error': 'Failed to generate description'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SuggestPriceView(APIView):
    """
    Get AI-powered price suggestion for a vehicle.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not claude_client.is_enabled():
            return Response(
                {'error': 'AI features are not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        data = request.data
        required_fields = ['make', 'model', 'year']

        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        suggestion = claude_client.suggest_price(
            make=data.get('make'),
            model=data.get('model'),
            year=data.get('year'),
            mileage=data.get('mileage', 'Not specified'),
            condition=data.get('condition', 'good'),
            fuel_type=data.get('fuel_type', ''),
        )

        if suggestion:
            return Response(suggestion)
        else:
            return Response(
                {'error': 'Failed to suggest price'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DraftEmailView(APIView):
    """
    Draft a professional email using AI (admin only).
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        if not claude_client.is_enabled():
            return Response(
                {'error': 'AI features are not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        email_type = request.data.get('type')
        context = request.data.get('context', {})

        if not email_type:
            return Response(
                {'error': 'Email type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_types = ['inquiry_response', 'quote_followup', 'rejection_notice',
                       'approval_notice', 'bid_notification']

        if email_type not in valid_types:
            return Response(
                {'error': f'Invalid email type. Must be one of: {", ".join(valid_types)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        draft = claude_client.draft_email(email_type=email_type, context=context)

        if draft:
            return Response({'draft': draft})
        else:
            return Response(
                {'error': 'Failed to draft email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
