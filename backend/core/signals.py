from django.dispatch import receiver
from .models import Profile, QuoteRequest, User
from django.db.models.signals import post_save
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# Add to vehicles/signals.py


@receiver(post_save, sender=QuoteRequest)
def handle_quote_request(sender, instance, created, **kwargs):
    if created:
        # Email to admin
        admin_subject = f"New Quote Request for {instance.vehicle}"
        admin_message = render_to_string('emails/new_quote_admin.html', {
            'quote': instance,
            'vehicle': instance.vehicle
        })
        send_mail(
            admin_subject,
            admin_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            html_message=admin_message,
            fail_silently=False
        )

        # Confirmation email to user
        user_subject = f"Quote Request Received for {instance.vehicle}"
        user_message = render_to_string('emails/quote_confirmation.html', {
            'quote': instance,
            'vehicle': instance.vehicle
        })
        send_mail(
            user_subject,
            user_message,
            settings.DEFAULT_FROM_EMAIL,
            [instance.email],
            html_message=user_message,
            fail_silently=False
        )
