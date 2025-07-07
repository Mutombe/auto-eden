// src/utils/storageUrls.js
export const formatMediaUrl = (url) => {
  if (!url) return '/placeholder-car.jpg';
  if (typeof url !== 'string') return '/placeholder-car.jpg';
  
  const baseUrl = 'https://autoeden.sgp1.cdn.digitaloceanspaces.com/';
  
  // Check if URL is already properly formatted
  if (url.includes('digitaloceanspaces.com/media/')) {
    return url;
  }
  
  // Handle URLs that already have the base URL but no media prefix
  if (url.includes('digitaloceanspaces.com/')) {
    // Check if it's a vehicle_images URL that needs the media prefix
    if (url.includes('/vehicle_images/')) {
      return url.replace(
        'digitaloceanspaces.com/vehicle_images/',
        'digitaloceanspaces.com/media/vehicle_images/'
      );
    }
    return url; // Return other DO URLs as-is
  }
  
  // Handle relative paths
  if (url.startsWith('vehicle_images/') || url.startsWith('media/vehicle_images/')) {
    return `${baseUrl}${url}`;
  }
  
  // Default case - add media prefix
  return `${baseUrl}media/vehicle_images/${url.replace(/^\//, '')}`;
};