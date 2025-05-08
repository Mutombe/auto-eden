from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import VehicleViewSet, BidViewSet, RegisterView, CustomTokenObtainPairView, MarketplaceView, InstantSaleViewSet, ProfileView, UserViewSet, PublicVehicleViewSet 

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicles')
router.register(r'all-vehicles', PublicVehicleViewSet, basename='public-vehicles')
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'users', UserViewSet, basename='users')


urlpatterns = [
    path('', include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path('marketplace/', MarketplaceView.as_view(), name='marketplace'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path("auth/login/", CustomTokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
]