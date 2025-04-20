# vehicles/views.py
from rest_framework import viewsets, permissions
from .models import Vehicle, Bid, Profile
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .serializers import VehicleSerializer, BidSerializer, ProfileSerializer, UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsOwnerOrAdmin
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)
            print("Username", user.username)
            return Response(
                {"detail": "You're now registered to Auto Eden"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        user_serializer = UserSerializer(user)
        
        data['user'] = user_serializer.data
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
class ProfileView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response(
                {"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return Response(
                {"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
        
    def get(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
        # Temporary fix until signals work
            profile = Profile.objects.create(user=request.user)
        
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Vehicle.objects.all()
        return Vehicle.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        vehicle = self.get_object()
        serializer = VehicleVerificationSerializer(vehicle, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending_verification(self, request):
        queryset = Vehicle.objects.filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_vehicles(self, request):
        queryset = Vehicle.objects.filter(owner=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def toggle_visibility(self, request, pk=None):
        vehicle = self.get_object()
        vehicle.is_visible = not vehicle.is_visible
        vehicle.save()
        serializer = self.get_serializer(vehicle)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='instant-sales')
    def instant_sales(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='create-instant-sale')
    def create_instant_sale(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            owner=request.user,
            listing_type='instant_sale',
            status='pending'
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bid.objects.filter(bidder=self.request.user)

    def perform_create(self, serializer):
        serializer.save(bidder=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-bids')
    def my_bids(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class MarketplaceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        vehicles = Vehicle.objects.filter(
            status='physically_verified',
            is_visible=True,
            listing_type='marketplace'
        )
        
        # Add filtering logic
        min_price = request.query_params.get('minPrice')
        if min_price:
            vehicles = vehicles.filter(price__gte=min_price)
        
        # Add similar filters for maxPrice, make, year
        
        # Add sorting
        sort_by = request.query_params.get('sortBy')
        if sort_by == 'priceLowHigh':
            vehicles = vehicles.order_by('price')
        elif sort_by == 'priceHighLow':
            vehicles = vehicles.order_by('-price')
        else:
            vehicles = vehicles.order_by('-created_at')
            
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)
class InstantSaleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(
            owner=self.request.user,
            listing_type='instant_sale'
        )

    def perform_create(self, serializer):
        serializer.save(
            owner=self.request.user,
            listing_type='instant_sale',
            status='pending'
        )
