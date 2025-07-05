// src/utils/storageUrls.js
export const formatMediaUrl = (url) => {
  if (!url) return '/placeholder-car.jpg';
  
  const baseUrl = 'https://autoeden.sgp1.cdn.digitaloceanspaces.com/';
  const mediaPrefix = 'media/';
  
  // Return placeholder if URL is falsy
  if (!url || typeof url !== 'string') return '/placeholder-car.jpg';
  
  // If URL already has /media/, return as-is
  if (url.includes('/media/')) return url;
  
  // If URL is missing /media/ but has the base URL, insert it
  if (url.startsWith(baseUrl)) {
    return url.replace(baseUrl, `${baseUrl}${mediaPrefix}`);
  }
  
  // For relative paths or other cases
  return url.startsWith('/') 
    ? `${baseUrl}${mediaPrefix}${url.slice(1)}`
    : `${baseUrl}${mediaPrefix}${url}`;
};