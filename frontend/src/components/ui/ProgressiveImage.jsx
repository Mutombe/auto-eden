// Image that never shows blank space or a broken icon: a pulsing bone reserves the box,
// the photo fades in from a soft blur once decoded, and a car glyph replaces failures.
import React, { useLayoutEffect, useRef, useState } from "react";

const CarGlyph = () => (
  <svg viewBox="0 0 24 24" className="w-1/3 max-w-12 h-auto" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M5 17h14M6 13l1.5-4.5A2 2 0 0 1 9.4 7h5.2a2 2 0 0 1 1.9 1.5L18 13M5 13h14v4H5z" />
    <circle cx="8" cy="17" r="1.5" />
    <circle cx="16" cy="17" r="1.5" />
  </svg>
);

/**
 * `className` sizes the box (aspect ratio / height); `imgClassName` styles the <img>.
 * `priority` loads eagerly with high fetch priority (above-the-fold hero/gallery images).
 */
export default function ProgressiveImage({ src, alt = "", className = "", imgClassName = "object-cover", priority = false, onClick, draggable }) {
  const [state, setState] = useState(src ? "loading" : "error");
  const img = useRef(null);

  // Reset when the source changes, but don't clobber an image that already finished: a cached
  // photo (e.g. the gallery's main image reused as a thumbnail) can fire onLoad before effects
  // run, which used to leave it stuck invisible behind the loading bone.
  useLayoutEffect(() => {
    if (!src) return setState("error");
    const el = img.current;
    setState(!el?.complete ? "loading" : el.naturalWidth ? "loaded" : "error");
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-[#eceef1] ${className}`} onClick={onClick}>
      {state === "loading" && <div aria-hidden="true" className="bone absolute inset-0" />}
      {state === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <CarGlyph />
        </div>
      ) : (
        <img
          ref={img}
          src={src}
          alt={alt}
          draggable={draggable}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={priority ? "high" : "auto"}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={`absolute inset-0 w-full h-full transition-[opacity,filter,transform] duration-500 ease-out ${imgClassName} ${
            state === "loaded" ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-[1.02]"
          }`}
        />
      )}
    </div>
  );
}
