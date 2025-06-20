from django.dispatch import receiver
from .models import Profile, QuoteRequest, User, Vehicle, VehicleSearch, Bid
from django.db.models.signals import post_save
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.html import strip_tags
from django.db import models


# New Vehicle Notification
@receiver(post_save, sender=Vehicle)
def handle_new_vehicle(sender, instance, created, **kwargs):
    if created:
        # Email to admin
        admin_subject = f"New Vehicle Listing: {instance.make} {instance.model} ({instance.year})"
        admin_message = render_to_string('emails/new_vehicle_admin.html', {
            'vehicle': instance
        })
        send_mail(
            admin_subject,
            admin_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            html_message=admin_message,
            fail_silently=False
        )

# New Bid Notification
@receiver(post_save, sender=Bid)
def handle_new_bid(sender, instance, created, **kwargs):
    if created:
        # Email to admin
        admin_subject = f"New Bid for {instance.vehicle}"
        admin_message = render_to_string('emails/new_bid_admin.html', {
            'bid': instance
        })
        send_mail(
            admin_subject,
            admin_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            html_message=admin_message,
            fail_silently=False
        )

@receiver(post_save, sender=Vehicle)
def check_vehicle_matches(sender, instance, created, **kwargs):
    # Initialize matching_searches as an empty queryset
    matching_searches = VehicleSearch.objects.none()

    # Only process marketplace vehicles with a price
    if instance.listing_type == 'marketplace' and instance.price is not None:
        matching_searches = VehicleSearch.objects.filter(
            make__iexact=instance.make,
            model__iexact=instance.model,
            min_year__lte=instance.year,
            max_year__gte=instance.year,
            max_price__gte=instance.price,
            max_mileage__gte=instance.mileage,
            status='active'
        )

    # Process matches (this will work even if matching_searches is empty)
    for search in matching_searches:
        # Update search status
        search.match_count += 1
        search.last_matched = timezone.now()
        search.status = 'matched'
        search.save()

        # Email to user
        user_subject = f"New Match: {instance.make} {instance.model} ({instance.year})"
        user_message = render_to_string('emails/vehicle_search_match.html', {
            'search': search,
            'vehicle': instance,
            'user': search.user
        })
        
        send_mail(
            user_subject,
            strip_tags(user_message),
            settings.DEFAULT_FROM_EMAIL,
            [search.user.email],
            html_message=user_message,
            fail_silently=False
        )

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


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
