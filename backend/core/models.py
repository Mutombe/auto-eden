# vehicles/models.py
from datetime import timezone
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.validators import EmailValidator, RegexValidator
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
    description = models.TextField(
        blank=True,
        null=True,
        default="No description provided"
    )
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
    
class WebsiteVisit(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=40, db_index=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    path = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()

class VehicleView(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='views')
    timestamp = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=40, db_index=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    ip_address = models.GenericIPAddressField()
    view_count = models.PositiveIntegerField(default=0)
    
    def increment_view_count(self):
        self.view_count = models.F('view_count') + 1
        self.save(update_fields=['view_count'])

import logging

logger = logging.getLogger(__name__)

class VehicleImage(models.Model):
    vehicle = models.ForeignKey(
        'Vehicle',  # Use string reference to avoid circular imports
        on_delete=models.CASCADE,
        related_name='images',
        null=True
    )
    image = models.ImageField(upload_to='vehicle_images/')

    def save(self, *args, **kwargs):
        """Override save to add debugging"""
        logger.info(f"Saving VehicleImage: {self.image.name if self.image else 'No image'}")
        
        if self.image:
            logger.info(f"Image file size: {self.image.size}")
            logger.info(f"Image storage: {self.image.storage}")
            
        try:
            super().save(*args, **kwargs)
            logger.info(f"VehicleImage saved successfully. Image URL: {self.image.url if self.image else 'No URL'}")
        except Exception as e:
            logger.error(f"Error saving VehicleImage: {e}")
            raise

    def __str__(self):
        return f"Image for {self.vehicle}" if self.vehicle else "Image (no vehicle)"

# Also add this to test direct upload
class TestUpload(models.Model):
    """Temporary model for testing uploads"""
    name = models.CharField(max_length=100)
    test_file = models.FileField(upload_to='test_uploads/')
    
    def save(self, *args, **kwargs):
        logger.info(f"Saving TestUpload: {self.name}")
        if self.test_file:
            logger.info(f"File: {self.test_file.name}, Size: {self.test_file.size}")
        super().save(*args, **kwargs)
        if self.test_file:
            logger.info(f"TestUpload saved. File URL: {self.test_file.url}")

    class Meta:
        verbose_name = "Test Upload"

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
    
class QuoteRequest(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('quoted', 'Quoted'),
        ('converted', 'Converted'),
        ('expired', 'Expired'),
    ]
    
    vehicle = models.ForeignKey(
        'Vehicle', 
        on_delete=models.CASCADE,
        related_name='quote_requests'
    )
    
    # Customer Information
    full_name = models.CharField(
        max_length=255,
        help_text="Customer's full name"
    )
    email = models.EmailField(
        validators=[EmailValidator()],
        help_text="Customer's email address"
    )
    country = models.CharField(
        max_length=100,
        help_text="Customer's country"
    )
    city = models.CharField(
        max_length=100,
        help_text="Customer's city"
    )
    address = models.TextField(
        blank=True,
        help_text="Customer's address (optional)"
    )
    telephone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^[\+]?[\d\s\-\(\)]{8,}$',
                message='Enter a valid phone number'
            )
        ],
        help_text="Customer's phone number with country code"
    )
    note = models.TextField(
        blank=True,
        help_text="Additional notes from customer"
    )
    
    # Tracking Information
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_processed = models.BooleanField(
        default=False,
        help_text="Whether this quote has been processed by admin"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of the quote request"
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium',
        help_text="Priority level of this quote"
    )
    
    # Admin fields
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal notes for admin use"
    )
    processed_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_quotes',
        help_text="Admin user who processed this quote"
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this quote was processed"
    )
    
    # Email tracking
    quote_email_sent = models.BooleanField(
        default=False,
        help_text="Whether quote email was sent successfully"
    )
    email_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the quote email was sent"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Quote Request"
        verbose_name_plural = "Quote Requests"
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['is_processed']),
        ]

    def __str__(self):
        return f"Quote #{self.id} - {self.vehicle} from {self.full_name}"
    
    @property
    def is_expired(self):
        """Check if quote is expired (24 hours)"""
        from django.utils import timezone
        from datetime import timedelta
        return timezone.now() > self.created_at + timedelta(hours=24)
    
    @property
    def time_remaining(self):
        """Get remaining time for quote validity"""
        from django.utils import timezone
        from datetime import timedelta
        if self.is_expired:
            return None
        return (self.created_at + timedelta(hours=24)) - timezone.now()
    
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