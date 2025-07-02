from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

class Command(BaseCommand):
    help = 'Check S3 configuration and connectivity'

    def handle(self, *args, **options):
        self.stdout.write("=== S3 Configuration Check ===")
        
        # Check environment variables
        self.stdout.write("\n1. Environment Variables:")
        required_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_STORAGE_BUCKET_NAME']
        
        for var in required_vars:
            value = getattr(settings, var, None) or os.getenv(var)
            if value:
                masked_value = value[:4] + '*' * (len(value) - 8) + value[-4:] if len(value) > 8 else '*' * len(value)
                self.stdout.write(f"✓ {var}: {masked_value}")
            else:
                self.stdout.write(f"✗ {var}: Not set")
        
        # Check USE_S3 flag
        self.stdout.write(f"\n2. USE_S3 setting: {getattr(settings, 'USE_S3', 'Not set')}")
        
        # Check Django settings
        self.stdout.write(f"\n3. Django Storage Settings:")
        self.stdout.write(f"DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'Not set')}")
        self.stdout.write(f"AWS_S3_REGION_NAME: {getattr(settings, 'AWS_S3_REGION_NAME', 'Not set')}")
        self.stdout.write(f"AWS_S3_CUSTOM_DOMAIN: {getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', 'Not set')}")
        self.stdout.write(f"AWS_DEFAULT_ACL: {getattr(settings, 'AWS_DEFAULT_ACL', 'Not set')}")
        
        # Test AWS credentials
        self.stdout.write(f"\n4. Testing AWS Connection:")
        try:
            client = boto3.client(
                's3',
                aws_access_key_id=getattr(settings, 'AWS_ACCESS_KEY_ID', None),
                aws_secret_access_key=getattr(settings, 'AWS_SECRET_ACCESS_KEY', None),
                region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1')
            )
            
            # Test bucket access
            bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
            if bucket_name:
                response = client.head_bucket(Bucket=bucket_name)
                self.stdout.write(f"✓ Can access bucket '{bucket_name}'")
                
                # Test bucket location
                location = client.get_bucket_location(Bucket=bucket_name)
                self.stdout.write(f"✓ Bucket region: {location.get('LocationConstraint', 'us-east-1')}")
                
                # Test upload permissions WITHOUT ACL
                try:
                    client.put_object(
                        Bucket=bucket_name,
                        Key='test-upload.txt',
                        Body=b'test content'
                        # Removed ACL parameter
                    )
                    self.stdout.write("✓ Upload test successful (without ACL)")
                    
                    # Clean up test file
                    client.delete_object(Bucket=bucket_name, Key='test-upload.txt')
                    self.stdout.write("✓ Delete test successful")
                    
                except ClientError as e:
                    self.stdout.write(f"✗ Upload test failed: {e}")
            else:
                self.stdout.write("✗ No bucket name configured")
                
        except NoCredentialsError:
            self.stdout.write("✗ AWS credentials not found")
        except ClientError as e:
            self.stdout.write(f"✗ AWS Error: {e}")
        except Exception as e:
            self.stdout.write(f"✗ Unexpected error: {e}")
        
        # Test Django storage integration
        self.stdout.write(f"\n5. Testing Django Storage Integration:")
        try:
            # Test writing a file
            test_file = ContentFile(b'Hello S3!')
            file_path = default_storage.save('test/hello.txt', test_file)
            self.stdout.write(f"✓ File saved to: {file_path}")
            
            # Get file URL
            file_url = default_storage.url(file_path)
            self.stdout.write(f"✓ File URL: {file_url}")
            
            # Test if file exists
            exists = default_storage.exists(file_path)
            self.stdout.write(f"✓ File exists: {exists}")
            
            # Test reading the file back
            if exists:
                with default_storage.open(file_path, 'rb') as f:
                    content = f.read()
                    self.stdout.write(f"✓ File content: {content}")
            
            # Clean up
            default_storage.delete(file_path)
            self.stdout.write("✓ Test file deleted")
            
        except Exception as e:
            self.stdout.write(f"✗ Django Storage Error: {e}")
            import traceback
            traceback.print_exc()