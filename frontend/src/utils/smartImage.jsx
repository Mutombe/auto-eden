import React, { useState, useEffect } from 'react';

// Shown when an image is missing or fails: a neutral car glyph instead of a broken icon.
const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="#eceef1"/><g transform="translate(6 6) scale(.5)" fill="none" stroke="#9ca3af" stroke-width="1.4"><path d="M5 17h14M6 13l1.5-4.5A2 2 0 0 1 9.4 7h5.2a2 2 0 0 1 1.9 1.5L18 13M5 13h14v4H5z"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></g></svg>'
  );

/**
 * Vehicle image with a skeleton while loading and a fade-in once decoded.
 *
 * The API already returns full CDN URLs, so the URL is used exactly as given. (An earlier
 * version tried a "/media/" variant first; that path 404s on the CDN, so every image paid
 * for a failed request before loading.)
 *
 * @param {'eager' | 'lazy'} [props.loading='lazy']
 * @param {'high' | 'low' | 'auto'} [props.fetchpriority='auto']
 */
const ImageWithFallback = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchpriority = 'auto',
  onClick,
}) => {
  const [status, setStatus] = useState(src ? 'loading' : 'error');

  useEffect(() => {
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  return (
    <img
      src={status === 'error' ? FALLBACK : src}
      alt={alt}
      onClick={onClick}
      className={`${className} transition-opacity duration-500 ${status === 'loading' ? 'bone opacity-90' : 'opacity-100'}`}
      onLoad={() => status === 'loading' && setStatus('loaded')}
      onError={() => setStatus('error')}
      loading={loading}
      decoding="async"
      fetchpriority={fetchpriority}
    />
  );
};

export default ImageWithFallback;
