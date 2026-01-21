# core/integrations/whatsapp_templates.py
"""
WhatsApp message templates for various notification types.
Templates must be pre-approved by Meta before use.
"""
from typing import Optional
from .whatsapp import whatsapp_client
import logging

logger = logging.getLogger(__name__)


def notify_vehicle_approved_whatsapp(phone: str, vehicle_make: str, vehicle_model: str, vehicle_id: int) -> bool:
    """
    Notify user via WhatsApp that their vehicle has been approved.

    Template: vehicle_approved
    Variables: {{1}} = vehicle make/model
    """
    message = (
        f"*Auto Eden* - Vehicle Approved!\n\n"
        f"Great news! Your *{vehicle_make} {vehicle_model}* has been verified and is now live on our marketplace.\n\n"
        f"View your listing: https://autoeden.co.zw/vehicle/{vehicle_id}\n\n"
        f"Thank you for choosing Auto Eden!"
    )

    result = whatsapp_client.send_text_message(phone, message)
    return result is not None


def notify_vehicle_rejected_whatsapp(phone: str, vehicle_make: str, vehicle_model: str, reason: str) -> bool:
    """
    Notify user via WhatsApp that their vehicle has been rejected.

    Template: vehicle_rejected
    Variables: {{1}} = vehicle make/model, {{2}} = reason
    """
    message = (
        f"*Auto Eden* - Vehicle Review Update\n\n"
        f"Unfortunately, your *{vehicle_make} {vehicle_model}* could not be approved at this time.\n\n"
        f"*Reason:* {reason}\n\n"
        f"Please update your listing and resubmit. If you have questions, contact us at +263782222032."
    )

    result = whatsapp_client.send_text_message(phone, message)
    return result is not None


def notify_new_bid_whatsapp(phone: str, vehicle_make: str, vehicle_model: str, bid_amount: float, bidder_name: str) -> bool:
    """
    Notify vehicle owner of a new bid via WhatsApp.

    Template: new_bid
    Variables: {{1}} = vehicle, {{2}} = amount, {{3}} = bidder
    """
    message = (
        f"*Auto Eden* - New Bid Received!\n\n"
        f"You have received a new bid on your *{vehicle_make} {vehicle_model}*.\n\n"
        f"*Bid Amount:* ${bid_amount:,.2f}\n"
        f"*From:* {bidder_name}\n\n"
        f"Log in to your dashboard to review and respond."
    )

    result = whatsapp_client.send_text_message(phone, message)
    return result is not None


def notify_quote_ready_whatsapp(phone: str, customer_name: str, vehicle_make: str, vehicle_model: str, quote_id: int) -> bool:
    """
    Notify customer that their quote is ready via WhatsApp.

    Template: quote_ready
    Variables: {{1}} = customer name, {{2}} = vehicle, {{3}} = quote id
    """
    message = (
        f"*Auto Eden* - Your Quote is Ready!\n\n"
        f"Hi {customer_name},\n\n"
        f"Your personalized quote for the *{vehicle_make} {vehicle_model}* is ready.\n\n"
        f"*Quote ID:* QT-{quote_id:06d}\n\n"
        f"Check your email for the full quotation PDF, or contact us at +263782222032 for more details."
    )

    result = whatsapp_client.send_text_message(phone, message)
    return result is not None


def notify_search_match_whatsapp(phone: str, vehicle_make: str, vehicle_model: str, vehicle_year: int, vehicle_price: float, vehicle_id: int) -> bool:
    """
    Notify user when a vehicle matching their search is listed.

    Template: search_match
    Variables: {{1}} = vehicle details
    """
    message = (
        f"*Auto Eden* - Vehicle Match Found!\n\n"
        f"A vehicle matching your search criteria has been listed:\n\n"
        f"*{vehicle_year} {vehicle_make} {vehicle_model}*\n"
        f"*Price:* ${vehicle_price:,.2f}\n\n"
        f"View it now: https://autoeden.co.zw/vehicle/{vehicle_id}"
    )

    result = whatsapp_client.send_text_message(phone, message)
    return result is not None


def send_support_message_whatsapp(phone: str, message: str) -> bool:
    """
    Send a custom support message via WhatsApp.
    """
    formatted_message = (
        f"*Auto Eden Support*\n\n"
        f"{message}\n\n"
        f"Need help? Contact us at admin@autoeden.co.zw or +263782222032"
    )

    result = whatsapp_client.send_text_message(phone, formatted_message)
    return result is not None


def send_welcome_message_whatsapp(phone: str, username: str) -> bool:
    """
    Send a welcome message to new users.
    """
    message = (
        f"*Welcome to Auto Eden!*\n\n"
        f"Hi {username},\n\n"
        f"Thank you for joining Auto Eden - Zimbabwe's premier vehicle marketplace.\n\n"
        f"With us, you can:\n"
        f"- List your vehicle for sale\n"
        f"- Browse verified vehicles\n"
        f"- Get instant quotes\n"
        f"- Connect with buyers/sellers\n\n"
        f"Visit https://autoeden.co.zw to get started!"
    )

    result = whatsapp_client.send_text_message(phone, message)
    return result is not None


# Integration with notification preferences
def send_whatsapp_if_enabled(user, notification_type: str, **kwargs) -> bool:
    """
    Send WhatsApp notification if user has it enabled.

    Args:
        user: User object
        notification_type: Type of notification to send
        **kwargs: Additional arguments for the notification

    Returns:
        True if sent, False otherwise
    """
    try:
        prefs = user.notification_preferences
        if not prefs.whatsapp_enabled or not prefs.whatsapp_number:
            return False

        phone = prefs.whatsapp_number

        if notification_type == 'vehicle_approved':
            return notify_vehicle_approved_whatsapp(
                phone,
                kwargs.get('vehicle_make', ''),
                kwargs.get('vehicle_model', ''),
                kwargs.get('vehicle_id', 0)
            )
        elif notification_type == 'vehicle_rejected':
            return notify_vehicle_rejected_whatsapp(
                phone,
                kwargs.get('vehicle_make', ''),
                kwargs.get('vehicle_model', ''),
                kwargs.get('reason', '')
            )
        elif notification_type == 'new_bid':
            return notify_new_bid_whatsapp(
                phone,
                kwargs.get('vehicle_make', ''),
                kwargs.get('vehicle_model', ''),
                kwargs.get('bid_amount', 0),
                kwargs.get('bidder_name', '')
            )
        elif notification_type == 'quote_ready':
            return notify_quote_ready_whatsapp(
                phone,
                kwargs.get('customer_name', ''),
                kwargs.get('vehicle_make', ''),
                kwargs.get('vehicle_model', ''),
                kwargs.get('quote_id', 0)
            )
        elif notification_type == 'search_match':
            return notify_search_match_whatsapp(
                phone,
                kwargs.get('vehicle_make', ''),
                kwargs.get('vehicle_model', ''),
                kwargs.get('vehicle_year', 0),
                kwargs.get('vehicle_price', 0),
                kwargs.get('vehicle_id', 0)
            )
        else:
            logger.warning(f"Unknown notification type: {notification_type}")
            return False

    except Exception as e:
        logger.error(f"Failed to send WhatsApp notification: {e}")
        return False
