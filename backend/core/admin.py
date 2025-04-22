from django.contrib import admin
from .models import User, Vehicle, Bid, Profile, VehicleImage

class AdminProfileOverview(admin.ModelAdmin):
    list_display = (
        "id",
        "profile_picture",
        "user",
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


admin.site.register(Vehicle, AdminVehicleOverview)
admin.site.register(Bid, AdminBidOverview)
admin.site.register(VehicleImage, AdminImageOverview)
admin.site.register(Profile, AdminProfileOverview)