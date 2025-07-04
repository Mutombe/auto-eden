from pathlib import Path
from datetime import timedelta
import os
from decouple import config
 

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-rg5$^x0nm)lmj0v6-2^x#nhk9uewd&k=lc@%jsu3^f^y3##34)"

# SECURITY WARNING: don't run with debug turned on in production!

# Add this to your settings.py temporarily for debugging
import logging

# Enable detailed logging for storage operations
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'storages': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'boto3': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'botocore': {
            'handlers': ['console'],
            'level': 'DEBUG', 
            'propagate': True,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Test your S3 connection in Django shell
# python manage.py shell
"""
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# Test basic S3 connection
try:
    # Test writing a file
    test_file = ContentFile(b'Hello S3!')
    file_path = default_storage.save('test/hello.txt', test_file)
    print(f"File saved to: {file_path}")
    print(f"File URL: {default_storage.url(file_path)}")
    
    # Test if file exists
    exists = default_storage.exists(file_path)
    print(f"File exists: {exists}")
    
    # Test reading the file back
    if exists:
        with default_storage.open(file_path, 'rb') as f:
            content = f.read()
            print(f"File content: {content}")
    
    # Clean up
    default_storage.delete(file_path)
    print("Test file deleted")
    
except Exception as e:
    print(f"S3 Error: {e}")
    import traceback
    traceback.print_exc()
"""
DEBUG = False

ALLOWED_HOSTS = [
    'auto-eden-backend.onrender.com',
    'auto-eden.onrender.com',
    'autoeden.co.zw',
    'localhost',
    'http://127.0.0.1:8000/',
    '127.0.0.1'
]


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    #local
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    'django_filters',
    'storages',
    'core'
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://auto-eden.onrender.com',
    'https://autoeden.co.zw',
    'http://127.0.0.1:5173',
]

CORS_TRUSTED_ORIGINS = [
    'https://auto-eden.onrender.com/',
    'https://autoeden.co.zw/',
    'http://localhost:5173',
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
CORS_ALLOW_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

# For Redis (recommended):

CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
# For RabbitMQ:
# CELERY_BROKER_URL = 'amqp://guest:guest@localhost:5672//'

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
#EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.hostinger.com'  # Hostinger's SMTP server
EMAIL_PORT = 587  # 465 for SSL
EMAIL_USE_TLS = True  # Use False if using port 465
EMAIL_USE_SSL = False  # Use True if using port 465
EMAIL_HOST_USER = 'admin@autoeden.co.zw'
EMAIL_HOST_PASSWORD = 'Admin@AutoEden2060'  # Password you set in Hostinger email account
DEFAULT_FROM_EMAIL = 'Auto Eden <admin@autoeden.co.zw>'
SERVER_EMAIL = 'admin@autoeden.co.zw'  # For error notifications
ADMIN_EMAIL = []  # Admin email for notifications
AUTHENTICATION_BACKENDS = [
   'django.contrib.auth.backends.ModelBackend',
]

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


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

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

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

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


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

# DIGITALOCEAN SPACES / S3 CONFIGURATION
AWS_ACCESS_KEY_ID = 'DO8013WV2RVKZMWWT8NJ'
AWS_SECRET_ACCESS_KEY = 'u4GevFPGgAyxV4XXZxk2FrQuiogf3FeXLqKP/0v2d84'
AWS_STORAGE_BUCKET_NAME = 'autoeden'
AWS_S3_REGION_NAME = 'sgp1'  # **FIX 1: Explicitly set the correct region**
AWS_S3_ENDPOINT_URL = f'https://{AWS_S3_REGION_NAME}.digitaloceanspaces.com' # **FIX 2: Use the correct regional endpoint**
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_REGION_NAME}.cdn.digitaloceanspaces.com'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
AWS_DEFAULT_ACL = 'private'  # Keep files private and use pre-signed URLs
AWS_S3_FILE_OVERWRITE = False
AWS_QUERYSTRING_AUTH = True # **FIX 3: Ensure pre-signed URLs are generated**

# STATIC FILES CONFIGURATION
# settings.py

# ... other settings

# STATIC FILES & MEDIA CONFIGURATION
# This is the base URL that will be used for constructing file URLs in your templates and APIs

MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
MEDIA_ROOT = BASE_DIR / 'media' # For local development fallback if needed

STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'

print(f"S3 Configuration:")
print(f"AWS_ACCESS_KEY_ID: {AWS_ACCESS_KEY_ID[:10]}..." if AWS_ACCESS_KEY_ID else "Not set")
print(f"AWS_STORAGE_BUCKET_NAME: {AWS_STORAGE_BUCKET_NAME}")
print(f"AWS_S3_CUSTOM_DOMAIN: {AWS_S3_CUSTOM_DOMAIN}")

# STORAGES BACKEND CONFIGURATION
STORAGES = {
    "default": {
        "BACKEND": "dospace.storage.CustomMediaS3Boto3Storage",
        "OPTIONS": {
            'location': 'media', # All media uploads go into the 'media' folder
            'default_acl': 'public-read',
        },
    },
    "staticfiles": {
        "BACKEND": "storages.backends.s3.S3StaticStorage",
        "OPTIONS": {
            'location': 'static', # All static files go into the 'static' folder
            'default_acl': 'public-read', # Static files should be public
        },
    },
}

# ... rest of your settings

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
