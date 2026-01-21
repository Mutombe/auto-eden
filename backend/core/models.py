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

    # Email verification fields
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, null=True, blank=True)

    # Password reset fields
    password_reset_token = models.CharField(max_length=64, null=True, blank=True)
    password_reset_expires = models.DateTimeField(null=True, blank=True)

    # OAuth fields
    google_id = models.CharField(max_length=255, null=True, blank=True, unique=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.user.username

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
    mileage = models.CharField(
        max_length=20,
        blank=True,
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
    transmission = models.CharField(max_length=10, blank=True, null=True)
    body_type = models.CharField(max_length=50, blank=True, null=True)
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
    
class NotificationPreference(models.Model):
    """User notification preferences for email, push, and WhatsApp notifications."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')

    # Email preferences
    email_vehicle_approved = models.BooleanField(default=True, help_text="Email when vehicle is approved/rejected")
    email_new_bid = models.BooleanField(default=True, help_text="Email when new bid is received")
    email_quote_ready = models.BooleanField(default=True, help_text="Email when quote is ready")

    # Push notifications
    push_enabled = models.BooleanField(default=False, help_text="Enable browser push notifications")

    # WhatsApp notifications
    whatsapp_enabled = models.BooleanField(default=False, help_text="Enable WhatsApp notifications")
    whatsapp_number = models.CharField(max_length=20, null=True, blank=True, help_text="WhatsApp phone number")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notification preferences for {self.user.username}"

    class Meta:
        verbose_name = "Notification Preference"
        verbose_name_plural = "Notification Preferences"


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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    last_matched = models.DateTimeField(null=True, blank=True)
    match_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s search for {self.make} {self.model}"

    class Meta:
        verbose_name_plural = "Vehicle Searches"


class ExportConfiguration(models.Model):
    """User's saved export configurations."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='export_configurations')
    name = models.CharField(max_length=100, help_text="Name for this export configuration")
    columns = models.JSONField(default=list, help_text="List of columns to include in export")
    export_type = models.CharField(max_length=20, default='vehicles', help_text="Type of data to export")
    is_default = models.BooleanField(default=False, help_text="Whether this is the default configuration")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    class Meta:
        verbose_name = "Export Configuration"
        verbose_name_plural = "Export Configurations"
        ordering = ['-created_at']


class ExportLog(models.Model):
    """Log of user exports for analytics and auditing."""
    EXPORT_TYPES = (
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('pdf', 'PDF'),
    )

    DATA_TYPES = (
        ('vehicles', 'Vehicles'),
        ('bids', 'Bids'),
        ('users', 'Users'),
        ('quotes', 'Quotes'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='export_logs')
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPES)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES, default='vehicles')
    record_count = models.PositiveIntegerField()
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text="File size in bytes")
    filters_applied = models.JSONField(default=dict, blank=True, help_text="Filters used for this export")
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} exported {self.record_count} {self.data_type} ({self.export_type})"

    class Meta:
        verbose_name = "Export Log"
        verbose_name_plural = "Export Logs"
        ordering = ['-created_at']


# Static Pages Models

class Inquiry(models.Model):
    """Contact form and general inquiries."""
    INQUIRY_TYPES = (
        ('contact', 'Contact'),
        ('quote', 'Quote Request'),
        ('support', 'Support'),
        ('feedback', 'Feedback'),
        ('partnership', 'Partnership'),
    )

    STATUS_CHOICES = (
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )

    type = models.CharField(max_length=20, choices=INQUIRY_TYPES, default='contact')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()

    # Admin handling
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_inquiries')
    response = models.TextField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.type}: {self.subject or self.name} ({self.status})"

    class Meta:
        verbose_name = "Inquiry"
        verbose_name_plural = "Inquiries"
        ordering = ['-created_at']


class JobPosition(models.Model):
    """Job positions for the careers page."""
    DEPARTMENT_CHOICES = (
        ('sales', 'Sales'),
        ('operations', 'Operations'),
        ('marketing', 'Marketing'),
        ('tech', 'Technology'),
        ('admin', 'Administration'),
        ('customer_service', 'Customer Service'),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    location = models.CharField(max_length=100, default='Harare, Zimbabwe')
    employment_type = models.CharField(max_length=50, default='Full-time')
    description = models.TextField()
    requirements = models.TextField()
    responsibilities = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.department})"

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
            # Ensure unique slug
            original_slug = self.slug
            counter = 1
            while JobPosition.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Job Position"
        verbose_name_plural = "Job Positions"
        ordering = ['-created_at']


