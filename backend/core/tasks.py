# vehicles/tasks.py
import logging
import threading

from django.db import connection

from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Vehicle

logger = logging.getLogger(__name__)


def run_in_background(task, *args, **kwargs):
    """Run a Celery task in a background thread.

    Production has no Celery broker/worker, so `.delay()` blocks on the broker and then
    errors. Running the task locally in a thread keeps API responses fast and never
    lets an email failure break the request.
    """
    def _run():
        try:
            task.apply(args=args, kwargs=kwargs)
        except Exception:
            logger.exception("Background task %s failed", task.name)
        finally:
            # Threads outside the request cycle must release their DB connection themselves.
            connection.close()

    threading.Thread(target=_run, daemon=True).start()

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