// The single skeleton primitive: a soft grey block with one slow pulse. Every loading
// state on the site is composed from these, shaped like the content it stands in for.
import React from "react";

export default function Bone({ className = "", style, as: Tag = "div" }) {
  const rounded = /\brounded/.test(className) ? "" : "rounded-md";
  return <Tag aria-hidden="true" className={`bone ${rounded} ${className}`} style={style} />;
}

// Wrap a whole skeleton screen so screen readers hear one "Loading" instead of many blocks.
export function SkeletonRegion({ label = "Loading", className = "", children }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={`animate-[fadeIn_.25s_ease-out] ${className}`}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
