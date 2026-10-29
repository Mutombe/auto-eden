from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from core.sitemaps import VehicleSitemap
from core.share_views import vehicle_share_page, vehicle_share_image

sitemaps = {
    'vehicles': VehicleSitemap,
}

urlpatterns = [
    path("admin/", admin.site.urls),
    path('hijack/', include('hijack.urls')),  # User impersonation
    path('core/', include('core.urls')),
    # Link previews for cars (crawlers can't run the SPA); see core/share_views.py
    path('share/vehicles/<int:vehicle_id>/', vehicle_share_page, name='vehicle-share'),
    path('share/vehicles/<int:vehicle_id>/image.jpg', vehicle_share_image, name='vehicle-share-image'),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps},
         name='django.contrib.sitemaps.views.sitemap'),
]
