"""
ASGI config for Auto Eden backend project.

It exposes the ASGI callable as a module-level variable named ``application``.
Supports both HTTP and WebSocket protocols via Django Channels.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

settings_module = 'backend.deployment' if 'RENDER_EXTERNAL_HOSTNAME' in os.environ else 'backend.settings'
os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Import after Django setup
from core.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
