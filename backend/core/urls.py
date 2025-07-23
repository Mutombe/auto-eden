from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import QuoteRequestView, VehicleViewSet,VehicleSearchViewSet, BidViewSet, RegisterView, CustomTokenObtainPairView, MarketplaceView, InstantSaleViewSet, ProfileView, UserViewSet, PublicVehicleViewSet, TrackVehicleView, MarketplaceStatsView, VehicleViewsView

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicles')
router.register(r'all-vehicles', PublicVehicleViewSet, basename='public-vehicles')
router.register(r'vehicle-searches', VehicleSearchViewSet, basename='vehiclesearch')
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'users', UserViewSet, basename='users')


urlpatterns = [
    path('', include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path('marketplace/', MarketplaceView.as_view(), name='marketplace'),
    path('vehicles/<int:vehicle_id>/request-quote/', QuoteRequestView.as_view(), name='request-quote'),
    path('vehicles/<int:vehicle_id>/track_view/', TrackVehicleView.as_view(), name='track-vehicle-view'),
    path('analytics/marketplace-stats/', MarketplaceStatsView.as_view()),
    path('analytics/vehicle-views/<int:vehicle_id>/', VehicleViewsView.as_view()),
    path('profile/', ProfileView.as_view(), name='profile'),
    path("auth/login/", CustomTokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
]