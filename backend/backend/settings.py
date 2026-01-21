#settings.py
from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "django-insecure-rg5$^x0nm)lmj0v6-2^x#nhk9uewd&k=lc@%jsu3^f^y3##34)"

DEBUG = os.getenv('DJANGO_ENV', 'production') == 'development'

ALLOWED_HOSTS = [
    'auto-eden-backend.onrender.com',
    'auto-eden.onrender.com',
    'autoeden.co.zw',
    'localhost',
    'http://127.0.0.1:8000/',
    '127.0.0.1'
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'django.contrib.sitemaps',
    'django.contrib.sites',

    # Third party
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    'django_filters',
    'storages',

    # Authentication
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',

    # Admin features
    'hijack',
    'import_export',

    # WebSockets
    'channels',

    # Local
    'core'
]

SITE_ID = 1

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "hijack.middleware.HijackUserMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    'http://localhost:5181',
    'http://localhost:5182',
    'http://localhost:5183',
    'http://localhost:5184',
    'http://localhost:5185',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5184',
    'https://auto-eden.onrender.com',
    'https://autoeden.co.zw',
]

CORS_TRUSTED_ORIGINS = [
    'https://auto-eden.onrender.com/',
    'https://autoeden.co.zw/',
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:5184',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_EXPOSE_HEADERS = ['content-type', 'authorization']
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:8000',
    'https://auto-eden.onrender.com',
    'https://auto-eden-backend.onrender.com',
    'https://autoeden.co.zw',
    'https://www.autoeden.co.zw',
]

# For Redis (recommended):

CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    
    # Ensure these are set correctly
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    
    # Optional: Add more detailed token settings
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Email Configuration (Development)
# settings.py

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'simbamtombe@gmail.com'  # Your Gmail address
EMAIL_HOST_PASSWORD = 'itzh jjkc hdmv csih'
DEFAULT_FROM_EMAIL = 'noreply@parameter.co.zw'
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
SITE_URL = os.environ.get('SITE_URL', 'https://parameter.co.zw')


#EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
#EMAIL_HOST = 'smtp.hostinger.com'  # Hostinger's SMTP server
#EMAIL_PORT = 587  # 465 for SSL
#EMAIL_USE_TLS = True  # Use False if using port 465
#EMAIL_USE_SSL = False  # Use True if using port 465
#EMAIL_HOST_USER = 'admin@autoeden.co.zw'
#EMAIL_HOST_PASSWORD = 'Admin@AutoEden2060'  # Password you set in Hostinger email account
#DEFAULT_FROM_EMAIL = 'Auto Eden <admin@autoeden.co.zw>'

SERVER_EMAIL = 'admin@autoeden.co.zw'
ADMIN_EMAIL = ['autoedemedia25@gmail.com', 'simbamtombe@gmail.com', 'simbarashemutombe1@gmail.com', 'admin@autoeden.co.zw']

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Django Allauth Configuration
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'username'
ACCOUNT_USER_MODEL_EMAIL_FIELD = 'email'
ACCOUNT_LOGOUT_ON_GET = True

# dj-rest-auth Configuration
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'auto-eden-auth',
    'JWT_AUTH_REFRESH_COOKIE': 'auto-eden-refresh',
    'JWT_AUTH_HTTPONLY': False,
    'SESSION_LOGIN': False,
    'REGISTER_SERIALIZER': 'core.auth.serializers.CustomRegisterSerializer',
    'USER_DETAILS_SERIALIZER': 'core.serializers.UserSerializer',
}

# Google OAuth Configuration (set these in environment variables)
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID', ''),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET', ''),
            'key': ''
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}

# Hijack Settings (Admin Impersonation)
HIJACK_PERMISSION_CHECK = lambda hijacker, hijacked: hijacker.is_superuser
HIJACK_INSERT_BEFORE = None
HIJACK_ALLOW_GET_REQUESTS = True

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / 'core/templates'],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = "backend.asgi.application"

# Channels Configuration
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'autoeden_dinnercoat',
        'USER': 'autoeden_dinnercoat',
        'PASSWORD': 'e28eab23b29b3f0de748c00e8bf58f0c57f33cd0',
        'HOST': '9q7a1c.h.filess.io',
        'PORT': '5434',
        'CONN_MAX_AGE': 0,
        'OPTIONS': {
            'options': '-c search_path=django_schema,public',
            'connect_timeout': 5,
        }
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        
    ],
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# DIGITALOCEAN SPACES / S3 CONFIGURATION
AWS_ACCESS_KEY_ID = 'DO8013WV2RVKZMWWT8NJ'
AWS_SECRET_ACCESS_KEY = 'u4GevFPGgAyxV4XXZxk2FrQuiogf3FeXLqKP/0v2d84'
AWS_STORAGE_BUCKET_NAME = 'autoeden'
AWS_S3_REGION_NAME = 'sgp1' 
AWS_S3_ENDPOINT_URL = f'https://{AWS_S3_REGION_NAME}.digitaloceanspaces.com' 
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_REGION_NAME}.cdn.digitaloceanspaces.com'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
AWS_DEFAULT_ACL = 'public-read' 
AWS_S3_FILE_OVERWRITE = False
AWS_QUERYSTRING_AUTH = False 

STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

print(f"S3 Configuration:")
print(f"AWS_ACCESS_KEY_ID: {AWS_ACCESS_KEY_ID[:10]}..." if AWS_ACCESS_KEY_ID else "Not set")
print(f"AWS_STORAGE_BUCKET_NAME: {AWS_STORAGE_BUCKET_NAME}")
print(f"AWS_S3_CUSTOM_DOMAIN: {AWS_S3_CUSTOM_DOMAIN}")

# STORAGES BACKEND CONFIGURATION
STORAGES = {
    "default": {
        "BACKEND": "dospace.storage.MediaStorage",
        "OPTIONS": {
            'default_acl': 'public-read',
            'custom_domain': AWS_S3_CUSTOM_DOMAIN,
        },
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3.S3StaticStorage",
        "OPTIONS": {
            'location': 'static', 
            'default_acl': 'public-read', 
        },
    },
}


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# WhatsApp Cloud API Configuration (Meta)
WHATSAPP_PHONE_NUMBER_ID = os.getenv('WHATSAPP_PHONE_NUMBER_ID', '')
WHATSAPP_ACCESS_TOKEN = os.getenv('WHATSAPP_ACCESS_TOKEN', '')
WHATSAPP_VERIFY_TOKEN = os.getenv('WHATSAPP_VERIFY_TOKEN', 'auto_eden_verify_token')

# Claude AI Configuration
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')

# Sentry Error Tracking
SENTRY_DSN = os.getenv('SENTRY_DSN', '')

if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.redis import RedisIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(
                transaction_style='url',
                middleware_spans=True,
            ),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        # Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring.
        traces_sample_rate=0.1,  # 10% of transactions
        # Set profiles_sample_rate to 1.0 to profile 100% of sampled transactions.
        profiles_sample_rate=0.1,
        # Send error messages to Sentry
        send_default_pii=True,
        # Environment
        environment=os.getenv('DJANGO_ENV', 'development'),
        # Release tracking
        release=os.getenv('APP_VERSION', '1.0.0'),
    )

# Elasticsearch Configuration
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': os.getenv('ELASTICSEARCH_URL', 'http://localhost:9200'),
    },
}

# Optional: Disable Elasticsearch auto-sync (use signals instead)
ELASTICSEARCH_DSL_AUTOSYNC = False
