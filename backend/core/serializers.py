from rest_framework import serializers
from .models import QuoteRequest, Vehicle, VehicleImage, Bid, Profile, User, VehicleSearch

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
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            else:
                # Fallback when request context is not available
                return obj.image.url
        return None
    
    class Meta:
        model = VehicleImage
        fields = ['image']
        read_only_fields = ['vehicle']
    
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
            'proposed_price': {'required': False} 
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
        image_files = validated_data.pop('image_files')
        vehicle = super().create(validated_data)
        
        for image_file in image_files:
            VehicleImage.objects.create(vehicle=vehicle, image=image_file)
            
        return vehicle

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
    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'price', 'mileage', 'verification_state', 'bids']

class VehicleDetailSerializer(PublicVehicleSerializer):
    owner = serializers.StringRelatedField()
    bids = BidSerializer(many=True, read_only=True)
    
    class Meta(PublicVehicleSerializer.Meta):
        fields = PublicVehicleSerializer.Meta.fields + [
            'vin', 'owner', 'bids'
        ]
        
class VehicleSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSearch
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'last_matched', 'match_count')

# Add to vehicles/serializers.py
class QuoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteRequest
        fields = '__all__'
        read_only_fields = ('vehicle', 'is_processed', 'created_at')
        