import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

const LazyImage = ({ src, alt, className, style, priority = false }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef();
  const isInView = useInView(imgRef, { once: true, margin: "50px" });

  useEffect(() => {
    if (priority || isInView) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setImageLoaded(true);
      };
    }
  }, [src, isInView, priority]);

  return (
    <div ref={imgRef} className={className} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #e3180d20, #ff7805020)',
          filter: imageLoaded ? 'blur(0px)' : 'blur(10px)',
          transition: 'filter 0.3s ease',
        }}
      />
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );
};

export default LazyImage;