import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart } from "../ui/icons";
import { toggleSaved, useSaved } from "../../lib/saved";

/** Heart toggle for one car. `variant`: "card" (floating on a photo) or "pill" (labelled button). */
export function SaveButton({ vehicle, variant = "card", className = "" }) {
  const saved = useSaved().some((v) => String(v.id) === String(vehicle.id));
  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(vehicle);
  };
  const label = saved ? "Remove from saved" : "Save for later";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg ring-1 text-sm transition-colors ${
          saved ? "bg-red-600 ring-red-600 text-white hover:bg-red-700" : "bg-white/10 ring-white/10 text-white/90 hover:bg-white/15"
        } ${className}`}
      >
        <Heart size={16} weight={saved ? "fill" : "regular"} /> {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.85 }}
      className={`grid place-items-center rounded-full bg-white/95 backdrop-blur shadow-sm transition-colors hover:bg-white ${className}`}
    >
      <motion.span key={saved ? "on" : "off"} initial={{ scale: saved ? 0.5 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
        <Heart weight={saved ? "fill" : "bold"} className={`w-4 h-4 ${saved ? "text-red-600" : "text-gray-800"}`} />
      </motion.span>
    </motion.button>
  );
}

/** Navbar heart linking to /saved, with a count badge. */
export function SavedNavButton({ light = false, className = "" }) {
  const count = useSaved().length;
  return (
    <Link
      to="/saved"
      aria-label={count ? `Saved cars (${count})` : "Saved cars"}
      title="Saved cars"
      className={`relative grid place-items-center w-9 h-9 rounded-lg transition-colors ${
        light ? "text-white bg-white/10 ring-1 ring-inset ring-white/25 hover:bg-white/20" : "text-gray-900 bg-gray-100 hover:bg-gray-200"
      } ${className}`}
    >
      <Heart weight={count ? "fill" : "regular"} className={`w-[18px] h-[18px] ${count ? "text-red-500" : ""}`} />
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-red-600 text-white text-[11px] font-semibold tabular-nums ring-2 ring-white"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </Link>
  );
}
