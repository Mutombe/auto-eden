# vehicles/views.py
from urllib.parse import urlencode
from django.core.cache import cache
from rest_framework import viewsets, permissions, serializers
from .models import QuoteRequest, Vehicle, Bid, Profile, User, VehicleSearch, NotificationPreference, VehicleDraft
from .models import VehicleView, VehicleImage
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .serializers import (
    QuoteRequestSerializer,
    VehicleListSerializer,
    VehicleReviewSerializer,
    VehicleSearchSerializer,
    VehicleImageSerializer,
    VehicleVerificationSerializer,
    VehicleSerializer,
    BidSerializer,
    ProfileSerializer,
    UserSerializer,
    NotificationPreferenceSerializer,
)
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Vehicle, VehicleView
from django.conf import settings
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
import logging
from django.contrib.postgres.search import SearchVector
# views.py
import qrcode
from io import BytesIO
import base64
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.core.mail import EmailMessage
from xhtml2pdf import pisa
from PIL import Image, ImageDraw
import uuid
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination


logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    """Standard pagination for all list endpoints."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Set user as active immediately (email verification can be added later)
            user.is_active = True
            user.save()

            # Create profile for the user
            Profile.objects.get_or_create(user=user)

            logger.info(f"New user registered: {user.username}")
            return Response(
                {"detail": "You're now registered to Auto Eden. You can now login."},
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
        """Get or create user profile."""
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            # Auto-create profile if it doesn't exist
            profile = Profile.objects.create(user=request.user)

        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update user profile."""
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=request.user)

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationPreferencesView(APIView):
    """API view for managing user notification preferences."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user's notification preferences."""
        try:
            preferences = request.user.notification_preferences
        except NotificationPreference.DoesNotExist:
            # Create default preferences if they don't exist
            preferences = NotificationPreference.objects.create(user=request.user)

        serializer = NotificationPreferenceSerializer(preferences)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update user's notification preferences."""
        try:
            preferences = request.user.notification_preferences
        except NotificationPreference.DoesNotExist:
            preferences = NotificationPreference.objects.create(user=request.user)

        serializer = NotificationPreferenceSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicVehicleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Vehicle.objects.select_related('owner').prefetch_related('images', 'bids__bidder')

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, JSONParser]
    pagination_class = StandardPagination

    def get_queryset(self):
        if self.request.user.is_staff:
            return Vehicle.objects.all().select_related('owner').prefetch_related('images')
        return Vehicle.objects.filter(owner=self.request.user).select_related('owner').prefetch_related('images')

    def perform_create(self, serializer):
        # Allow admin users to set verification_state during creation
        extra_kwargs = {'owner': self.request.user}

        if self.request.user.is_staff:
            verification_state = self.request.data.get('verification_state')
            if verification_state in ['pending', 'digital', 'physical']:
                extra_kwargs['verification_state'] = verification_state
                # Also set the corresponding boolean flags
                if verification_state == 'digital':
                    extra_kwargs['is_digitally_verified'] = True
                    extra_kwargs['digitally_verified_by'] = self.request.user
                    extra_kwargs['digitally_verified_at'] = timezone.now()
                elif verification_state == 'physical':
                    extra_kwargs['is_physically_verified'] = True
                    extra_kwargs['physically_verified_by'] = self.request.user
                    extra_kwargs['physically_verified_at'] = timezone.now()

        serializer.save(**extra_kwargs)

    @action(
        detail=True, methods=["patch"], permission_classes=[permissions.IsAdminUser]
    )
    def verify(self, request, pk=None):
        vehicle = self.get_object()
        serializer = VehicleVerificationSerializer(
            vehicle, data=request.data, partial=True
        )

        if serializer.is_valid():
            # Track verification changes
            verification_data = {}
            new_state = None

            if serializer.validated_data.get("is_digitally_verified"):
                verification_data.update(
                    {
                        "verification_state": "digital",
                        "digitally_verified_by": request.user,
                        "digitally_verified_at": timezone.now(),
                        "is_digitally_verified": True,
                        "is_rejected": False,
                        "rejection_reason": "",
                    }
                )
                new_state = "digital"
            if serializer.validated_data.get("is_physically_verified"):
                verification_data.update(
                    {
                        "verification_state": "physical",
                        "physically_verified_by": request.user,
                        "is_physically_verified": True,
                        "physically_verified_at": timezone.now(),
                        "is_rejected": False,
                        "rejection_reason": "",
                    }
                )
                new_state = "physical"
            if serializer.validated_data.get("is_rejected"):
                verification_data.update(
                    {
                        "verification_state": "rejected",
                        "rejected_by": request.user,
                        "rejected_at": timezone.now(),
                        "is_rejected": True,
                        "rejection_reason": serializer.validated_data.get(
                            "rejection_reason", ""
                        ),
                    }
                )
                new_state = "rejected"

            # Update the vehicle
            for field, value in verification_data.items():
                setattr(vehicle, field, value)
            vehicle.save()

            # Send notifications if needed
            self.handle_verification_notifications(vehicle)

            return Response(VehicleSerializer(vehicle).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def handle_verification_notifications(self, vehicle):
        if vehicle.verification_state == "physical":
            send_vehicle_approved_email.delay(vehicle.id, verification_type="physical")
        elif vehicle.verification_state == "digital":
            send_vehicle_approved_email.delay(vehicle.id, verification_type="digital")
        elif vehicle.verification_state == "rejected":
            send_vehicle_rejected_email.delay(
                vehicle.id, vehicle.rejection_reason or "No reason provided"
            )

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def pending_verification(self, request):
        """Get vehicles pending verification with pagination."""
        queryset = Vehicle.objects.filter(verification_state="pending").order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_vehicles(self, request):
        """Get current user's vehicles with pagination."""
        queryset = Vehicle.objects.filter(owner=request.user).order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
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
        """Get instant sale vehicles with pagination."""
        queryset = Vehicle.objects.filter(listing_type="instant_sale").order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def pending_review(self, request):
        """Get vehicles pending review with pagination."""
        queryset = Vehicle.objects.filter(verification_state="pending").order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
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
            elif (
                serializer.validated_data.get("verification_state")
                == "physically_verified"
            ):
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
            owner=request.user,
            listing_type="instant_sale",
            verification_state="pending",
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Vehicle creation request by {request.user}")
        logger.debug(f"Request data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except serializers.ValidationError as e:
            # Return validation errors with proper status code
            logger.warning(f"Vehicle creation validation failed: {e.detail}")
            return Response(
                e.detail,
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Vehicle creation failed: {str(e)}")
            logger.exception("Full traceback:")
            return Response(
                {"detail": str(e) if str(e) else "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VehicleDraftViewSet(viewsets.ModelViewSet):
    """ViewSet for managing vehicle drafts (incomplete listings)."""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        # Only return non-expired drafts for the current user
        return VehicleDraft.objects.filter(
            owner=self.request.user,
            expires_at__gt=timezone.now()
        )

    def get_serializer_class(self):
        from .serializers import VehicleDraftSerializer
        return VehicleDraftSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Convert draft to a real vehicle listing."""
        draft = self.get_object()

        if draft.completion_percentage < 80:
            return Response(
                {'error': 'Draft must be at least 80% complete to publish'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create vehicle from draft data
            vehicle_data = draft.data.copy()
            vehicle = Vehicle.objects.create(
                owner=request.user,
                **{k: v for k, v in vehicle_data.items() if hasattr(Vehicle, k)}
            )

            # Handle images
            for image_url in draft.images:
                VehicleImage.objects.create(
                    vehicle=vehicle,
                    image=image_url,
                )

            # Delete the draft
            draft.delete()

            from .serializers import VehicleSerializer
            return Response(
                VehicleSerializer(vehicle).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Failed to publish draft: {str(e)}")
            return Response(
                {'error': 'Failed to publish draft'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def cleanup_expired(self, request):
        """Admin action to delete all expired drafts."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin only'},
                status=status.HTTP_403_FORBIDDEN
            )

        deleted_count, _ = VehicleDraft.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()

        return Response({'deleted': deleted_count})


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


@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_id_list(request):
    # Only get vehicles that are verified and visible
    vehicle_ids = Vehicle.objects.filter(
        verification_state="physical", 
        is_visible=True
    ).values_list('id', flat=True)
    
    # Return as strings for URL construction: ["1", "2", "3"]
    return Response([str(id) for id in vehicle_ids])

class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        return Bid.objects.filter(bidder=self.request.user).select_related('vehicle', 'bidder').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(bidder=self.request.user)

    @action(
        detail=False, methods=["get"], url_path="vehicle-bids/(?P<vehicle_pk>[^/.]+)"
    )
    def vehicle_bids(self, request, vehicle_pk=None):
        """Get bids for a specific vehicle with pagination."""
        vehicle = get_object_or_404(Vehicle, pk=vehicle_pk)
        queryset = Bid.objects.filter(vehicle=vehicle).select_related('bidder').order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def all_bids(self, request):
        """Get all bids with pagination (admin only)."""
        queryset = Bid.objects.all().select_related('vehicle', 'bidder').order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def my_bids(self, request):
        """Get current user's bids with pagination."""
        queryset = Bid.objects.filter(bidder=request.user).select_related('vehicle').order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Bid creation failed: {str(e)}")
            return Response(
                {"detail": "Error creating bid"},
                status=status.HTTP_400_BAD_REQUEST
            )


class MarketplacePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

class MarketplaceView(APIView):
    permission_classes = [permissions.AllowAny]
    pagination_class = MarketplacePagination

    def get(self, request):
        # Create consistent cache key with sorted query parameters
        query_params = request.query_params.dict()
        sorted_params = sorted(query_params.items())
        canonical_query = urlencode(sorted_params)
        cache_key = f"marketplace_{canonical_query}"
        
        # Try to get cached response
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        # Build and filter queryset
        vehicles = Vehicle.objects.filter(
            verification_state="physical", 
            is_visible=True, 
            listing_type="marketplace"
        ).select_related('owner').prefetch_related('images').only(
            'id', 'make', 'model', 'year', 'price', 'body_type', 'mileage', 'fuel_type',
            'location', 'created_at', 'owner__username'
        )

        # Apply filters
        min_price = request.query_params.get("minPrice")
        if min_price:
            vehicles = vehicles.filter(price__gte=min_price)

        max_price = request.query_params.get("maxPrice")
        if max_price:
            vehicles = vehicles.filter(price__lte=max_price)
        make = request.query_params.get("make")
        if make:
            vehicles = vehicles.filter(make__iexact=make)
        model = request.query_params.get("model")
        if model:
            vehicles = vehicles.filter(model__iexact=model)
        year = request.query_params.get("year")
        if year:
            vehicles = vehicles.filter(year=year)
        
        body_type = request.query_params.get("body_type")
        if body_type:
            vehicles = vehicles.filter(body_type__iexact=body_type)
        search_term = request.query_params.get("search_term")
        if search_term:
            # Use PostgreSQL full-text search if available
            vehicles = vehicles.annotate(
                search=SearchVector('make', 'model', 'description')
            ).filter(search=search_term)

        # Sorting
        sort_by = request.query_params.get("sortBy")
        if sort_by == "priceLowHigh":
            vehicles = vehicles.order_by("price")
        elif sort_by == "priceHighLow":
            vehicles = vehicles.order_by("-price")
        else:
            vehicles = vehicles.order_by("-created_at")

        # Paginate results
        paginator = self.pagination_class()
        paginated_vehicles = paginator.paginate_queryset(vehicles, request)
        serializer = VehicleListSerializer(paginated_vehicles, many=True, context={'request': request})
        
        # Create custom response with pagination metadata
        response = paginator.get_paginated_response(serializer.data)
        response_data = response.data
        response_data['current_page'] = request.query_params.get('page', 1)
        response_data['page_size'] = paginator.get_page_size(request)
        
        # Cache and return
        cache.set(cache_key, response_data, timeout=300)
        return Response(response_data)

class InstantSaleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(
            owner=self.request.user, listing_type="instant_sale"
        )

    def perform_create(self, serializer):
        serializer.save(
            owner=self.request.user,
            listing_type="instant_sale",
            verification_state="pending",
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
            quote = serializer.save(vehicle=vehicle)

            # Generate and send PDF
            try:
                self.send_quote_email(quote, vehicle)
                return Response({
                    "message": "Quote request submitted successfully! You will receive an email with the quotation shortly.",
                    "quote_id": quote.id
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Log the error but don't fail the request
                print(f"Email sending failed: {str(e)}")
                return Response({
                    "message": "Quote request submitted successfully!",
                    "quote_id": quote.id,
                    "note": "Email delivery may be delayed"
                }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def generate_qr_code(self, url):
        """Generate QR code and return as base64 string"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)

        # Create QR code image
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = BytesIO()
        qr_img.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return qr_base64

    def generate_quote_pdf(self, quote, vehicle):
        """Generate professional PDF quotation"""
        
        # Generate QR code for website
        qr_code_base64 = self.generate_qr_code("https://autoeden.co.zw")
        
        # Calculate quote validity (24 hours from creation)
        valid_until = quote.created_at + timedelta(hours=24)
        
        # Prepare context for template
        context = {
            "quote": quote,
            "vehicle": vehicle,
            "qr_code": qr_code_base64,
            "quote_date": quote.created_at.strftime("%B %d, %Y"),
            "valid_until": valid_until.strftime("%B %d, %Y at %I:%M %p"),
            "quote_id": f"QT-{quote.id:06d}",
            # Company details
            "company": {
                "name": "Auto Eden PL",
                "address": "4 KAMIL COURT",
                "address_line2": "Corner Herbert Chitepo Ave & 8th Street",
                "phone": "+263782222032",
                "email": "admin@autoeden.co.zw",
                "website": "www.autoeden.co.zw",
                "bank_details": {
                    "account_name": "Auto Eden PL",
                    "branch": "CBZ Borrowdale Branch",
                    "account_number": "029 26378180010"
                }
            },
            # Pricing (you might want to make this dynamic)
            "base_price": vehicle.price if hasattr(vehicle, 'price') else 15000,
            "additional_fees": 500,  # Processing, documentation, etc.
        }
        
        # Calculate totals
        context["subtotal"] = context["base_price"] + context["additional_fees"]
        context["grand_total"] = context["subtotal"]

        # Render HTML template
        template = "quotes/quote_pdf_template.html"
        html = render_to_string(template, context)
        
        # Generate PDF
        buffer = BytesIO()
        pisa_status = pisa.CreatePDF(
            html.encode('utf-8'), 
            dest=buffer,
            encoding='utf-8'
        )

        if pisa_status.err:
            raise Exception(f"PDF generation failed: {pisa_status.err}")

        buffer.seek(0)
        return buffer

    def send_quote_email(self, quote, vehicle):
        """Send professional quote email with PDF attachment"""
        from django.core.mail import EmailMultiAlternatives  # Changed import
    
        # Generate PDF
        pdf_buffer = self.generate_quote_pdf(quote, vehicle)

       # Email subject and content
        subject = f"Your Vehicle Quotation - {vehicle.make} {vehicle.model} | Auto Eden"
    
        # Plain text content
        text_content = f"""
         Dear {quote.full_name},

         Thank you for your interest in our {vehicle.make} {vehicle.model}.

         Please find attached your personalized quotation. The quote is valid for 24 hours.

         If you have any questions, please don't hesitate to contact us at admin@autoeden.co.zw or +263782222032.

         Best regards,
         Auto Eden Team
        """

        # HTML email body
        email_context = {
             "quote": quote,
             "vehicle": vehicle,
             "quote_id": f"QT-{quote.id:06d}",
             "company_name": "Auto Eden"
        }
    
        html_content = render_to_string("emails/quote_email_template.html", email_context)

        # Create and send email using EmailMultiAlternatives
        email = EmailMultiAlternatives(
             subject=subject,
             body=text_content,  # Plain text version
             from_email=settings.DEFAULT_FROM_EMAIL,
             to=[quote.email],
        )
    
        # Attach HTML version
        email.attach_alternative(html_content, "text/html")
    
        # Attach PDF
        pdf_filename = f"AutoEden_Quotation_{quote.id}_{vehicle.make}_{vehicle.model}.pdf"
        email.attach(pdf_filename, pdf_buffer.getvalue(), "application/pdf")

        # Send email
        email.send()

         # Notify admins
        self.notify_admins(quote, vehicle)

    def notify_admins(self, quote, vehicle):
        """Notify admin staff about new quote request"""
        admin_subject = f"🚗 New Quote Request: {vehicle.make} {vehicle.model} - QT-{quote.id:06d}"
        
        admin_context = {
            "quote": quote,
            "vehicle": vehicle,
            "quote_id": f"QT-{quote.id:06d}",
            "admin_url": f"{settings.SITE_URL}/admin/core/quoterequest/{quote.id}/change/"
        }
        
        admin_message = render_to_string("emails/new_quote_admin_template.html", admin_context)

        # Get admin emails
        from django.contrib.auth.models import User
        admin_emails = User.objects.filter(is_staff=True).values_list("email", flat=True)

        if admin_emails:
            admin_email = EmailMessage(
                subject=admin_subject,
                body=admin_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=list(admin_emails),
            )
            admin_email.content_subtype = "html"
            admin_email.send()


# Additional utility view for downloading quotes
class DownloadQuoteView(APIView):
    """Allow users to download their quote PDF directly"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, quote_id):
        try:
            quote = QuoteRequest.objects.get(id=quote_id)
            vehicle = quote.vehicle
            
            # Generate PDF
            quote_view = QuoteRequestView()
            pdf_buffer = quote_view.generate_quote_pdf(quote, vehicle)
            
            # Return PDF response
            response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="AutoEden_Quote_{quote_id}.pdf"'
            
            return response
            
        except QuoteRequest.DoesNotExist:
            return Response({"detail": "Quote not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"detail": f"PDF generation failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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


class VehicleDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, vehicle_id):
        vehicle = get_object_or_404(Vehicle, id=vehicle_id)
        
        # Track vehicle view
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
        
        VehicleView.objects.create(
            vehicle=vehicle,
            session_key=request.session.session_key,
            user=request.user if request.user.is_authenticated else None,
            ip_address=ip
        )
        
        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data)

class TrackVehicleView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, vehicle_id):
        # Get the vehicle object or return 404
        vehicle = get_object_or_404(Vehicle, id=vehicle_id)
        
        # Get client IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip_address = x_forwarded_for.split(',')[0] if x_forwarded_for \
            else request.META.get('REMOTE_ADDR')
        
        # Get session key (create one if doesn't exist)
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        # Check if this is a unique view (same session/user hasn't viewed in last 30 minutes)
        time_threshold = timezone.now() - timezone.timedelta(minutes=30)
        
        existing_view = VehicleView.objects.filter(
            vehicle=vehicle,
            session_key=session_key,
            timestamp__gte=time_threshold
        ).first()
        
        if request.user.is_authenticated:
            user_view = VehicleView.objects.filter(
                vehicle=vehicle,
                user=request.user,
                timestamp__gte=time_threshold
            ).first()
            if user_view:
                existing_view = user_view
        
        # If no recent view exists, create a new one
        if not existing_view:
            VehicleView.objects.create(
                vehicle=vehicle,
                session_key=session_key,
                user=request.user if request.user.is_authenticated else None,
                ip_address=ip_address
            )
            
            # Increment view count (using atomic update)
            vehicle.view_count = models.F('view_count') + 1
            vehicle.save(update_fields=['view_count'])
            
            return Response(
                {'status': 'View tracked', 'view_count': vehicle.view_count + 1},
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {'status': 'View already recorded recently', 'view_count': vehicle.view_count},
            status=status.HTTP_200_OK
        )

    def get_client_ip(self, request):
        """More robust IP address getter"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

from .models import WebsiteVisit, VehicleView
from django.db.models import Count, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta

class MarketplaceStatsView(APIView):
    def get(self, request):
        # Total marketplace visits (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        marketplace_visits = WebsiteVisit.objects.filter(
            timestamp__gte=thirty_days_ago,
            path__contains="/marketplace"
        ).count()

        # Vehicle views (last 30 days)
        vehicle_views = VehicleView.objects.filter(
            timestamp__gte=thirty_days_ago
        ).count()

        # Popular vehicles
        popular_vehicles = VehicleView.objects.filter(
            timestamp__gte=thirty_days_ago
        ).values(
            'vehicle__id',
            'vehicle__make',
            'vehicle__model',
            'vehicle__year'
        ).annotate(
            view_count=Count('id')
        ).order_by('-view_count')[:5]

        return Response({
            "marketplace_visits": marketplace_visits,
            "vehicle_views": vehicle_views,
            "popular_vehicles": list(popular_vehicles)
        })

class VehicleViewsView(APIView):
    def get(self, request, vehicle_id):
        # Total views for this vehicle
        total_views = VehicleView.objects.filter(vehicle_id=vehicle_id).count()

        # Views in the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_views = VehicleView.objects.filter(
            vehicle_id=vehicle_id,
            timestamp__gte=thirty_days_ago
        ).count()

        # Views over time (last 7 days)
        views_by_day = VehicleView.objects.filter(
            vehicle_id=vehicle_id,
            timestamp__gte=timezone.now() - timedelta(days=7)
        ).extra({
            'date': "date(timestamp)"
        }).values('date').annotate(
            views=Count('id')
        ).order_by('date')

        return Response({
            "total_views": total_views,
            "recent_views": recent_views,
            "views_by_day": list(views_by_day)
        })


class DashboardStatsView(APIView):
    """Combined dashboard statistics for admin dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Sum, Avg

        thirty_days_ago = timezone.now() - timedelta(days=30)
        seven_days_ago = timezone.now() - timedelta(days=7)

        # Vehicle statistics
        total_vehicles = Vehicle.objects.count()
        pending_vehicles = Vehicle.objects.filter(verification_state='pending').count()
        verified_vehicles = Vehicle.objects.filter(verification_state='physical').count()
        rejected_vehicles = Vehicle.objects.filter(verification_state='rejected').count()
        marketplace_vehicles = Vehicle.objects.filter(listing_type='marketplace').count()
        instant_sale_vehicles = Vehicle.objects.filter(listing_type='instant_sale').count()

        # Bid statistics
        total_bids = Bid.objects.count()
        pending_bids = Bid.objects.filter(status='pending').count()
        accepted_bids = Bid.objects.filter(status='accepted').count()
        total_bid_value = Bid.objects.aggregate(total=Sum('amount'))['total'] or 0

        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        new_users_this_month = User.objects.filter(date_joined__gte=thirty_days_ago).count()

        # Traffic statistics
        marketplace_visits = WebsiteVisit.objects.filter(
            timestamp__gte=thirty_days_ago,
            path__contains="/marketplace"
        ).count()
        vehicle_views = VehicleView.objects.filter(
            timestamp__gte=thirty_days_ago
        ).count()

        # Recent activity (last 7 days)
        new_vehicles_this_week = Vehicle.objects.filter(created_at__gte=seven_days_ago).count()
        new_bids_this_week = Bid.objects.filter(created_at__gte=seven_days_ago).count()
        new_users_this_week = User.objects.filter(date_joined__gte=seven_days_ago).count()

        # Vehicles by state breakdown
        vehicles_by_state = list(Vehicle.objects.values('verification_state').annotate(
            count=Count('id')
        ))

        # Top vehicles by views
        top_vehicles = list(VehicleView.objects.filter(
            timestamp__gte=thirty_days_ago
        ).values(
            'vehicle__id',
            'vehicle__make',
            'vehicle__model',
            'vehicle__year'
        ).annotate(
            view_count=Count('id')
        ).order_by('-view_count')[:5])

        return Response({
            'vehicles': {
                'total': total_vehicles,
                'pending': pending_vehicles,
                'verified': verified_vehicles,
                'rejected': rejected_vehicles,
                'marketplace': marketplace_vehicles,
                'instant_sale': instant_sale_vehicles,
                'new_this_week': new_vehicles_this_week,
                'by_state': vehicles_by_state,
            },
            'bids': {
                'total': total_bids,
                'pending': pending_bids,
                'accepted': accepted_bids,
                'total_value': total_bid_value,
                'new_this_week': new_bids_this_week,
            },
            'users': {
                'total': total_users,
                'active': active_users,
                'new_this_month': new_users_this_month,
                'new_this_week': new_users_this_week,
            },
            'traffic': {
                'marketplace_visits': marketplace_visits,
                'vehicle_views': vehicle_views,
                'top_vehicles': top_vehicles,
            }
        })


class ExportVehiclesView(APIView):
    """Export vehicles to CSV, Excel, or PDF."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from .exports import ExportService, log_export
        from .models import ExportConfiguration

        export_format = request.query_params.get('format', 'csv')
        config_id = request.query_params.get('config_id')

        # Get columns to export
        if config_id:
            try:
                config = ExportConfiguration.objects.get(id=config_id, user=request.user)
                columns = config.columns
            except ExportConfiguration.DoesNotExist:
                columns = list(ExportService.VEHICLE_COLUMNS.keys())
        else:
            columns = list(ExportService.VEHICLE_COLUMNS.keys())

        column_headers = [ExportService.VEHICLE_COLUMNS.get(col, col) for col in columns]

        # Build queryset with filters
        queryset = Vehicle.objects.select_related('owner').order_by('-created_at')

        # Apply filters
        verification_state = request.query_params.get('verification_state')
        if verification_state:
            queryset = queryset.filter(verification_state=verification_state)

        listing_type = request.query_params.get('listing_type')
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)

        # Generate export
        filename = f"vehicles_export_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
        record_count = queryset.count()

        if export_format == 'excel':
            response = ExportService.export_to_excel(queryset, columns, column_headers, filename)
        elif export_format == 'pdf':
            response = ExportService.export_to_pdf(queryset, columns, column_headers, filename, "Vehicle Export")
        else:
            response = ExportService.export_to_csv(queryset, columns, column_headers, filename)

        # Log the export
        log_export(
            user=request.user,
            export_type=export_format,
            data_type='vehicles',
            record_count=record_count,
            filters={
                'verification_state': verification_state,
                'listing_type': listing_type,
            },
            ip_address=request.META.get('REMOTE_ADDR'),
        )

        return response


class ExportBidsView(APIView):
    """Export bids to CSV, Excel, or PDF."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from .exports import ExportService, log_export

        export_format = request.query_params.get('format', 'csv')
        columns = list(ExportService.BID_COLUMNS.keys())
        column_headers = [ExportService.BID_COLUMNS.get(col, col) for col in columns]

        # Build queryset
        queryset = Bid.objects.select_related('vehicle', 'bidder').order_by('-created_at')

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Generate export
        filename = f"bids_export_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
        record_count = queryset.count()

        if export_format == 'excel':
            response = ExportService.export_to_excel(queryset, columns, column_headers, filename)
        elif export_format == 'pdf':
            response = ExportService.export_to_pdf(queryset, columns, column_headers, filename, "Bids Export")
        else:
            response = ExportService.export_to_csv(queryset, columns, column_headers, filename)

        # Log the export
        log_export(
            user=request.user,
            export_type=export_format,
            data_type='bids',
            record_count=record_count,
            filters={'status': status_filter},
            ip_address=request.META.get('REMOTE_ADDR'),
        )

        return response


class ExportConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing export configurations."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import ExportConfiguration
        return ExportConfiguration.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        from rest_framework import serializers
        from .models import ExportConfiguration

        class ExportConfigurationSerializer(serializers.ModelSerializer):
            class Meta:
                model = ExportConfiguration
                fields = ['id', 'name', 'columns', 'export_type', 'is_default', 'created_at', 'updated_at']
                read_only_fields = ['created_at', 'updated_at']

        return ExportConfigurationSerializer

    def perform_create(self, serializer):
        from .models import ExportConfiguration
        # If this is set as default, unset other defaults
        if serializer.validated_data.get('is_default'):
            ExportConfiguration.objects.filter(
                user=self.request.user,
                export_type=serializer.validated_data.get('export_type', 'vehicles')
            ).update(is_default=False)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        from .models import ExportConfiguration
        # If this is set as default, unset other defaults
        if serializer.validated_data.get('is_default'):
            ExportConfiguration.objects.filter(
                user=self.request.user,
                export_type=serializer.instance.export_type
            ).exclude(pk=serializer.instance.pk).update(is_default=False)
        serializer.save()


class ExportLogsView(APIView):
    """View export logs for the current user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import ExportLog

        if request.user.is_staff:
            logs = ExportLog.objects.all().order_by('-created_at')[:50]
        else:
            logs = ExportLog.objects.filter(user=request.user).order_by('-created_at')[:50]

        data = [{
            'id': log.id,
            'export_type': log.export_type,
            'data_type': log.data_type,
            'record_count': log.record_count,
            'created_at': log.created_at,
            'user': log.user.username,
        } for log in logs]

        return Response(data)