"""
WebSocket consumers for Auto Eden real-time functionality.
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)
User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications."""

    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        # Create a unique channel group for this user
        self.room_group_name = f"notifications_{self.user.id}"

        # Join user notification group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"WebSocket connected for user: {self.user.username}")

        # Send initial connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to notification service'
        }))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        logger.info(f"WebSocket disconnected for user: {getattr(self, 'user', 'unknown')}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
            elif message_type == 'mark_read':
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
        except json.JSONDecodeError:
            logger.error("Invalid JSON received in WebSocket")

    async def notification_message(self, event):
        """Send notification to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))

    async def stats_update(self, event):
        """Send stats update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'stats_update',
            'stats': event['stats']
        }))

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a notification as read."""
        from .models import Notification
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.is_read = True
            notification.save()
        except Notification.DoesNotExist:
            pass


class DashboardStatsConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time dashboard statistics."""

    async def connect(self):
        """Handle WebSocket connection for dashboard stats."""
        self.user = self.scope["user"]

        if self.user.is_anonymous or not self.user.is_staff:
            await self.close()
            return

        # Admin dashboard group
        self.room_group_name = "admin_dashboard"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial stats
        stats = await self.get_dashboard_stats()
        await self.send(text_data=json.dumps({
            'type': 'initial_stats',
            'stats': stats
        }))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'refresh_stats':
                stats = await self.get_dashboard_stats()
                await self.send(text_data=json.dumps({
                    'type': 'stats_update',
                    'stats': stats
                }))
        except json.JSONDecodeError:
            logger.error("Invalid JSON received in WebSocket")

    async def dashboard_update(self, event):
        """Broadcast dashboard update."""
        await self.send(text_data=json.dumps({
            'type': 'stats_update',
            'stats': event['stats']
        }))

    @database_sync_to_async
    def get_dashboard_stats(self):
        """Get current dashboard statistics."""
        from .models import Vehicle, Bid, VehicleView, WebsiteVisit
        from django.db.models import Count, Sum
        from datetime import timedelta
        from django.utils import timezone

        thirty_days_ago = timezone.now() - timedelta(days=30)

        stats = {
            'total_vehicles': Vehicle.objects.count(),
            'pending_vehicles': Vehicle.objects.filter(verification_state='pending').count(),
            'verified_vehicles': Vehicle.objects.filter(verification_state='physical').count(),
            'rejected_vehicles': Vehicle.objects.filter(verification_state='rejected').count(),
            'total_bids': Bid.objects.count(),
            'pending_bids': Bid.objects.filter(status='pending').count(),
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'marketplace_visits': WebsiteVisit.objects.filter(
                visited_at__gte=thirty_days_ago
            ).count(),
            'vehicle_views': VehicleView.objects.filter(
                viewed_at__gte=thirty_days_ago
            ).count(),
        }

        return stats


# Utility functions for sending notifications
async def send_user_notification(user_id, notification_data):
    """Send a notification to a specific user via WebSocket."""
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()

    await channel_layer.group_send(
        f"notifications_{user_id}",
        {
            'type': 'notification_message',
            'notification': notification_data
        }
    )


async def broadcast_dashboard_update(stats):
    """Broadcast dashboard stats update to all admin users."""
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()

    await channel_layer.group_send(
        "admin_dashboard",
        {
            'type': 'dashboard_update',
            'stats': stats
        }
    )