class JobApplication(models.Model):
    """Applications for job positions."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('interviewed', 'Interviewed'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    )

    position = models.ForeignKey(JobPosition, on_delete=models.CASCADE, related_name='applications')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Admin notes
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_applications')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.position.title}"

    class Meta:
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"
        ordering = ['-created_at']


class Article(models.Model):
    """News articles and blog posts."""
    CATEGORY_CHOICES = (
        ('news', 'News'),
        ('tips', 'Tips & Guides'),
        ('industry', 'Industry Updates'),
        ('company', 'Company News'),
        ('market', 'Market Analysis'),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    excerpt = models.TextField(max_length=500, help_text="Short summary for listings")
    content = models.TextField()
    featured_image = models.ImageField(upload_to='articles/', null=True, blank=True)

    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='articles')
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    # SEO
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    # Stats
    view_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Article"
        verbose_name_plural = "Articles"
        ordering = ['-published_at', '-created_at']


class Report(models.Model):
    """User reports for vehicles, users, or content."""
    REPORT_TYPES = (
        ('vehicle', 'Vehicle'),
        ('user', 'User'),
        ('scam', 'Scam'),
        ('content', 'Content'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )

    type = models.CharField(max_length=20, choices=REPORT_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reporter = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports_made')
    reporter_email = models.EmailField(blank=True, help_text="For anonymous reports")

    # What's being reported
    reported_vehicle = models.ForeignKey(Vehicle, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports')
    reported_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports_against')

    reason = models.TextField()
    evidence = models.JSONField(default=list, blank=True, help_text="List of image URLs or descriptions")

    # Admin handling
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports_resolved')
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type} report: {self.reason[:50]}..."

    class Meta:
        verbose_name = "Report"
        verbose_name_plural = "Reports"
        ordering = ['-created_at']


class SellerReview(models.Model):
    """Reviews for vehicle sellers."""
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    vehicle = models.ForeignKey(Vehicle, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviews')

    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    title = models.CharField(max_length=100, blank=True)
    comment = models.TextField()

    # Verification
    is_verified_purchase = models.BooleanField(default=False, help_text="Reviewer bought a vehicle from this seller")

    # Helpful votes
    helpful_count = models.PositiveIntegerField(default=0)

    # Moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.reviewer.username} -> {self.seller.username}: {self.rating} stars"

    class Meta:
        verbose_name = "Seller Review"
        verbose_name_plural = "Seller Reviews"
        ordering = ['-created_at']
        unique_together = ['seller', 'reviewer', 'vehicle']  # One review per transaction


class SellerBadge(models.Model):
    """Badges earned by sellers for achievements."""
    BADGE_TYPES = (
        ('verified', 'Verified Seller'),
        ('top_rated', 'Top Rated'),
        ('quick_responder', 'Quick Responder'),
        ('trusted', 'Trusted Seller'),
        ('super_seller', 'Super Seller'),
        ('premium', 'Premium Partner'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPES)
    awarded_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_badge_type_display()}"

    class Meta:
        verbose_name = "Seller Badge"
        verbose_name_plural = "Seller Badges"
        unique_together = ['user', 'badge_type']


class VehicleDraft(models.Model):
    """Draft vehicle listings that can be saved and resumed later."""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicle_drafts')

    # Draft data stored as JSON
    data = models.JSONField(default=dict, help_text="Vehicle form data")
    images = models.JSONField(default=list, help_text="List of uploaded image URLs")

    # Progress tracking
    step = models.PositiveIntegerField(default=1, help_text="Current form step (1-5)")
    is_complete = models.BooleanField(default=False)

    # Draft title for easy identification
    draft_title = models.CharField(max_length=100, blank=True, help_text="Auto-generated from make/model if available")

    # Expiration
    expires_at = models.DateTimeField(help_text="Draft will be auto-deleted after this date")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate draft title
        if not self.draft_title and self.data:
            make = self.data.get('make', '')
            model = self.data.get('model', '')
            year = self.data.get('year', '')
            if make or model:
                self.draft_title = f"{year} {make} {model}".strip()

        # Set default expiration (30 days from creation)
        if not self.expires_at:
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=30)

        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at if self.expires_at else False

    @property
    def completion_percentage(self):
        """Calculate how complete the draft is based on filled fields."""
        required_fields = ['make', 'model', 'year', 'price', 'mileage', 'description']
        if not self.data:
            return 0
        filled = sum(1 for f in required_fields if self.data.get(f))
        return int((filled / len(required_fields)) * 100)

    def __str__(self):
        return f"Draft: {self.draft_title or 'Untitled'} ({self.completion_percentage}%)"

    class Meta:
        verbose_name = "Vehicle Draft"
        verbose_name_plural = "Vehicle Drafts"
        ordering = ['-updated_at']