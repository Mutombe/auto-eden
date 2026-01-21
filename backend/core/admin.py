from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Vehicle, Bid, Profile, VehicleImage, Notification, VehicleSearch
from .models import WebsiteVisit, VehicleView
from .models import (
    QuoteRequest, NotificationPreference, ExportConfiguration, ExportLog,
    Inquiry, JobPosition, JobApplication, Article, Report, SellerReview, SellerBadge,
    VehicleDraft
)
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.http import HttpResponse
from hijack.contrib.admin import HijackUserAdminMixin
from .views import QuoteRequestView


# Custom User Admin with Impersonation
class UserProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class CustomUserAdmin(HijackUserAdminMixin, BaseUserAdmin):
    """Enhanced User Admin with impersonation and profile inline."""
    inlines = [UserProfileInline]
    list_display = [
        'username', 'email', 'first_name', 'last_name',
        'is_active', 'is_staff', 'date_joined', 'last_login',
        'hijack_button'
    ]
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


# Unregister default User admin and register custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
class AdminProfileOverview(admin.ModelAdmin):
    list_display = (
        "id",
        "profile_picture",
        "user",
    )
    search_fields = ("user",)

class AdminNotificationOverview(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "notification_type",
    )
    search_fields = ("user",)

class AdminVehicleOverview(admin.ModelAdmin):
    list_display = (
        "id",
        "owner",
        "make",
        "price",
    )
    search_fields = ("make",)

class AdminImageOverview(admin.ModelAdmin):
    list_display = (
        "id",
        "image",
        "vehicle",
    )
    search_fields = ("vehicle",)

class AdminBidOverview(admin.ModelAdmin):
    list_display = (
        "id",
        "vehicle",
        "bidder",
        "amount",
    )
    search_fields = ("vehicle",)

class AdminVehicleSearchOverview(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "make",
        "match_count"
    )
    search_fields = ("user",)
    list_filter = ("created_at",)




@admin.register(WebsiteVisit)
class WebsiteVisitAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'path', 'ip_address')
    list_filter = ('timestamp',)
    search_fields = ('user__username', 'path', 'ip_address')

@admin.register(VehicleView)
class VehicleViewAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'timestamp', 'user', 'ip_address')
    list_filter = ('timestamp', 'vehicle')
    search_fields = ('vehicle__make', 'user__username', 'ip_address')

