# vehicles/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Vehicle

@shared_task(bind=True, max_retries=3)
def send_vehicle_approved_email(self, vehicle_id, verification_type=None):  # Add parameter here
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
        subject = f"Your {vehicle.make} {vehicle.model} has been {verification_type}ly approved" if verification_type else f"Your {vehicle.make} {vehicle.model} has been approved"
        html_message = render_to_string('emails/vehicle_approved.html', {
            'vehicle': vehicle,
            'verification_type': verification_type  # Pass to template if needed
        })
        send_mail(
            subject,
            strip_tags(html_message),
            settings.DEFAULT_FROM_EMAIL,
            [vehicle.owner.email],
            html_message=html_message,
            fail_silently=False
        )
    except Vehicle.DoesNotExist as exc:
        self.retry(exc=exc, countdown=60)

@shared_task(bind=True, max_retries=3)
def send_vehicle_rejected_email(self, vehicle_id, reason):
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
        subject = f"Your {vehicle.make} {vehicle.model} listing needs changes"
        html_message = render_to_string('emails/vehicle_rejected.html', {
            'vehicle': vehicle,
            'reason': reason
        })
        send_mail(
            subject,
            strip_tags(html_message),
            settings.DEFAULT_FROM_EMAIL,
            [vehicle.owner.email],
            html_message=html_message,
            fail_silently=False
        )
    except Vehicle.DoesNotExist as exc:
        self.retry(exc=exc, countdown=60)