from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from core.sitemaps import VehicleSitemap

sitemaps = {
    'vehicles': VehicleSitemap,
}

urlpatterns = [
    path("admin/", admin.site.urls),
    path('core/', include('core.urls')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps},
         name='django.contrib.sitemaps.views.sitemap'),
]