@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'vehicle_display', 'full_name', 'email', 
        'country', 'status_badge', 'priority_badge', 
        'created_at', 'is_expired_display', 'actions_display'
    ]
    list_filter = [
        'status', 'priority', 'is_processed', 'country', 
        'created_at', 'quote_email_sent'
    ]
    search_fields = [
        'full_name', 'email', 'telephone', 'vehicle__make', 
        'vehicle__model', 'note'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'is_expired', 'time_remaining',
        'email_sent_at'
    ]
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('full_name', 'email', 'telephone', 'country', 'city', 'address')
        }),
        ('Vehicle & Request Details', {
            'fields': ('vehicle', 'note')
        }),
        ('Status & Processing', {
            'fields': ('status', 'priority', 'is_processed', 'processed_by', 'processed_at', 'admin_notes')
        }),
        ('Email Tracking', {
            'fields': ('quote_email_sent', 'email_sent_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_expired', 'time_remaining'),
            'classes': ('collapse',)
        }),
    )
    
    def vehicle_display(self, obj):
        return f"{obj.vehicle.make} {obj.vehicle.model}"
    vehicle_display.short_description = "Vehicle"
    
    def status_badge(self, obj):
        colors = {
            'pending': '#fbbf24',
            'reviewed': '#3b82f6',
            'quoted': '#10b981',
            'converted': '#059669',
            'expired': '#ef4444',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"
    
    def priority_badge(self, obj):
        colors = {
            'low': '#6b7280',
            'medium': '#3b82f6',
            'high': '#f59e0b',
            'urgent': '#ef4444',
        }
        color = colors.get(obj.priority, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_badge.short_description = "Priority"
    
    def is_expired_display(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: #ef4444;">⚠️ Expired</span>')
        return format_html('<span style="color: #10b981;">✅ Valid</span>')
    is_expired_display.short_description = "Validity"
    
    def actions_display(self, obj):
        download_url = reverse('admin:download_quote_pdf', args=[obj.id])
        email_url = f"mailto:{obj.email}"
        return format_html(
            '<a href="{}" target="_blank">📄 PDF</a> | <a href="{}">📧 Email</a>',
            download_url, email_url
        )
    actions_display.short_description = "Actions"
    
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                'download-pdf/<int:quote_id>/',
                self.admin_site.admin_view(self.download_quote_pdf),
                name='download_quote_pdf',
            ),
        ]
        return custom_urls + urls
    
    def download_quote_pdf(self, request, quote_id):
        try:
            quote = QuoteRequest.objects.get(id=quote_id)
            vehicle = quote.vehicle
            
            # Generate PDF using the same method as the view
            quote_view = QuoteRequestView()
            pdf_buffer = quote_view.generate_quote_pdf(quote, vehicle)
            
            response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="AutoEden_Quote_{quote_id}.pdf"'
            
            return response
        except QuoteRequest.DoesNotExist:
            self.message_user(request, f"Quote {quote_id} not found.", level='ERROR')
            return self.changelist_view(request)
        except Exception as e:
            self.message_user(request, f"Error generating PDF: {str(e)}", level='ERROR')
            return self.changelist_view(request)

admin.site.register(Vehicle, AdminVehicleOverview)
admin.site.register(Bid, AdminBidOverview)
admin.site.register(VehicleImage, AdminImageOverview)
admin.site.register(Profile, AdminProfileOverview)
admin.site.register(Notification, AdminNotificationOverview)
admin.site.register(VehicleSearch, AdminVehicleSearchOverview)


# New Model Admins

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_vehicle_approved', 'email_new_bid', 'push_enabled', 'whatsapp_enabled']
    list_filter = ['email_vehicle_approved', 'email_new_bid', 'push_enabled', 'whatsapp_enabled']
    search_fields = ['user__username', 'user__email']


@admin.register(ExportConfiguration)
class ExportConfigurationAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'export_type', 'is_default', 'created_at']
    list_filter = ['export_type', 'is_default', 'created_at']
    search_fields = ['name', 'user__username']


