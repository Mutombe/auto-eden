from django.contrib import admin
from .models import User, Vehicle, Bid, Profile, VehicleImage, Notification, VehicleSearch
from .models import WebsiteVisit, VehicleView
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.http import HttpResponse
from .models import QuoteRequest
from .views import QuoteRequestView
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