from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    DownloadQuoteView,
    QuoteRequestView,
    VehicleViewSet,
    VehicleSearchViewSet,
    VehicleDraftViewSet,
    BidViewSet,
    RegisterView,
    CustomTokenObtainPairView,
    MarketplaceView,
    InstantSaleViewSet,
    ProfileView,
    UserViewSet,
    PublicVehicleViewSet,
    TrackVehicleView,
    MarketplaceStatsView,
    VehicleViewsView,
    DashboardStatsView,
    NotificationPreferencesView,
    ExportVehiclesView,
    ExportBidsView,
    ExportConfigurationViewSet,
    ExportLogsView,
    vehicle_id_list,
)
from .notification_views import NotificationViewSet
from .search.views import VehicleSearchView, VehicleAutocompleteView
from .ai.views import (
    AIStatusView,
    AIChatView,
    VehicleAIAnalysisView,
    VehicleAIQuestionView,
    GenerateDescriptionView,
    SuggestPriceView,
    DraftEmailView,
)
from .static_views import (
    ContactView,
    JobPositionViewSet,
    JobApplicationView,
    ArticleViewSet,
    ReportView,
    InquiryViewSet,
    AdminJobApplicationViewSet,
    AdminArticleViewSet,
    AdminReportViewSet,
)
from .auth.views import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ChangePasswordView,
    ChangeEmailView,
    GoogleLoginView,
    VerifyEmailView,
    ResendVerificationEmailView,
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicles')
router.register(r'all-vehicles', PublicVehicleViewSet, basename='public-vehicles')
router.register(r'vehicle-searches', VehicleSearchViewSet, basename='vehiclesearch')
router.register(r'vehicle-drafts', VehicleDraftViewSet, basename='vehicle-drafts')
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'users', UserViewSet, basename='users')
router.register(r'export-configurations', ExportConfigurationViewSet, basename='export-configurations')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'jobs', JobPositionViewSet, basename='jobs')
router.register(r'articles', ArticleViewSet, basename='articles')
router.register(r'admin/inquiries', InquiryViewSet, basename='admin-inquiries')
router.register(r'admin/applications', AdminJobApplicationViewSet, basename='admin-applications')
router.register(r'admin/articles', AdminArticleViewSet, basename='admin-articles')
router.register(r'admin/reports', AdminReportViewSet, basename='admin-reports')


urlpatterns = [
    path('', include(router.urls)),

    # Authentication endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("auth/change-email/", ChangeEmailView.as_view(), name="change-email"),
    path("auth/google/", GoogleLoginView.as_view(), name="google-login"),
    path("auth/verify-email/<str:token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("auth/resend-verification/", ResendVerificationEmailView.as_view(), name="resend-verification"),

    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/notification-preferences/', NotificationPreferencesView.as_view(), name='notification-preferences'),

    # Marketplace
    path('marketplace/', MarketplaceView.as_view(), name='marketplace'),

    # Quotes
    path('vehicles/<int:vehicle_id>/request-quote/', QuoteRequestView.as_view(), name='request-quote'),
    path('vehicles/id-list/', vehicle_id_list, name='vehicle-slugs'),
    path('quotes/<int:quote_id>/download/', DownloadQuoteView.as_view(), name='download-quote'),

    # Analytics
    path('vehicles/<int:vehicle_id>/track_view/', TrackVehicleView.as_view(), name='track-vehicle-view'),
    path('analytics/marketplace-stats/', MarketplaceStatsView.as_view(), name='marketplace-stats'),
    path('analytics/vehicle-views/<int:vehicle_id>/', VehicleViewsView.as_view(), name='vehicle-views'),
    path('stats/dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Export endpoints
    path('exports/vehicles/', ExportVehiclesView.as_view(), name='export-vehicles'),
    path('exports/bids/', ExportBidsView.as_view(), name='export-bids'),
    path('exports/logs/', ExportLogsView.as_view(), name='export-logs'),

    # Search endpoints (Elasticsearch)
    path('search/', VehicleSearchView.as_view(), name='vehicle-search'),
    path('search/autocomplete/', VehicleAutocompleteView.as_view(), name='vehicle-autocomplete'),

    # AI endpoints (Claude)
    path('ai/status/', AIStatusView.as_view(), name='ai-status'),
    path('ai/chat/', AIChatView.as_view(), name='ai-chat'),
    path('ai/vehicles/<int:vehicle_id>/analyze/', VehicleAIAnalysisView.as_view(), name='ai-vehicle-analysis'),
    path('ai/vehicles/<int:vehicle_id>/ask/', VehicleAIQuestionView.as_view(), name='ai-vehicle-question'),
    path('ai/generate-description/', GenerateDescriptionView.as_view(), name='ai-generate-description'),
    path('ai/suggest-price/', SuggestPriceView.as_view(), name='ai-suggest-price'),
    path('ai/draft-email/', DraftEmailView.as_view(), name='ai-draft-email'),

    # Static pages endpoints
    path('contact/', ContactView.as_view(), name='contact'),
    path('jobs/apply/', JobApplicationView.as_view(), name='job-apply'),
    path('reports/', ReportView.as_view(), name='report'),
]