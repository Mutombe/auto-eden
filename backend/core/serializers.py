from rest_framework import serializers
from .models import Vehicle, VehicleImage, Bid, Profile, User

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
    class Meta:
        model = VehicleImage
        fields = ['image']
        read_only_fields = ['vehicle']

class VehicleSerializerrs(serializers.ModelSerializer):
    images = VehicleImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False),
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['owner', 'status', 'is_visible']
        extra_kwargs = {
            'vin': {'required': True},
            'mileage': {'required': True},
            'listing_type': {'required': False}
        }

    def validate(self, data):
        if self.context['view'].action == 'create_instant_sale':
            if 'proposed_price' not in data:
                raise serializers.ValidationError("Price is required for instant sale")
        return data

    def create(self, validated_data):
        image_files = validated_data.pop('image_files')
        vehicle = super().create(validated_data)
        
        for image_file in image_files:
            VehicleImage.objects.create(vehicle=vehicle, image=image_file)
            
        return vehicle
    
class VehicleSerializer(serializers.ModelSerializer):
    images = VehicleImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False),
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['owner', 'status', 'is_visible']
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

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ['bidder', 'status']