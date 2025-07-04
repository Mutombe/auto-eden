import os
from .settings import *
from .settings import BASE_DIR
import os
from dotenv import load_dotenv
 
load_dotenv()

# SECURITY SETTINGS
ALLOWED_HOSTS = [
    os.environ.get('RENDER_EXTERNAL_HOSTNAME'),
    'auto-eden-backend.onrender.com',
    'https://autoeden.co.zw',
    'auto-eden.onrender.com',
]

DEBUG = True
SECRET_KEY = SECRET_KEY

# CORS SETTINGS
CORS_ALLOWED_ORIGINS = [
    'https://auto-eden.onrender.com',
    'https://autoeden.co.zw',
    'https://www.auto-eden.onrender.com',
    'https://auto-eden-backend.onrender.com',
    'http://localhost:5173',
]

CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Content-Type', 'Authorization']

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

CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-csrftoken',
    'authorization'
]

CSRF_TRUSTED_ORIGINS = [
    'https://auto-eden.onrender.com',
    'https://autoeden.co.zw',
    'https://auto-eden-backend.onrender.com'
]

# MIDDLEWARE CONFIGURATION
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

AWS_ACCESS_KEY_ID = 'DO8013WV2RVKZMWWT8NJ'
AWS_SECRET_ACCESS_KEY = 'u4GevFPGgAyxV4XXZxk2FrQuiogf3FeXLqKP/0v2d84'
AWS_STORAGE_BUCKET_NAME = 'autoeden'
AWS_S3_REGION_NAME = 'sgp1'  # **FIX 1: Explicitly set the correct region**
AWS_S3_ENDPOINT_URL = f'https://{AWS_S3_REGION_NAME}.digitaloceanspaces.com' # **FIX 2: Use the correct regional endpoint**
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_REGION_NAME}.cdn.digitaloceanspaces.com'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
AWS_DEFAULT_ACL = 'public-read'  # Keep files private and use pre-signed URLs
AWS_S3_FILE_OVERWRITE = False
AWS_QUERYSTRING_AUTH = False # **FIX 3: Ensure pre-signed URLs are generated**


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


# DATABASE CONFIGURATION

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'autoeden_weatherfat',
        'USER': 'autoeden_weatherfat',
        'PASSWORD': '834e99407bfeaf721e0f2a482be7b2f6afad7eab',
        'HOST': 'xs3gi.h.filess.io',
        'PORT': '5434',
        'OPTIONS': {
            'options': '-c search_path=django_schema,public',
            'connect_timeout': 5,
        }
    }
}


# SECURITY MIDDLEWARE SETTINGS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# REST FRAMEWORK SETTINGS
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
       'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ] if not DEBUG else [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

# deployment_Settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# WHITENOISE CONFIGURATION
WHITENOISE_AUTOREFRESH = True
WHITENOISE_USE_FINDERS = True
WHITENOISE_MANIFEST_STRICT = False
WHITENOISE_ALLOW_ALL_ORIGINS = True

# SESSION SETTINGS
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 1209600  # 2 weeks in seconds
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_SAMESITE = 'Lax'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB