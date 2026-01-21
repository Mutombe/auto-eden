# core/ai/client.py
"""
Claude AI client for interacting with Anthropic's API.
"""
import logging
from typing import Optional, List, Dict, Any
from django.conf import settings

logger = logging.getLogger(__name__)

# Check if anthropic is available
ANTHROPIC_AVAILABLE = False
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    logger.warning("anthropic package not installed, AI features will be disabled")


class ClaudeClient:
    """
    Client for interacting with Claude AI via Anthropic's API.
    """

    def __init__(self):
        self.api_key = getattr(settings, 'ANTHROPIC_API_KEY', '')
        self.enabled = bool(self.api_key and ANTHROPIC_AVAILABLE)
        self.client = None

        if self.enabled:
            self.client = anthropic.Anthropic(api_key=self.api_key)

    def is_enabled(self) -> bool:
        """Check if AI is enabled and configured."""
        return self.enabled

    def chat(
        self,
        message: str,
        system_prompt: str = "",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> Optional[str]:
        """
        Send a message to Claude and get a response.

        Args:
            message: User's message
            system_prompt: System instructions for Claude
            conversation_history: Previous messages for context
            max_tokens: Maximum response length
            temperature: Response creativity (0-1)

        Returns:
            Claude's response text or None if failed
        """
        if not self.enabled:
            logger.warning("Claude AI is not configured")
            return None

        try:
            messages = []

            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history)

            # Add current message
            messages.append({"role": "user", "content": message})

            # Make API call
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",  # Use Haiku for speed and cost efficiency
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages,
                temperature=temperature,
            )

            return response.content[0].text

        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Claude client error: {e}")
            return None

    def generate_vehicle_description(
        self,
        make: str,
        model: str,
        year: int,
        mileage: str,
        fuel_type: str,
        transmission: str,
        body_type: str,
        condition: str = "good",
        features: Optional[List[str]] = None,
    ) -> Optional[str]:
        """
        Generate a professional vehicle description.

        Args:
            make: Vehicle make (e.g., Toyota)
            model: Vehicle model (e.g., Camry)
            year: Year of manufacture
            mileage: Current mileage
            fuel_type: Fuel type
            transmission: Transmission type
            body_type: Body type
            condition: Vehicle condition
            features: List of notable features

        Returns:
            Generated description or None if failed
        """
        system_prompt = """You are an expert automotive copywriter. Write compelling,
        professional vehicle descriptions for a Zimbabwe-based car marketplace.
        Be concise but highlight key selling points. Use a professional yet approachable tone.
        Keep descriptions between 100-200 words."""

        features_text = ""
        if features:
            features_text = f"\nNotable features: {', '.join(features)}"

        user_message = f"""Generate a professional description for this vehicle:

Make: {make}
Model: {model}
Year: {year}
Mileage: {mileage}
Fuel Type: {fuel_type}
Transmission: {transmission}
Body Type: {body_type}
Condition: {condition}{features_text}

Write an engaging description that would appeal to potential buyers in Zimbabwe."""

        return self.chat(
            message=user_message,
            system_prompt=system_prompt,
            max_tokens=512,
            temperature=0.7,
        )

    def analyze_vehicle(self, vehicle_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Analyze a vehicle and provide insights.

        Args:
            vehicle_data: Dictionary containing vehicle information

        Returns:
            Dictionary with analysis or None if failed
        """
        system_prompt = """You are an automotive expert providing vehicle analysis.
        Return your analysis as a structured response with:
        1. Overall assessment (1-2 sentences)
        2. Key strengths (2-3 bullet points)
        3. Potential concerns (1-2 bullet points if any)
        4. Value assessment (fair/good/excellent for the price)

        Be factual and helpful to potential buyers."""

        user_message = f"""Analyze this vehicle listing:

Make: {vehicle_data.get('make', 'Unknown')}
Model: {vehicle_data.get('model', 'Unknown')}
Year: {vehicle_data.get('year', 'Unknown')}
Price: ${vehicle_data.get('price', 'Unknown')}
Mileage: {vehicle_data.get('mileage', 'Unknown')}
Fuel Type: {vehicle_data.get('fuel_type', 'Unknown')}
Transmission: {vehicle_data.get('transmission', 'Unknown')}
Body Type: {vehicle_data.get('body_type', 'Unknown')}
Location: {vehicle_data.get('location', 'Unknown')}

Provide a brief but helpful analysis for a potential buyer."""

        response = self.chat(
            message=user_message,
            system_prompt=system_prompt,
            max_tokens=512,
            temperature=0.5,
        )

        if response:
            return {
                'analysis': response,
                'vehicle_id': vehicle_data.get('id'),
            }
        return None

    def suggest_price(
        self,
        make: str,
        model: str,
        year: int,
        mileage: str,
        condition: str = "good",
        fuel_type: str = "",
    ) -> Optional[Dict[str, Any]]:
        """
        Suggest a fair price range for a vehicle.

        Note: This is a basic suggestion based on general knowledge.
        For accurate pricing, integrate with actual market data.
        """
        system_prompt = """You are an automotive pricing expert familiar with the
        Zimbabwe car market. Provide price suggestions in USD. Be conservative
        and account for the local market conditions. Respond with only a JSON
        object containing min_price, max_price, and suggested_price."""

        user_message = f"""Suggest a fair price range for:

Make: {make}
Model: {model}
Year: {year}
Mileage: {mileage}
Condition: {condition}
Fuel Type: {fuel_type}

Consider the Zimbabwe market. Respond with only a JSON object like:
{{"min_price": 10000, "max_price": 15000, "suggested_price": 12500}}"""

        response = self.chat(
            message=user_message,
            system_prompt=system_prompt,
            max_tokens=256,
            temperature=0.3,
        )

        if response:
            try:
                import json
                return json.loads(response)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse price suggestion: {response}")
        return None

    def draft_email(
        self,
        email_type: str,
        context: Dict[str, Any],
    ) -> Optional[str]:
        """
        Draft a professional email.

        Args:
            email_type: Type of email (inquiry_response, quote_followup, rejection_notice, etc.)
            context: Dictionary with relevant context for the email

        Returns:
            Drafted email text or None if failed
        """
        email_prompts = {
            'inquiry_response': "responding to a customer inquiry about a vehicle",
            'quote_followup': "following up on a quote request",
            'rejection_notice': "notifying a customer that their vehicle was not approved",
            'approval_notice': "congratulating a customer on their vehicle being approved",
            'bid_notification': "notifying a vehicle owner about a new bid",
        }

        email_desc = email_prompts.get(email_type, "general customer communication")

        system_prompt = f"""You are a professional customer service representative for
        Auto Eden, Zimbabwe's premier vehicle marketplace. Draft a professional,
        friendly email {email_desc}. Be concise and helpful."""

        context_str = "\n".join([f"{k}: {v}" for k, v in context.items()])

        user_message = f"""Draft an email with this context:

{context_str}

Write a professional email that is warm but concise."""

        return self.chat(
            message=user_message,
            system_prompt=system_prompt,
            max_tokens=512,
            temperature=0.6,
        )


# Singleton instance
claude_client = ClaudeClient()
