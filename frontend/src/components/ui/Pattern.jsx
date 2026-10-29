import React, { useId } from "react";

/**
 * Auto Eden's own background patterns, drawn from the brand: circuit traces from the logo mark,
 * tyre tread, a square grid and a fine dot grid. They inherit `currentColor`, so tint them with a
 * text colour class (e.g. "text-white/10"), and fade out with `fade` so they never fight content.
 *
 *   <Pattern variant="circuit" fade="right" className="text-white/[0.08]" />
 *
 * Place inside a `relative` (and usually `overflow-hidden`) parent.
 */
const TILES = {
  // Right-angled traces ending in hollow nodes, like the cloud-circuit mark.
  circuit: {
    size: [120, 120],
    draw: (
      <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 0v22h22v26" />
        <circle cx="32" cy="52" r="3.5" />
        <path d="M60 0v14" />
        <circle cx="60" cy="18" r="3.5" />
        <path d="M120 40H92v30h-20" />
        <circle cx="68" cy="70" r="3.5" />
        <path d="M0 40h14" />
        <path d="M0 90h40v30" />
        <path d="M88 120V98h18V78" />
        <circle cx="106" cy="74" r="3.5" />
        <path d="M50 120v-14" />
        <circle cx="50" cy="102" r="3.5" />
        <circle cx="10" cy="90" r="1.5" fill="currentColor" />
        <circle cx="92" cy="40" r="1.5" fill="currentColor" />
      </g>
    ),
  },
  // Staggered directional tread blocks.
  tread: {
    size: [48, 40],
    draw: (
      <g fill="currentColor">
        <path d="M2 2h12l8 8-8 8H2l8-8z" />
        <path d="M26 22h12l8 8-8 8H26l8-8z" />
      </g>
    ),
  },
  // Plain square grid, like graph paper.
  grid: {
    size: [32, 32],
    draw: <path d="M32 .5H.5V32" fill="none" stroke="currentColor" strokeWidth="1" />,
  },
  dots: {
    size: [18, 18],
    draw: <circle cx="2" cy="2" r="1.1" fill="currentColor" />,
  },
};

const FADES = {
  none: undefined,
  radial: "radial-gradient(ellipse 70% 80% at 50% 40%, #000 30%, transparent 100%)",
  right: "linear-gradient(to left, #000 15%, transparent 85%)",
  left: "linear-gradient(to right, #000 15%, transparent 85%)",
  bottom: "linear-gradient(to top, #000 10%, transparent 90%)",
  top: "linear-gradient(to bottom, #000 10%, transparent 90%)",
  corner: "radial-gradient(circle at 100% 0%, #000 0%, transparent 65%)",
};

export default function Pattern({ variant = "circuit", fade = "radial", scale = 1, className = "" }) {
  const id = useId().replace(/:/g, "");
  const tile = TILES[variant] || TILES.circuit;
  const [w, h] = tile.size;
  const mask = FADES[fade];
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      <defs>
        <pattern id={`ae-${variant}-${id}`} width={w * scale} height={h * scale} patternUnits="userSpaceOnUse">
          <g transform={`scale(${scale})`}>{tile.draw}</g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#ae-${variant}-${id})`} />
    </svg>
  );
}

/** The one overlay every dark page hero uses (first introduced on the dashboard header). */
export const HeroPattern = () => <Pattern variant="circuit" fade="right" className="-z-10 text-white/[0.08]" />;
