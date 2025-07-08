from django.dispatch import receiver
from .models import Notification, Profile, QuoteRequest, User, Vehicle, VehicleSearch, Bid
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.html import strip_tags
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.core.cache import cache
from .models import Vehicle

@receiver([post_save, post_delete], sender=Vehicle)
def invalidate_vehicle_cache(sender, instance, **kwargs):
    keys = cache.keys('marketplace_*')
    cache.delete_many(keys)

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
            settings.ADMIN_EMAIL,
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
            settings.ADMIN_EMAIL,
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
            settings.ADMIN_EMAIL,
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

@receiver(post_save, sender=User)
def handle_new_user_registration(sender, instance, created, **kwargs):
    if created:
        # Email to admin
        admin_subject = f"New User Registration: {instance.email}"
        admin_message = render_to_string('emails/new_user_admin.html', {
            'user': instance
        })
        send_mail(
            admin_subject,
            strip_tags(admin_message),
            settings.DEFAULT_FROM_EMAIL,
            settings.ADMIN_EMAIL,
            html_message=admin_message,
            fail_silently=False
        )

        # Welcome email to user
        user_subject = "Welcome to Our Platform"
        user_message = render_to_string('emails/welcome_user.html', {
            'user': instance
        })
        send_mail(
            user_subject,
            strip_tags(user_message),
            settings.DEFAULT_FROM_EMAIL,
            [instance.email],
            html_message=user_message,
            fail_silently=False
        )

        # Create notification
        Notification.objects.create(
            user=instance,
            notification_type='registration',
            message=f"Welcome to our platform! Your account has been successfully created."
        )

# 2. Vehicle Deletion Signal
@receiver(models.signals.post_delete, sender=Vehicle)
def handle_vehicle_deletion(sender, instance, **kwargs):
    # Email to admin
    admin_subject = f"Vehicle Deleted: {instance.make} {instance.model} ({instance.year})"
    admin_message = render_to_string('emails/vehicle_deleted_admin.html', {
        'vehicle': instance
    })
    send_mail(
        admin_subject,
        strip_tags(admin_message),
        settings.DEFAULT_FROM_EMAIL,
        settings.ADMIN_EMAIL,
        html_message=admin_message,
        fail_silently=False
    )

    # Email to owner if vehicle was verified
    if instance.verification_state in ['digital', 'physical']:
        owner_subject = f"Your Vehicle Listing Has Been Removed"
        owner_message = render_to_string('emails/vehicle_deleted_owner.html', {
            'vehicle': instance,
            'user': instance.owner
        })
        send_mail(
            owner_subject,
            strip_tags(owner_message),
            settings.DEFAULT_FROM_EMAIL,
            [instance.owner.email],
            html_message=owner_message,
            fail_silently=False
        )

# 3. User Deletion Signal
@receiver(models.signals.post_delete, sender=User)
def handle_user_deletion(sender, instance, **kwargs):
    # Email to admin
    admin_subject = f"User Account Deleted: {instance.email}"
    admin_message = render_to_string('emails/user_deleted_admin.html', {
        'user': instance
    })
    send_mail(
        admin_subject,
        strip_tags(admin_message),
        settings.DEFAULT_FROM_EMAIL,
        settings.ADMIN_EMAIL,
        html_message=admin_message,
        fail_silently=False
    )

# 4. Vehicle Edited Signal
@receiver(models.signals.post_save, sender=Vehicle)
def handle_vehicle_edited(sender, instance, created, **kwargs):
    if not created and instance.tracker.changed(): 
        changed_fields = instance.tracker.changed()
        
        # Email to admin
        admin_subject = f"Vehicle Edited: {instance.make} {instance.model} ({instance.year})"
        admin_message = render_to_string('emails/vehicle_edited_admin.html', {
            'vehicle': instance,
            'changes': changed_fields
        })
        send_mail(
            admin_subject,
            strip_tags(admin_message),
            settings.DEFAULT_FROM_EMAIL,
            settings.ADMIN_EMAIL,
            html_message=admin_message,
            fail_silently=False
        )

        # Email to owner if significant changes were made
        significant_fields = ['price', 'mileage', 'verification_state']
        if any(field in changed_fields for field in significant_fields):
            owner_subject = f"Your Vehicle Listing Has Been Updated"
            owner_message = render_to_string('emails/vehicle_edited_owner.html', {
                'vehicle': instance,
                'user': instance.owner,
                'changes': {k: v for k, v in changed_fields.items() if k in significant_fields}
            })
            send_mail(
                owner_subject,
                strip_tags(owner_message),
                settings.DEFAULT_FROM_EMAIL,
                [instance.owner.email],
                html_message=owner_message,
                fail_silently=False
            )

# 5. Vehicle Physical Verification Signal
@receiver(models.signals.post_save, sender=Vehicle)
def handle_vehicle_physical_verification(sender, instance, created, **kwargs):
    if not created and instance.tracker.has_changed('verification_state') and instance.verification_state == 'physical':
        # Email to owner
        owner_subject = f"Your Vehicle Has Been Physically Verified!"
        owner_message = render_to_string('emails/vehicle_physically_verified.html', {
            'vehicle': instance,
            'user': instance.owner
        })
        send_mail(
            owner_subject,
            strip_tags(owner_message),
            settings.DEFAULT_FROM_EMAIL,
            [instance.owner.email],
            html_message=owner_message,
            fail_silently=False
        )

        # Create notification
        Notification.objects.create(
            user=instance.owner,
            notification_type='approval',
            message=f"Your {instance.make} {instance.model} has been physically verified and is now live on our marketplace!",
            related_object_id=instance.id
        )
