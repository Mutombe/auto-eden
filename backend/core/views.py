# vehicles/views.py
from urllib.parse import urlencode
from django.core.cache import cache
from rest_framework import viewsets, permissions
from .models import QuoteRequest, Vehicle, Bid, Profile, User, VehicleSearch
from .models import VehicleView
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


logger = logging.getLogger(__name__)


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
    serializer_class = VehicleSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Vehicle.objects.select_related('owner').prefetch_related('images', 'bids__bidder')

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, JSONParser]

    def get_queryset(self):
        
        if self.request.user.is_staff:
            return Vehicle.objects.all()
        return Vehicle.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

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
        queryset = self.get_queryset().filter(
            is_digitally_verified=False, is_physically_verified=False, is_rejected=False
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["patch"], permission_classes=[permissions.IsAdminUser]
    )
    def review(self, request, pk=None):
        return self.verify(request, pk) 

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
        queryset = self.filter_queryset(
            self.get_queryset().filter(verification_state="pending")
        )
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
        except Exception as e:
            logger.error(f"Vehicle creation failed: {str(e)}")
            logger.exception("Full traceback:")
            return Response(
                {"detail": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
    
from rest_framework.pagination import PageNumberPagination

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
            'id', 'make', 'model', 'year', 'price', 'mileage', 
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