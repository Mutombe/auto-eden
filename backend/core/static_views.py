# core/static_views.py
"""
Views for static pages: Contact, Careers, News, and Reports.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import serializers
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import logging

from .models import Inquiry, JobPosition, JobApplication, Article, Report

logger = logging.getLogger(__name__)


# Serializers

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'type', 'name', 'email', 'phone', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


class JobPositionSerializer(serializers.ModelSerializer):
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = JobPosition
        fields = [
            'id', 'title', 'department', 'location', 'employment_type',
            'description', 'requirements', 'responsibilities', 'benefits',
            'salary_range', 'is_active', 'created_at', 'applications_count'
        ]
        read_only_fields = ['id', 'created_at']

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobApplicationSerializer(serializers.ModelSerializer):
    position_title = serializers.CharField(source='position.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'position', 'position_title', 'name', 'email', 'phone',
            'resume', 'cover_letter', 'linkedin_url', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']


class ArticleListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category', 'excerpt', 'featured_image',
            'author_name', 'is_featured', 'published_at', 'view_count'
        ]


class ArticleDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category', 'excerpt', 'content',
            'featured_image', 'author_name', 'is_featured', 'published_at',
            'view_count', 'meta_title', 'meta_description'
        ]


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id', 'type', 'reported_vehicle', 'reported_user', 'reason',
            'evidence', 'reporter_email', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# Views

class ContactView(APIView):
    """Public contact form endpoint."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = InquirySerializer(data=request.data)
        if serializer.is_valid():
            # Get IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

            inquiry = serializer.save(
                type='contact',
                ip_address=ip
            )

            # Send email notification to admins
            try:
                send_mail(
                    subject=f"New Contact Form Submission: {inquiry.subject or 'General Inquiry'}",
                    message=f"""
New contact form submission received:

Name: {inquiry.name}
Email: {inquiry.email}
Phone: {inquiry.phone or 'Not provided'}
Subject: {inquiry.subject or 'General Inquiry'}

Message:
{inquiry.message}

---
View in admin: {getattr(settings, 'SITE_URL', '')}/admin/core/inquiry/{inquiry.id}/change/
                    """.strip(),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.DEFAULT_FROM_EMAIL],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Failed to send contact notification email: {e}")

            return Response({
                'message': 'Thank you for contacting us! We will get back to you soon.',
                'id': inquiry.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobPositionViewSet(viewsets.ReadOnlyModelViewSet):
    """Public job positions endpoint."""
    serializer_class = JobPositionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return JobPosition.objects.filter(is_active=True)


class JobApplicationView(APIView):
    """Submit job application."""
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save()

            # Send confirmation email
            try:
                send_mail(
                    subject=f"Application Received - {application.position.title}",
                    message=f"""
Dear {application.name},

Thank you for applying for the {application.position.title} position at Auto Eden.

We have received your application and will review it carefully. If your qualifications match our requirements, we will contact you for the next steps.

Best regards,
Auto Eden HR Team
                    """.strip(),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[application.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Failed to send application confirmation: {e}")

            # Notify HR
            try:
                send_mail(
                    subject=f"New Job Application: {application.position.title}",
                    message=f"""
New application received:

Position: {application.position.title}
Applicant: {application.name}
Email: {application.email}
Phone: {application.phone}

View application: {getattr(settings, 'SITE_URL', '')}/admin/core/jobapplication/{application.id}/change/
                    """.strip(),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.DEFAULT_FROM_EMAIL],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Failed to send HR notification: {e}")

            return Response({
                'message': 'Your application has been submitted successfully!',
                'id': application.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """Public articles/news endpoint."""
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Article.objects.filter(is_published=True)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of article categories with counts."""
        from django.db.models import Count
        categories = Article.objects.filter(is_published=True).values('category').annotate(
            count=Count('id')
        )
        return Response(list(categories))


class ReportView(APIView):
    """Submit a report for vehicles, users, or content."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save(
                reporter=request.user if request.user.is_authenticated else None
            )

            # Notify admins
            try:
                from django.contrib.auth.models import User
                admin_emails = list(User.objects.filter(is_staff=True).values_list('email', flat=True))

                if admin_emails:
                    send_mail(
                        subject=f"New Report Submitted: {report.type}",
                        message=f"""
A new {report.type} report has been submitted.

Reason: {report.reason}

Reporter: {report.reporter.username if report.reporter else report.reporter_email or 'Anonymous'}

View report: {getattr(settings, 'SITE_URL', '')}/admin/core/report/{report.id}/change/
                        """.strip(),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=admin_emails,
                        fail_silently=True,
                    )
            except Exception as e:
                logger.error(f"Failed to send report notification: {e}")

            return Response({
                'message': 'Thank you for your report. We will review it shortly.',
                'id': report.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin ViewSets

class InquiryViewSet(viewsets.ModelViewSet):
    """Admin endpoint for managing inquiries."""
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Inquiry.objects.all()

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Mark inquiry as responded."""
        inquiry = self.get_object()
        response_text = request.data.get('response')

        if not response_text:
            return Response(
                {'error': 'Response text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        inquiry.response = response_text
        inquiry.responded_at = timezone.now()
        inquiry.assigned_to = request.user
        inquiry.status = 'resolved'
        inquiry.save()

        # Send response email
        try:
            send_mail(
                subject=f"Re: {inquiry.subject or 'Your Inquiry'} - Auto Eden",
                message=f"""
Dear {inquiry.name},

{response_text}

Best regards,
Auto Eden Team
                """.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[inquiry.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to send response email: {e}")

        return Response({'message': 'Response sent successfully'})


class AdminJobApplicationViewSet(viewsets.ModelViewSet):
    """Admin endpoint for managing job applications."""
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = JobApplication.objects.all()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update application status."""
        application = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = [s[0] for s in JobApplication.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = new_status
        application.reviewed_by = request.user
        if request.data.get('notes'):
            application.admin_notes = request.data['notes']
        application.save()

        return Response(JobApplicationSerializer(application).data)


class AdminArticleViewSet(viewsets.ModelViewSet):
    """Admin endpoint for managing articles."""
    serializer_class = ArticleDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Article.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish an article."""
        article = self.get_object()
        article.is_published = True
        article.published_at = timezone.now()
        article.save()
        return Response(ArticleDetailSerializer(article).data)

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish an article."""
        article = self.get_object()
        article.is_published = False
        article.save()
        return Response(ArticleDetailSerializer(article).data)


class AdminReportViewSet(viewsets.ModelViewSet):
    """Admin endpoint for managing reports."""
    permission_classes = [permissions.IsAdminUser]
    queryset = Report.objects.all()

    def get_serializer_class(self):
        class AdminReportSerializer(serializers.ModelSerializer):
            reporter_name = serializers.CharField(source='reporter.username', read_only=True)

            class Meta:
                model = Report
                fields = '__all__'

        return AdminReportSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a report."""
        report = self.get_object()
        report.status = 'resolved'
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        if request.data.get('notes'):
            report.admin_notes = request.data['notes']
        report.save()
        return Response({'message': 'Report resolved'})

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss a report."""
        report = self.get_object()
        report.status = 'dismissed'
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        if request.data.get('notes'):
            report.admin_notes = request.data['notes']
        report.save()
        return Response({'message': 'Report dismissed'})
