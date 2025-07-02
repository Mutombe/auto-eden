# core/storage_backends.py

from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

class StaticStorage(S3Boto3Storage):
    location = 'static'
    default_acl = None  # Remove ACL setting
    file_overwrite = False

class PublicMediaStorage(S3Boto3Storage):
    location = 'media'
    default_acl = None  # Remove ACL setting - bucket policy will handle public access
    file_overwrite = False
    querystring_auth = False  # Don't add auth parameters to URLs

class PrivateMediaStorage(S3Boto3Storage):
    location = 'private'
    default_acl = None
    file_overwrite = False
    custom_domain = False
    querystring_auth = True  # Keep auth for private files