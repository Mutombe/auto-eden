# vehicles/sitemaps.py
from django.contrib.sitemaps import Sitemap
from .models import Vehicle

class VehicleSitemap(Sitemap):
    # How often the page is expected to change
    changefreq = "daily" 
    # Importance relative to other pages (0.0 to 1.0)
    priority = 0.9       

    def items(self):
        # Only index vehicles that are live on the marketplace
        return Vehicle.objects.filter(
            verification_state="physical", 
            is_visible=True
        ).order_by('-created_at')

    def lastmod(self, obj):
        # Tells Google when the car listing was last updated
        return obj.updated_at

    def location(self, obj):
        # IMPORTANT: This must match your React URL structure exactly
        # If your React app is at autoeden.co.zw/vehicles/1
        return f"/vehicles/{obj.id}"