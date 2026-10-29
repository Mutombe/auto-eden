import React from "react";

/**
 * The Auto Eden logo, drawn live instead of a bitmap: the cloud-circuit mark plus the
 * "Autoeden" wordmark in Open Sans ExtraBold with the signature slanted red "e".
 * Crisp at any size and on any screen density; `light` flips it for dark backgrounds.
 */
export default function Wordmark({ light = false, className = "", markClassName = "h-7 sm:h-8", textClassName = "text-[23px] sm:text-[27px]" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <img
        src="/Auto-eden-favicon.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className={`${markClassName} w-auto transition-[filter] duration-150 ${light ? "invert" : ""}`}
      />
      <span className={`ae-wordmark transition-colors duration-150 ${light ? "text-white" : "text-gray-950"} ${textClassName}`}>
        Auto<span className="ae-e">e</span>den
      </span>
    </span>
  );
}
