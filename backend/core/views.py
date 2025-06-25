# vehicles/views.py
from rest_framework import viewsets, permissions
from .models import Vehicle, Bid, Profile, User, VehicleSearch
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .serializers import (
    PublicVehicleSerializer,
    QuoteRequestSerializer,
    VehicleDetailSerializer,
    VehicleReviewSerializer,
    VehicleSearchSerializer,
    VehicleImageSerializer,
    VehicleVerificationSerializer,
    VehicleSerializer,
    BidSerializer,
    ProfileSerializer,
    UserSerializer,
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsOwnerOrAdmin
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from .tasks import send_vehicle_approved_email, send_vehicle_rejected_email
from xhtml2pdf import pisa
from io import BytesIO


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

        data["user"] = user_serializer.data

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


class PublicVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PublicVehicleSerializer
    permission_classes = [
        permissions.AllowAny
    ]  # Or IsAuthenticated for logged-in users
    queryset = Vehicle.objects.all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VehicleDetailSerializer
        return super().get_serializer_class()


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    parser_classes = [MultiPartParser, JSONParser]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Vehicle.objects.all()
        return Vehicle.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        vehicle = self.get_object()
        serializer = VehicleVerificationSerializer(vehicle, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Track verification changes
            verification_data = {}
            new_state = None
            
            if serializer.validated_data.get('is_digitally_verified'):
                verification_data.update({
                    'verification_state': 'digital',
                    'digitally_verified_by': request.user,
                    'digitally_verified_at': timezone.now(),
                    'is_digitally_verified': True,
                    'is_rejected': False,
                    'rejection_reason': ''
                })
                new_state = 'digital'
            if serializer.validated_data.get('is_physically_verified'):
                verification_data.update({
                    'verification_state': 'physical',
                    'physically_verified_by': request.user,
                    'is_physically_verified': True,
                    'physically_verified_at': timezone.now(),
                    'is_rejected': False,
                    'rejection_reason': ''
                })
                new_state = 'physical'
            if serializer.validated_data.get('is_rejected'):
                verification_data.update({
                    'verification_state': 'rejected',
                    'rejected_by': request.user,
                    'rejected_at': timezone.now(),
                    'is_rejected': True,
                    'rejection_reason': serializer.validated_data.get('rejection_reason', '')
                })
                new_state = 'rejected'

            # Update the vehicle
            for field, value in verification_data.items():
                setattr(vehicle, field, value)
            vehicle.save()
            
            # Send notifications if needed
            self.handle_verification_notifications(vehicle)
            
            return Response(VehicleSerializer(vehicle).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def handle_verification_notifications(self, vehicle):
        if vehicle.verification_state == 'physical':
            send_vehicle_approved_email.delay(
                vehicle.id,
                verification_type='physical'
            )
        elif vehicle.verification_state == 'digital':
            send_vehicle_approved_email.delay(
                vehicle.id,
                verification_type='digital'
            )
        elif vehicle.verification_state == 'rejected':
            send_vehicle_rejected_email.delay(
                vehicle.id,
                vehicle.rejection_reason or "No reason provided"
            )

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def pending_verification(self, request):
        queryset = self.get_queryset().filter(
            is_digitally_verified=False, is_physically_verified=False, is_rejected=False
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["patch"], permission_classes=[permissions.IsAdminUser]
    )
    def review(self, request, pk=None):
        return self.verify(request, pk)  # Now uses the same verify endpoint

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def pending_verification(self, request):
        queryset = Vehicle.objects.filter(verification_state="pending")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_vehicles(self, request):
        queryset = Vehicle.objects.filter(owner=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def toggle_visibility(self, request, pk=None):
        vehicle = self.get_object()
        vehicle.is_visible = not vehicle.is_visible
        vehicle.save()
        serializer = self.get_serializer(vehicle)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="instant-sales")
    def instant_sales(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def pending_review(self, request):
        queryset = self.filter_queryset(self.get_queryset().filter(verification_state="pending"))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["patch"], permission_classes=[permissions.IsAdminUser]
    )
    def review(self, request, pk=None):
        vehicle = self.get_object()
        serializer = VehicleReviewSerializer(vehicle, data=request.data)
        if serializer.is_valid():
            serializer.save()

            if serializer.validated_data.get("verification_state") == "rejected":
                # Send rejection notification
                send_vehicle_rejected_email.delay(
                    vehicle.owner.email,
                    vehicle.id,
                    serializer.validated_data.get("rejection_reason", ""),
                )
            elif serializer.validated_data.get("verification_state") == "physically_verified":
                # Send approval notification
                send_vehicle_approved_email.delay(vehicle.owner.email, vehicle.id)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], url_path="create-instant-sale")
    def create_instant_sale(self, request):
        serializer = self.get_serializer(
            data=request.data, context={"view": self, "request": request}
        )
        serializer.is_valid(raise_exception=True)

        # Manually set required fields
        serializer.save(
            owner=request.user, listing_type="instant_sale", verification_state="pending"
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class VehicleSearchViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSearchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VehicleSearch.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def pause(self, request, pk=None):
        search = self.get_object()
        search.status = "paused"
        search.save()
        return Response({"status": "search paused"})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        search = self.get_object()
        search.status = "active"
        search.save()
        return Response({"status": "search activated"})


class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bid.objects.filter(bidder=self.request.user)

    def perform_create(self, serializer):
        serializer.save(bidder=self.request.user)

    @action(
        detail=False, methods=["get"], url_path="vehicle-bids/(?P<vehicle_pk>[^/.]+)"
    )
    def vehicle_bids(self, request, vehicle_pk=None):
        vehicle = get_object_or_404(Vehicle, pk=vehicle_pk)
        # You might want to add permission check here
        queryset = Bid.objects.filter(vehicle=vehicle)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def all_bids(self, request):
        queryset = Bid.objects.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MarketplaceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        vehicles = Vehicle.objects.filter(
            verification_state="physical", is_visible=True, listing_type="marketplace"
        )

        # Add filtering logic
        min_price = request.query_params.get("minPrice")
        if min_price:
            vehicles = vehicles.filter(price__gte=min_price)

        # Add sorting
        sort_by = request.query_params.get("sortBy")
        if sort_by == "priceLowHigh":
            vehicles = vehicles.order_by("price")
        elif sort_by == "priceHighLow":
            vehicles = vehicles.order_by("-price")
        else:
            vehicles = vehicles.order_by("-created_at")

        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)


class InstantSaleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(
            owner=self.request.user, listing_type="instant_sale"
        )

    def perform_create(self, serializer):
        serializer.save(
            owner=self.request.user, listing_type="instant_sale", verification_state="pending"
        )


class QuoteRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, vehicle_id):
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response(
                {"detail": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = QuoteRequestSerializer(data=request.data)
        if serializer.is_valid():
            quote = serializer.save(
                vehicle=vehicle,
            )

            # Generate and send PDF
            self.send_quote_email(quote, vehicle)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_quote_email(self, quote, vehicle):
        # Generate PDF
        pdf_buffer = self.generate_quote_pdf(quote, vehicle)

        # Prepare email
        subject = f"Your Quote for {vehicle.make} {vehicle.model}"
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = [quote.email]

        # Create email with PDF attachment
        email = EmailMessage(subject, "", from_email, to_email)
        email.attach(f"quote_{quote.id}.pdf", pdf_buffer.getvalue(), "application/pdf")

        # Send email
        email.send()

        # Also notify admins
        self.notify_admins(quote, vehicle)

    def generate_quote_pdf(self, quote, vehicle):
        template = "quotes/quote_pdf.html"
        context = {
            "quote": quote,
            "vehicle": vehicle,
            "qr_url": "https://autoeden.com",
            "date": quote.created_at.strftime("%B %d, %Y"),
        }

        html = render_to_string(template, context)
        buffer = BytesIO()

        # Create PDF
        pisa_status = pisa.CreatePDF(html, dest=buffer)

        if pisa_status.err:
            raise Exception("PDF generation failed")

        buffer.seek(0)
        return buffer

    def notify_admins(self, quote, vehicle):
        admin_subject = f"New Quote Request: {vehicle.make} {vehicle.model}"
        admin_message = render_to_string(
            "emails/new_quote_admin.html", {"quote": quote, "vehicle": vehicle}
        )

        # Send to all admin users
        admin_emails = User.objects.filter(is_staff=True).values_list(
            "email", flat=True
        )

        if admin_emails:
            send_mail(
                admin_subject,
                strip_tags(admin_message),
                settings.DEFAULT_FROM_EMAIL,
                admin_emails,
                html_message=admin_message,
                fail_silently=False,
            )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(is_active=True)

    @action(detail=False, methods=["get"])
    def inactive_users(self, request):
        queryset = User.objects.filter(is_active=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class QuoteRequestVieww(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, vehicle_id):
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, listing_type="instant_sale")
        except Vehicle.DoesNotExist:
            return Response(
                {"detail": "Vehicle not found or not available for quotes"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = QuoteRequestSerializer(data=request.data)
        if serializer.is_valid():
            quote = serializer.save(
                vehicle=vehicle,
                user=request.user if request.user.is_authenticated else None,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
