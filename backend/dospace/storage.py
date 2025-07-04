# Remove the location = 'media' from MediaStorage
class MediaStorage(S3Storage):
    # location = 'media' # Remove or comment this line out
    file_overwrite = False
    default_acl = 'private' # You might want this public-read for vehicle_images
    custom_domain = 'autoeden.sgp1.cdn.digitaloceanspaces.com'

    def _save(self, name, content):
        # The 'name' here should already include 'vehicle_images/'
        # because your upload logic (e.g., upload_to in a model)
        # is likely specifying it.
        public_directories = ['vehicle_images/', 'vehicle_images\\']
        if any(directory in name for directory in public_directories):
            self.default_acl = 'public-read'
        else:
            self.default_acl = 'public-read' # Consider if you need private files

        return super()._save(name, content)

    def get_default_settings(self):
        settings = super().get_default_settings()
        settings.update({
            'querystring_auth': True,
            'url_protocol': 'https:',
        })
        return settings
