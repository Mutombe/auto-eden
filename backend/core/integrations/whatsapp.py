# core/integrations/whatsapp.py
"""
WhatsApp Cloud API integration for sending notifications.
Uses Meta's WhatsApp Business Cloud API.
"""
import logging
import requests
from django.conf import settings
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)


class WhatsAppClient:
    """
    Client for interacting with Meta's WhatsApp Cloud API.

    Usage:
        client = WhatsAppClient()
        client.send_template_message(
            to="263771234567",
            template_name="vehicle_approved",
            components=[
                {"type": "body", "parameters": [{"type": "text", "text": "Toyota Camry"}]}
            ]
        )
    """

    BASE_URL = "https://graph.facebook.com/v18.0"

    def __init__(self):
        self.phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', None)
        self.access_token = getattr(settings, 'WHATSAPP_ACCESS_TOKEN', None)
        self.verify_token = getattr(settings, 'WHATSAPP_VERIFY_TOKEN', None)
        self.enabled = bool(self.phone_number_id and self.access_token)

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    def _format_phone_number(self, phone: str) -> str:
        """Format phone number to international format (remove spaces, dashes, etc.)"""
        # Remove all non-digit characters except +
        formatted = ''.join(c for c in phone if c.isdigit() or c == '+')

        # Remove leading + if present
        if formatted.startswith('+'):
            formatted = formatted[1:]

        # Add country code if missing (assuming Zimbabwe 263)
        if not formatted.startswith('263'):
            if formatted.startswith('0'):
                formatted = '263' + formatted[1:]
            else:
                formatted = '263' + formatted

        return formatted

    def send_text_message(self, to: str, message: str) -> Optional[Dict[str, Any]]:
        """
        Send a simple text message.

        Args:
            to: Recipient phone number
            message: Text message to send

        Returns:
            API response dict or None if failed
        """
        if not self.enabled:
            logger.warning("WhatsApp integration is not configured")
            return None

        phone = self._format_phone_number(to)
        url = f"{self.BASE_URL}/{self.phone_number_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "text",
            "text": {"body": message}
        }

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            logger.info(f"WhatsApp message sent to {phone}: {result.get('messages', [{}])[0].get('id')}")
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send WhatsApp message to {phone}: {e}")
            return None

    def send_template_message(
        self,
        to: str,
        template_name: str,
        language_code: str = "en",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Send a pre-approved template message.

        Args:
            to: Recipient phone number
            template_name: Name of the approved template
            language_code: Language code (default: en)
            components: Template components with variables

        Returns:
            API response dict or None if failed
        """
        if not self.enabled:
            logger.warning("WhatsApp integration is not configured")
            return None

        phone = self._format_phone_number(to)
        url = f"{self.BASE_URL}/{self.phone_number_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
            }
        }

        if components:
            payload["template"]["components"] = components

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            logger.info(f"WhatsApp template '{template_name}' sent to {phone}")
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send WhatsApp template to {phone}: {e}")
            return None

    def send_interactive_button_message(
        self,
        to: str,
        header: Optional[str],
        body: str,
        footer: Optional[str],
        buttons: List[Dict[str, str]]
    ) -> Optional[Dict[str, Any]]:
        """
        Send an interactive message with buttons.

        Args:
            to: Recipient phone number
            header: Optional header text
            body: Main body text
            footer: Optional footer text
            buttons: List of buttons [{"id": "btn_1", "title": "View"}]

        Returns:
            API response dict or None if failed
        """
        if not self.enabled:
            logger.warning("WhatsApp integration is not configured")
            return None

        phone = self._format_phone_number(to)
        url = f"{self.BASE_URL}/{self.phone_number_id}/messages"

        # Build interactive action
        action = {
            "buttons": [
                {
                    "type": "reply",
                    "reply": {"id": btn["id"], "title": btn["title"][:20]}  # Max 20 chars
                }
                for btn in buttons[:3]  # Max 3 buttons
            ]
        }

        interactive = {
            "type": "button",
            "body": {"text": body},
            "action": action
        }

        if header:
            interactive["header"] = {"type": "text", "text": header}

        if footer:
            interactive["footer"] = {"text": footer}

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "interactive",
            "interactive": interactive
        }

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            logger.info(f"WhatsApp interactive message sent to {phone}")
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send WhatsApp interactive message to {phone}: {e}")
            return None

    def verify_webhook(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """
        Verify webhook subscription from Meta.

        Args:
            mode: Should be 'subscribe'
            token: Verification token from request
            challenge: Challenge string to return

        Returns:
            Challenge string if verified, None otherwise
        """
        if mode == "subscribe" and token == self.verify_token:
            return challenge
        return None


# Singleton instance
whatsapp_client = WhatsAppClient()


def send_whatsapp_notification(phone: str, message: str) -> bool:
    """
    Convenience function to send a WhatsApp notification.

    Args:
        phone: Recipient phone number
        message: Message to send

    Returns:
        True if sent successfully, False otherwise
    """
    result = whatsapp_client.send_text_message(phone, message)
    return result is not None
