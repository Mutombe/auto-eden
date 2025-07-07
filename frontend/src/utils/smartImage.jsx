import React, { useState, useEffect } from 'react';

/**
 * A resilient image component that tries multiple URL formats before falling back to a placeholder.
 *
 * @param {object} props - The component props.
 * @param {string} props.src - The initial image URL from the API.
 * @param {string} props.alt - The alt text for the image.
 * @param {string} props.className - CSS classes for styling the image.
 * @param {string} [props.placeholder='/placeholder-car.jpg'] - The path to the placeholder image.
 * @param {'eager' | 'lazy'} [props.loading='auto'] - The loading strategy for the image.
 * @param {'high' | 'low' | 'auto'} [props.fetchpriority='auto'] - The fetch priority for the image.
 */
const ImageWithFallback = ({
  src: initialSrc,
  alt,
  className,
  placeholder = '/placeholder-car.jpg',
  loading = 'auto',
  fetchpriority = 'auto'
}) => {
  const baseUrl = 'https://autoeden.sgp1.cdn.digitaloceanspaces.com/';
  const mediaPrefix = 'media/';

  /**
   * Generates the URL with the '/media/' prefix logic.
   * This is the first URL we will attempt to load.
   */
  const getFormattedUrl = (url) => {
    if (!url || typeof url !== 'string') return placeholder;
    // If it already has the prefix, return it as is.
    if (url.includes(`/${mediaPrefix}`)) return url;
    // If it has the base URL, insert the prefix.
    if (url.startsWith(baseUrl)) {
      return url.replace(baseUrl, `${baseUrl}${mediaPrefix}`);
    }
    // Fallback for relative paths, though unlikely in this case.
    return `${baseUrl}${mediaPrefix}${url.startsWith('/') ? url.slice(1) : url}`;
  };

  // Define the two URLs we will try.
  const formattedUrl = getFormattedUrl(initialSrc);
  const originalUrl = initialSrc || placeholder;

  // State to hold the current image source URL. We start with the formatted one.
  const [imgSrc, setImgSrc] = useState(formattedUrl);

  // Effect to reset the component's state if the initial `src` prop changes.
  useEffect(() => {
    setImgSrc(getFormattedUrl(initialSrc));
  }, [initialSrc]);

  /**
   * Handles image loading errors.
   * If the formatted URL fails, it tries the original URL.
   * If the original URL also fails, it shows the final placeholder.
   */
  const handleError = () => {
    // First error: The formatted URL failed. Let's try the original URL.
    if (imgSrc === formattedUrl) {
      setImgSrc(originalUrl);
    }
    // Second error: The original URL also failed. Fallback to the placeholder.
    else {
      setImgSrc(placeholder);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading={loading}
      fetchpriority={fetchpriority}
    />
  );
};

export default ImageWithFallback;