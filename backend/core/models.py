# vehicles/models.py
from django.db import models
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
        help_text="Price you expect for instant sale"
    ) # For instant sale
    is_visible = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=VEHICLE_STATUS, default='pending')
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE)
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

class Bid(models.Model):
    BID_STATUS = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    bidder = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(default="No message provided", blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=BID_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} bid for {self.vehicle}"