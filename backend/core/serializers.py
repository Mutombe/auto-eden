#serializers.py
from rest_framework import serializers
from .models import QuoteRequest, Vehicle, VehicleImage, Bid, Profile, User, VehicleSearch, NotificationPreference, VehicleDraft
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.models import User
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "is_active", "is_staff", "is_superuser")

    def create(self, validated_data):
        if not validated_data.get('password'):
            raise serializers.ValidationError({"password": "Password is required"})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        # Never store a raw password: hash it if one was supplied
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=['password'])
        return instance


class AdminUserSerializer(UserSerializer):
    """User row for the admin console: adds activity fields and listing counts."""
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(source='profile.phone', read_only=True, default='')
    vehicle_count = serializers.IntegerField(read_only=True, default=0)
    bid_count = serializers.IntegerField(read_only=True, default=0)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + (
            "first_name", "last_name", "phone", "date_joined", "last_login", "vehicle_count", "bid_count",
        )
        read_only_fields = ("date_joined", "last_login", "is_superuser")

    def create(self, validated_data):
        extra = {k: validated_data.pop(k) for k in ("first_name", "last_name", "is_staff", "is_active") if k in validated_data}
        user = super().create(validated_data)
        for field, value in extra.items():
            setattr(user, field, value)
        if extra:
            user.save(update_fields=list(extra))
        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "profile_picture",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["email", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        # Handle nested user data
        user_data = validated_data.pop("user", None)
        if user_data and "username" in user_data:
            instance.user.username = user_data["username"]
            instance.user.save()

        # Update profile fields
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.phone = validated_data.get("phone", instance.phone)
        instance.profile_picture = validated_data.get(
            "profile_picture", instance.profile_picture
        )
        instance.save()

        return instance
    
class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user notification preferences."""

    class Meta:
        model = NotificationPreference
        fields = [
            'email_vehicle_approved',
            'email_new_bid',
            'email_quote_ready',
            'push_enabled',
            'whatsapp_enabled',
            'whatsapp_number',
        ]

    def validate_whatsapp_number(self, value):
        """Validate WhatsApp number format if provided."""
        if value:
            import re
            # Basic phone number validation
            if not re.match(r'^[\+]?[\d\s\-\(\)]{8,20}$', value):
                raise serializers.ValidationError("Invalid phone number format")
        return value


class VehicleImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if obj.image:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{obj.image.name}"
        return None

    class Meta:
        model = VehicleImage
        fields = ['id', 'image']

class VehicleSerializer(serializers.ModelSerializer):
    images = VehicleImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False),
        write_only=True,
        required=False
    )
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Vehicle
        fields = '__all__'
        # Verification is only changed through the admin-only `verify` action,
        # so owners can't approve their own listings.
        read_only_fields = [
            'verification_state', 'is_visible',
            'is_digitally_verified', 'is_physically_verified', 'is_rejected', 'rejection_reason',
            'digitally_verified_by', 'digitally_verified_at',
            'physically_verified_by', 'physically_verified_at', 'rejected_at',
        ]
        extra_kwargs = {
            'vin': {'required': True},
            'mileage': {'required': True},
            'listing_type': {'required': False},
            'price': {'required': False},  # Not required for instant sale
            'proposed_price': {'required': False},
            'description': {'required': False},
        }

    def validate(self, data):
        listing_type = data.get('listing_type') or (self.instance.listing_type if self.instance else None)
        if listing_type == 'marketplace' and not data.get('price') and not (self.instance and self.instance.price):
            raise serializers.ValidationError(
                {"price": "Price is required for marketplace listings"}
            )
        if listing_type == 'instant_sale' and not data.get('proposed_price') and not (self.instance and self.instance.proposed_price):
            raise serializers.ValidationError(
                {"proposed_price": "Price is required for instant sale"}
            )
        return data

    def _save_images(self, vehicle, image_files):
        for image_file in image_files:
            try:
                VehicleImage.objects.create(vehicle=vehicle, image=image_file)
            except Exception as e:
                logger.exception("Error uploading vehicle image")
                raise serializers.ValidationError(
                    {"image_files": f"Could not upload {getattr(image_file, 'name', 'image')}: {e}"}
                )

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        # Atomic: a failed image upload rolls back the vehicle instead of leaving it imageless
        with transaction.atomic():
            vehicle = super().create(validated_data)
            self._save_images(vehicle, image_files)
        return vehicle

    def update(self, instance, validated_data):
        image_files = validated_data.pop('image_files', [])
        with transaction.atomic():
            vehicle = super().update(instance, validated_data)
            self._save_images(vehicle, image_files)
        return vehicle
    
class VehicleListSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()
    owner_username = serializers.CharField(source='owner.username')

    class Meta:
        model = Vehicle
        fields = ('id', 'make', 'model', 'year', 'price','body_type', 'mileage','fuel_type',
                 'transmission', 'listing_type', 'verification_state',
                 'location', 'created_at', 'main_image', 'owner_username')

    def get_main_image(self, obj):
        images = obj.images.all()
        if images:
            first_image = images[0].image
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.url)
            return first_image.url
        return None

class VehicleVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            'is_digitally_verified',
            'is_physically_verified',
            'is_rejected',
            'rejection_reason',
            'verification_state' 
        ]
        
    def validate(self, data):
        # Ensure only one verification state is set
        verification_fields = [
            data.get('is_digitally_verified', False),
            data.get('is_physically_verified', False),
            data.get('is_rejected', False)
        ]
        
        if sum(verification_fields) > 1:
            raise serializers.ValidationError(
                "Only one verification state can be active at a time"
            )
        return data

class VehicleReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['verification_state', 'rejection_reason']
        extra_kwargs = {
            'rejection_reason': {'required': False}
        }

    def validate(self, data):
        if data.get('verification_state') == 'rejected' and not data.get('rejection_reason'):
            raise serializers.ValidationError(
                "Rejection reason is required when rejecting a vehicle"
            )
        return data

class BidSerializer(serializers.ModelSerializer):
    # For read operations
    vehicle = VehicleSerializer(read_only=True)
    bidder = UserSerializer(read_only=True)
    
    # For write operations (bid creation)
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), 
        source='vehicle', 
        write_only=True,
        required=True
    )

    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ['status', 'bidder']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bid amount must be positive")
        return value

class PublicVehicleSerializer(serializers.ModelSerializer):
    bids = BidSerializer(many=True, read_only=True)
    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'price', 'mileage', 'verification_state', 'bids']

class SimpleBidSerializer(serializers.ModelSerializer):
    bidder = serializers.StringRelatedField()
    
    class Meta:
        model = Bid
        fields = ['id', 'amount', 'bidder', 'created_at', 'message', 'status']
        
        
class VehicleSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSearch
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'last_matched', 'match_count')

class QuoteRequestSerializer(serializers.ModelSerializer):
    status = serializers.CharField(default='pending')
    priority = serializers.CharField(default='medium')
    class Meta:
        model = QuoteRequest
        fields = '__all__'
        read_only_fields = ('vehicle', 'is_processed', 'created_at')


class VehicleSummarySerializer(serializers.ModelSerializer):
    """Compact vehicle reference for admin tables (bids, quotes)."""
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'price', 'proposed_price', 'listing_type',
                  'verification_state', 'thumbnail']

    def get_thumbnail(self, obj):
        # Uses the prefetched images; avoids a query per row
        images = list(obj.images.all())
        if images and images[0].image:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{images[0].image.name}"
        return None


class ReceivedBidSerializer(serializers.ModelSerializer):
    """An offer on one of the seller's own vehicles. Shows the bidder's username only, never their email."""
    vehicle = VehicleSummarySerializer(read_only=True)
    bidder = serializers.CharField(source="bidder.username", read_only=True)

    class Meta:
        model = Bid
        fields = ['id', 'vehicle', 'bidder', 'amount', 'message', 'status', 'created_at']


class AdminBidSerializer(serializers.ModelSerializer):
    vehicle = VehicleSummarySerializer(read_only=True)
    bidder = UserSerializer(read_only=True)

    class Meta:
        model = Bid
        fields = ['id', 'vehicle', 'bidder', 'amount', 'message', 'status', 'created_at']
        read_only_fields = ['id', 'vehicle', 'bidder', 'amount', 'message', 'created_at']


class AdminQuoteRequestSerializer(serializers.ModelSerializer):
    vehicle = VehicleSummarySerializer(read_only=True)
    processed_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = QuoteRequest
        fields = '__all__'
        read_only_fields = [
            'vehicle', 'full_name', 'email', 'country', 'city', 'address', 'telephone', 'note',
            'created_at', 'updated_at', 'processed_by', 'processed_at', 'quote_email_sent', 'email_sent_at',
        ]


class VehicleDraftSerializer(serializers.ModelSerializer):
    """Serializer for vehicle drafts (incomplete listings)."""
    completion_percentage = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = VehicleDraft
        fields = [
            'id', 'data', 'images', 'step', 'is_complete',
            'draft_title', 'expires_at', 'completion_percentage',
            'is_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'draft_title', 'expires_at', 'created_at', 'updated_at']

    def validate_step(self, value):
        """Ensure step is between 1 and 5."""
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Step must be between 1 and 5")
        return value

    def validate_data(self, value):
        """Validate the draft data structure."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Data must be a JSON object")
        return value

    def validate_images(self, value):
        """Validate images is a list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Images must be a list")
        return value
        