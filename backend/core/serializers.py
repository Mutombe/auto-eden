from rest_framework import serializers
from .models import QuoteRequest, Vehicle, VehicleImage, Bid, Profile, User, VehicleSearch
from django.db.models import Q
from django.contrib.auth.models import User
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "is_active", "is_staff", "is_superuser")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
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
        instance.profile_picture = validated_data.get(
            "profile_picture", instance.profile_picture
        )
        instance.save()

        return instance
    
class VehicleImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if obj.image:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{obj.image.name}"
        return None
    
    class Meta:
        model = VehicleImage
        fields = ['image']
    
class VehicleSerializer(serializers.ModelSerializer):
    images = VehicleImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False),
        write_only=True,
        required=True
    )
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['verification_state', 'is_visible']
        extra_kwargs = {
            'vin': {'required': True},
            'mileage': {'required': True},
            'listing_type': {'required': False},
            'price': {'required': False},  # Not required for instant sale
            'proposed_price': {'required': False},
            'description': {'required': False},
        }

    def validate(self, data):
        if data.get('listing_type') == 'marketplace' and not data.get('price'):
            raise serializers.ValidationError(
                {"price": "Price is required for marketplace listings"}
            )
        if data.get('listing_type') == 'instant_sale' and not data.get('proposed_price'):
            raise serializers.ValidationError(
                {"proposed_price": "Price is required for instant sale"}
            )
        return data

    
    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])  # Handle missing images gracefully
        vehicle = super().create(validated_data)
        
        for image_file in image_files:
            # Add error handling for image creation
            try:
                VehicleImage.objects.create(vehicle=vehicle, image=image_file)
            except Exception as e:
                logger.error(f"Error creating VehicleImage: {str(e)}")

        return vehicle
    
class VehicleListSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()
    owner_username = serializers.CharField(source='owner.username')

    class Meta:
        model = Vehicle
        fields = ('id', 'make', 'model', 'year', 'price', 'mileage', 
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
    vehicle = VehicleSerializer(read_only=True)
    bidder = UserSerializer(read_only=True)
    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ['status']

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
    class Meta:
        model = QuoteRequest
        fields = '__all__'
        read_only_fields = ('vehicle', 'is_processed', 'created_at')
        