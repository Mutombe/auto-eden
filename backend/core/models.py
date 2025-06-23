# vehicles/models.py
from datetime import timezone
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
from model_utils import FieldTracker

User = get_user_model()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=15, blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('approval', 'Vehicle Approval'),
        ('rejection', 'Vehicle Rejection'),
        ('registration', 'New Registration'),
        ('instant_sale', 'Instant Sale Upload'),
        ('bid', 'New Bid'),
        ('admin_alert', 'Admin Alert'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.user.username}"

class Vehicle(models.Model):
    VERIFICATION_STATES = (
        ('pending', 'Pending'),
        ('digital', 'Digitally Verified'),
        ('physical', 'Physically Verified'),
        ('rejected', 'Rejected'),
    )
    
    LISTING_TYPE = (
        ('marketplace', 'Marketplace'),
        ('instant_sale', 'Instant Sale'),
    )

    is_digitally_verified = models.BooleanField(default=False)
    is_physically_verified = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Add verification metadata
    digitally_verified_by = models.ForeignKey(
        User, 
        null=True, 
        blank=True,
        related_name='digital_verifications',
        on_delete=models.SET_NULL
    )
    digitally_verified_at = models.DateTimeField(null=True, blank=True)
    physically_verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name='physical_verifications',
        on_delete=models.SET_NULL
    )
    physically_verified_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    vin = models.CharField(
        max_length=17,
        unique=True,
        db_index=True,  # Add index for VIN lookups
        help_text="Vehicle Identification Number"
    )
    
    location = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        default=None,  # Better than "None" string
        db_index=True  # If you frequently filter by location
    )
    
    # Consider using PositiveIntegerField for year
    year = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1900),
            MaxValueValidator(timezone.now().year + 1)
        ]
    )
    mileage = models.PositiveIntegerField(
        help_text="Current vehicle mileage in kilometers"
    )
    proposed_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name="Asking Price",
        help_text="Price you expect for instant sale",
        blank=True,
        null=True
    ) # For instant sale
    is_visible = models.BooleanField(default=True)
    verification_state = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATES,
        default='pending',
        db_index=True
    )
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE)
    fuel_type = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # For marketplace
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tracker = FieldTracker()

    class Meta:
        indexes = [
            models.Index(fields=['is_digitally_verified', 'is_physically_verified']),
            models.Index(fields=['listing_type', 'is_visible']),
            models.Index(fields=['make', 'model']),
            models.Index(fields=['price']),
            models.Index(fields=['created_at']),
        ]

        constraints = [
            # Ensure only one verification state is active
            models.CheckConstraint(
                check=~models.Q(verification_state='rejected') | models.Q(rejection_reason__isnull=False),
                name='rejection_requires_reason'
            ),
            # Validate price based on listing type
            models.CheckConstraint(
                check=(
                    models.Q(listing_type='marketplace', price__isnull=False) |
                    models.Q(listing_type='instant_sale', proposed_price__isnull=False)
                ),
                name='valid_pricing_for_listing_type'
            )
        ]
        ordering = ['-created_at']

    def __str__(self):
        return self.make

class VehicleImage(models.Model):
    vehicle = models.ForeignKey(
        Vehicle, 
        on_delete=models.CASCADE,
        related_name='images',
        null=True
    )
    image = models.ImageField(upload_to='vehicle_images/')

    def __str__(self):
        return f"Image for {self.vehicle}"
    
class QuoteRequest(models.Model):
    vehicle = models.ForeignKey(
        Vehicle, 
        on_delete=models.CASCADE,
        related_name='quote_requests'
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()
    telephone = models.CharField(max_length=20)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"Quote request for {self.vehicle} from {self.full_name}"

class Bid(models.Model):
    BID_STATUS = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(default="No message provided", blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=BID_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} bid for {self.vehicle}"
    
class VehicleSearch(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('matched', 'Matched'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    min_year = models.PositiveIntegerField()
    max_year = models.PositiveIntegerField()
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_mileage = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    last_matched = models.DateTimeField(null=True, blank=True)
    match_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s search for {self.make} {self.model}"

    class Meta:
        verbose_name_plural = "Vehicle Searches"