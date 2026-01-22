import os
from datetime import timedelta
from .settings import *
from .settings import BASE_DIR
from dotenv import load_dotenv

load_dotenv()

# SECURITY SETTINGS
ALLOWED_HOSTS = [
    os.environ.get('RENDER_EXTERNAL_HOSTNAME'),
    'auto-eden-backend.onrender.com',
    'autoeden.co.zw',
    'www.autoeden.co.zw',
    'auto-eden.onrender.com',
    'localhost',
    '127.0.0.1',
]

DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)

# CORS SETTINGS
CORS_ALLOWED_ORIGINS = [
    'https://auto-eden.onrender.com',
    'https://autoeden.co.zw',
    'https://www.autoeden.co.zw',
    'https://www.auto-eden.onrender.com',
    'https://auto-eden-backend.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Content-Type', 'Authorization', 'X-CSRFToken']

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
    'https://www.autoeden.co.zw',
    'https://auto-eden-backend.onrender.com',
    'https://www.auto-eden.onrender.com',
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
    'allauth.account.middleware.AccountMiddleware',
    'hijack.middleware.HijackUserMiddleware',
]

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


# SECURITY MIDDLEWARE SETTINGS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
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
SESSION_COOKIE_SAMESITE = 'None'  # Required for cross-origin requests
CSRF_COOKIE_SAMESITE = 'None'  # Required for cross-origin requests

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB