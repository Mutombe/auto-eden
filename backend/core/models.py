# vehicles/models.py
from datetime import timezone
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

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
    VEHICLE_STATUS = (
        ('pending', 'Pending'),
        ('digitally_verified', 'Digitally Verified'),
        ('physically_verified', 'Physically Verified'),
        ('rejected', 'Rejected'),
    )
    
    LISTING_TYPE = (
        ('marketplace', 'Marketplace'),
        ('instant_sale', 'Instant Sale'),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    vin = models.CharField(
        max_length=17, 
        unique=True,
        help_text="Vehicle Identification Number"
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
    status = models.CharField(max_length=20, choices=VEHICLE_STATUS, default='pending')
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE)
    fuel_type = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # For marketplace
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
    
# Add to vehicles/models.py
class QuoteRequest(models.Model):
    vehicle = models.ForeignKey(
        Vehicle, 
        on_delete=models.CASCADE,
        related_name='quote_requests'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True
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

    def check_for_matches(sender, instance, created, **kwargs):
        if created and instance.listing_type == 'marketplace':
            matching_searches = VehicleSearch.objects.filter(
                make__iexact=instance.make,
                model__iexact=instance.model,
                min_year__lte=instance.year,
                max_year__gte=instance.year,
                max_price__gte=instance.price,
                max_mileage__gte=instance.mileage,
                status='active'
            )
        
        for search in matching_searches:
            search.match_count += 1
            search.last_matched = timezone.now()
            search.status = 'matched'
            search.save()

    post_save.connect(check_for_matches, sender=Vehicle)

    class Meta:
        verbose_name_plural = "Vehicle Searches"