@admin.register(ExportLog)
class ExportLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'data_type', 'export_type', 'record_count', 'created_at']
    list_filter = ['data_type', 'export_type', 'created_at']
    search_fields = ['user__username']
    date_hierarchy = 'created_at'


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'name', 'email', 'status_badge', 'assigned_to', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['created_at', 'ip_address']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Contact Information', {
            'fields': ('type', 'name', 'email', 'phone', 'ip_address')
        }),
        ('Message', {
            'fields': ('subject', 'message')
        }),
        ('Status & Response', {
            'fields': ('status', 'assigned_to', 'response', 'responded_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        colors = {
            'new': '#fbbf24',
            'in_progress': '#3b82f6',
            'resolved': '#10b981',
            'closed': '#6b7280',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"


@admin.register(JobPosition)
class JobPositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'location', 'employment_type', 'is_active', 'applications_count', 'created_at']
    list_filter = ['department', 'employment_type', 'location', 'is_active']
    search_fields = ['title', 'department', 'description']
    prepopulated_fields = {'slug': ('title',)}

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'department', 'location', 'employment_type')
        }),
        ('Job Details', {
            'fields': ('description', 'requirements', 'responsibilities', 'benefits')
        }),
        ('Compensation & Status', {
            'fields': ('salary_range', 'is_active')
        }),
    )

    def applications_count(self, obj):
        count = obj.applications.count()
        return format_html('<strong>{}</strong> applications', count)
    applications_count.short_description = "Applications"


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'email', 'status_badge', 'created_at', 'reviewed_by']
    list_filter = ['status', 'position', 'created_at']
    search_fields = ['name', 'email', 'position__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Applicant Information', {
            'fields': ('name', 'email', 'phone', 'linkedin_url')
        }),
        ('Application', {
            'fields': ('position', 'resume', 'cover_letter')
        }),
        ('Review', {
            'fields': ('status', 'reviewed_by', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending': '#fbbf24',
            'reviewed': '#3b82f6',
            'shortlisted': '#8b5cf6',
            'interviewed': '#6366f1',
            'offered': '#10b981',
            'rejected': '#ef4444',
            'withdrawn': '#6b7280',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'is_published', 'is_featured', 'view_count', 'published_at']
    list_filter = ['category', 'is_published', 'is_featured', 'created_at']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Article Information', {
            'fields': ('title', 'slug', 'category', 'author')
        }),
        ('Content', {
            'fields': ('excerpt', 'content', 'featured_image')
        }),
        ('Publishing', {
            'fields': ('is_published', 'is_featured', 'published_at')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Stats & Timestamps', {
            'fields': ('view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'status_badge', 'reporter_display', 'created_at', 'resolved_by']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['reason', 'reporter__username', 'reporter_email']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Report Information', {
            'fields': ('type', 'reason', 'evidence')
        }),
        ('Reporter', {
            'fields': ('reporter', 'reporter_email')
        }),
        ('Reported Content', {
            'fields': ('reported_vehicle', 'reported_user')
        }),
        ('Resolution', {
            'fields': ('status', 'resolved_by', 'resolved_at', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending': '#fbbf24',
            'investigating': '#3b82f6',
            'resolved': '#10b981',
            'dismissed': '#6b7280',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def reporter_display(self, obj):
        if obj.reporter:
            return obj.reporter.username
        return obj.reporter_email or 'Anonymous'
    reporter_display.short_description = "Reporter"


@admin.register(SellerReview)
class SellerReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'seller', 'reviewer', 'rating_display', 'is_verified_purchase', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'is_approved', 'is_flagged', 'created_at']
    search_fields = ['seller__username', 'reviewer__username', 'title', 'comment']
    readonly_fields = ['helpful_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Review Details', {
            'fields': ('seller', 'reviewer', 'vehicle', 'rating', 'title', 'comment')
        }),
        ('Verification & Status', {
            'fields': ('is_verified_purchase', 'is_approved', 'is_flagged')
        }),
        ('Engagement', {
            'fields': ('helpful_count',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def rating_display(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html(
            '<span style="color: #f59e0b; font-size: 14px;">{}</span>',
            stars
        )
    rating_display.short_description = "Rating"


@admin.register(SellerBadge)
class SellerBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge_type', 'is_active', 'awarded_at', 'expires_at']
    list_filter = ['badge_type', 'is_active', 'awarded_at']
    search_fields = ['user__username', 'user__email']
    date_hierarchy = 'awarded_at'

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing badge
            return ['user', 'badge_type', 'awarded_at']
        return ['awarded_at']


@admin.register(VehicleDraft)
class VehicleDraftAdmin(admin.ModelAdmin):
    list_display = ['id', 'owner', 'draft_title', 'step', 'completion_display', 'is_expired_display', 'updated_at']
    list_filter = ['step', 'is_complete', 'created_at']
    search_fields = ['owner__username', 'draft_title']
    readonly_fields = ['created_at', 'updated_at', 'completion_percentage']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Owner', {
            'fields': ('owner',)
        }),
        ('Draft Information', {
            'fields': ('draft_title', 'step', 'is_complete', 'completion_percentage')
        }),
        ('Data', {
            'fields': ('data', 'images'),
            'classes': ('collapse',)
        }),
        ('Expiration', {
            'fields': ('expires_at',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def completion_display(self, obj):
        percentage = obj.completion_percentage
        color = '#10b981' if percentage >= 80 else '#f59e0b' if percentage >= 50 else '#ef4444'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>',
            color, percentage
        )
    completion_display.short_description = "Completion"

    def is_expired_display(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: #ef4444;">Expired</span>')
        return format_html('<span style="color: #10b981;">Active</span>')
    is_expired_display.short_description = "Status"


# Customize Admin Site Header
admin.site.site_header = "Auto Eden Administration"
admin.site.site_title = "Auto Eden Admin"
admin.site.index_title = "Welcome to Auto Eden Admin Portal"