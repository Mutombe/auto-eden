# core/notification_views.py
"""
Views for handling user notifications.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from .models import Notification
from rest_framework.pagination import PageNumberPagination


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'message',
            'related_object_id',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['notification_type', 'message', 'related_object_id', 'created_at']


class NotificationPagination(PageNumberPagination):
    """Pagination for notifications."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination

    def get_queryset(self):
        """Return notifications for the current user."""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def destroy(self, request, *args, **kwargs):
        """Delete a notification."""
        notification = self.get_object()
        if notification.user != request.user:
            return Response(
                {"detail": "You can only delete your own notifications"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def read_all(self, request):
        """Mark all notifications as read."""
        updated = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({
            'detail': f'{updated} notifications marked as read',
            'updated_count': updated
        })

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Delete all read notifications."""
        deleted, _ = Notification.objects.filter(
            user=request.user,
            is_read=True
        ).delete()
        return Response({
            'detail': f'{deleted} notifications deleted',
            'deleted_count': deleted
        })


def create_notification(user, notification_type, message, related_object_id=None):
    """
    Helper function to create notifications.

    Args:
        user: User to notify
        notification_type: Type of notification (approval, rejection, bid, etc.)
        message: Notification message
        related_object_id: ID of related object (vehicle, bid, etc.)

    Returns:
        Created Notification object
    """
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        message=message,
        related_object_id=related_object_id,
    )

    # Send real-time notification via WebSocket if available
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{user.id}",
                {
                    "type": "notification_message",
                    "notification": {
                        "id": notification.id,
                        "type": notification_type,
                        "message": message,
                        "related_object_id": related_object_id,
                        "is_read": False,
                        "created_at": notification.created_at.isoformat(),
                    }
                }
            )
    except Exception as e:
        # WebSocket notification failed, but database notification was created
        import logging
        logging.getLogger(__name__).warning(f"WebSocket notification failed: {e}")

    return notification


def notify_vehicle_approved(vehicle):
    """Send notification when a vehicle is approved."""
    message = f"Your {vehicle.make} {vehicle.model} has been approved and is now live on the marketplace!"
    return create_notification(
        user=vehicle.owner,
        notification_type='approval',
        message=message,
        related_object_id=vehicle.id
    )


def notify_vehicle_rejected(vehicle, reason):
    """Send notification when a vehicle is rejected."""
    message = f"Your {vehicle.make} {vehicle.model} was not approved. Reason: {reason}"
    return create_notification(
        user=vehicle.owner,
        notification_type='rejection',
        message=message,
        related_object_id=vehicle.id
    )


def notify_new_bid(bid):
    """Send notification when a new bid is placed on a vehicle."""
    vehicle = bid.vehicle
    message = f"New bid of ${bid.amount:,.2f} on your {vehicle.make} {vehicle.model}"
    return create_notification(
        user=vehicle.owner,
        notification_type='bid',
        message=message,
        related_object_id=bid.id
    )


def notify_bid_accepted(bid):
    """Send notification when a bid is accepted."""
    message = f"Your bid of ${bid.amount:,.2f} on {bid.vehicle.make} {bid.vehicle.model} has been accepted!"
    return create_notification(
        user=bid.bidder,
        notification_type='bid',
        message=message,
        related_object_id=bid.id
    )


def notify_admin_alert(user, message, related_object_id=None):
    """Send admin alert notification."""
    return create_notification(
        user=user,
        notification_type='admin_alert',
        message=message,
        related_object_id=related_object_id
    )
