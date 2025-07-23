from django.contrib import admin
from .models import User, Vehicle, Bid, Profile, VehicleImage, Notification, VehicleSearch
from .models import WebsiteVisit, VehicleView
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

admin.site.register(Vehicle, AdminVehicleOverview)
admin.site.register(Bid, AdminBidOverview)
admin.site.register(VehicleImage, AdminImageOverview)
admin.site.register(Profile, AdminProfileOverview)
admin.site.register(Notification, AdminNotificationOverview)
admin.site.register(VehicleSearch, AdminVehicleSearchOverview)