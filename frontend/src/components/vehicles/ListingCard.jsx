import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Fuel, Gauge, MapPin, Settings2, Zap } from "../ui/icons";
import { prefetchVehicle } from "../../lib/publicApi";
import { formatPrice } from "../../lib/progressive";
import Bone from "../ui/Bone";
import SmartImage from "../../utils/smartImage";
import { SaveButton } from "./SaveButton";

// Listing data is often ALL CAPS ("NISSAN X-TRAIL"); show it in title case, keeping short
// acronyms (BMW, GTI, SUV) as they are.
export const titleCase = (s = "") =>
  String(s)
    .split(" ")
    .map((w) =>
      w.length > 3 && w === w.toUpperCase()
        ? w.toLowerCase().replace(/(^|-)([a-z])/g, (_, p, c) => p + c.toUpperCase())
        : w
    )
    .join(" ");

const capitalise = (s) => s && titleCase(s).replace(/^./, (c) => c.toUpperCase());

// Mileage is free text in the DB ("85000", "85,000km").
export const formatKm = (m) => {
  const n = Number(String(m ?? "").replace(/[^\d.]/g, ""));
  return n ? `${n.toLocaleString()} km` : null;
};

/*
 * The card sizes itself to its own width with container queries, so one component serves the
 * homepage rail (~300px), a two-up phone grid (~170px) and wide desktop grids. Below @3xs
 * (16rem) it drops to the compact layout: icon-only badges, two-line title, no spec chips.
 */

export const ListingCardSkeleton = ({ className = "" }) => (
  <div aria-hidden="true" className={`@container ${className}`}>
    <div className="h-full bg-white rounded-[14px] @3xs:rounded-[18px] ring-1 ring-gray-200/70 p-1.5 @3xs:p-2">
      <Bone className="aspect-[4/3] w-full rounded-[10px] @3xs:rounded-[12px]" />
      <div className="px-1 @3xs:px-2 pt-2.5 @3xs:pt-3 pb-1 @3xs:pb-2">
        <Bone className="h-3 w-16 @3xs:w-24" />
        <Bone className="h-4 @3xs:h-5 w-4/5 @3xs:w-3/5 mt-2" />
        <div className="hidden @3xs:flex gap-1.5 mt-3.5">
          <Bone className="h-7 w-20 rounded-full" />
          <Bone className="h-7 w-16 rounded-full" />
          <Bone className="h-7 w-20 rounded-full" />
        </div>
        <div className="flex items-end justify-between mt-3 @3xs:mt-5 pt-2.5 @3xs:pt-4 border-t border-gray-100">
          <div>
            <Bone className="hidden @3xs:block h-2.5 w-10 mb-1.5" />
            <Bone className="h-5 @3xs:h-6 w-20 @3xs:w-24" />
          </div>
          <Bone className="h-8 w-8 @3xs:h-10 @3xs:w-10 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default function ListingCard({ vehicle, priority = false, className = "" }) {
  const mainImage = vehicle.main_image || vehicle.images?.[0]?.image;
  const instant = vehicle.listing_type === "instant_sale";
  const price = instant ? vehicle.proposed_price || vehicle.price : vehicle.price || vehicle.proposed_price;
  const verified = vehicle.verification_state === "physical";
  const name = titleCase(`${vehicle.make} ${vehicle.model}`);
  const km = formatKm(vehicle.mileage);
  const specs = [
    { icon: Gauge, label: km },
    { icon: Fuel, label: capitalise(vehicle.fuel_type) },
    { icon: Settings2, label: capitalise(vehicle.transmission) },
  ].filter((s) => s.label);
  const prefetch = () => prefetchVehicle(vehicle.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={`@container group/save relative ${className}`}>
      <Link
        to={`/vehicles/${vehicle.id}`}
        onMouseEnter={prefetch}
        onTouchStart={prefetch}
        onFocus={prefetch}
        aria-label={`${vehicle.year} ${name}, ${formatPrice(price)}`}
        className="group/card pacaembu-font flex flex-col h-full bg-white rounded-[14px] @3xs:rounded-[18px] p-1.5 @3xs:p-2 ring-1 ring-gray-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04)] group-hover/save:shadow-[0_22px_44px_-18px_rgba(16,24,40,0.28)] group-hover/save:-translate-y-1 transition-[box-shadow,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        {/* Photo, inset in the card like the hero sits in the page */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] @3xs:rounded-[12px] bg-gray-100 isolate">
          <SmartImage
            src={mainImage}
            alt={`${vehicle.year} ${name} for sale in Zimbabwe`}
            className="w-full h-full object-cover !transition-[transform,opacity] !duration-700 ease-out group-hover/card:scale-[1.04]"
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
          />
          {/* Soft scrim at the top only, so the chips stay legible on bright photos */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-14 @3xs:h-20 bg-gradient-to-b from-black/30 to-transparent" />

          <div className="absolute top-1.5 left-1.5 right-1.5 @3xs:top-2.5 @3xs:left-2.5 @3xs:right-2.5 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {verified && (
                <span
                  title="Verified by Auto Eden"
                  className="inline-flex items-center gap-1 h-6 @3xs:h-7 px-1 @3xs:pl-1.5 @3xs:pr-2.5 rounded-full bg-white/95 backdrop-blur text-[12px] font-semibold text-gray-900 shadow-sm"
                >
                  <BadgeCheck weight="fill" className="w-4 h-4 text-emerald-500" />
                  <span className="hidden @3xs:inline">Verified</span>
                </span>
              )}
              {vehicle.body_type && (
                <span className="hidden @3xs:inline-flex items-center h-7 px-2.5 rounded-full bg-black/35 backdrop-blur-md text-[12px] font-medium text-white capitalize">
                  {vehicle.body_type}
                </span>
              )}
            </div>
            {/* Room for the save heart, which sits over the card as a sibling of the link */}
            <span aria-hidden="true" className="w-8 h-8 @3xs:w-9 @3xs:h-9 shrink-0" />
          </div>

          {instant && (
            <span className="absolute bottom-1.5 left-1.5 @3xs:bottom-2.5 @3xs:left-2.5 inline-flex items-center gap-1 h-6 @3xs:h-7 px-2 @3xs:px-2.5 rounded-full bg-red-600 text-white text-[11px] @3xs:text-[12px] font-semibold shadow-sm">
              <Zap weight="fill" className="w-3.5 h-3.5" />
              Instant sale
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 px-1 @3xs:px-2 pt-2 @3xs:pt-3 pb-1 @3xs:pb-2">
          <p className="text-[11.5px] @3xs:text-[12.5px] text-gray-500 flex items-center gap-1.5 min-w-0">
            <span className="tabular-nums font-medium text-gray-700">{vehicle.year}</span>
            {/* Compact cards show mileage here, since the spec chips are hidden */}
            {km && (
              <span className="@3xs:hidden contents">
                <span className="text-gray-300">•</span>
                <span className="truncate tabular-nums">{km}</span>
              </span>
            )}
            {vehicle.location && (
              <span className="hidden @3xs:contents">
                <span className="text-gray-300">•</span>
                <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{titleCase(vehicle.location)}</span>
              </span>
            )}
          </p>
          <h3 className="mt-0.5 text-[14px] @3xs:text-[17px] @xs:text-lg font-semibold text-gray-900 leading-snug line-clamp-2 @3xs:line-clamp-1">
            {name}
          </h3>

          {specs.length > 0 && (
            <ul className="hidden @3xs:flex mt-3 flex-wrap gap-1.5">
              {specs.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-gray-50 ring-1 ring-gray-100 text-[12px] text-gray-600 whitespace-nowrap">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  {label}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-2.5 @3xs:pt-4">
            <div className="flex items-end justify-between gap-2 @3xs:gap-3 pt-2.5 @3xs:pt-4 border-t border-gray-100">
              <div className="min-w-0">
                <p className="hidden @3xs:block text-[11px] font-medium uppercase tracking-wider text-gray-400">{instant ? "Offer price" : "Price"}</p>
                <p className="text-[16px] @3xs:text-[22px] leading-6 @3xs:leading-7 font-semibold text-gray-900 tabular-nums truncate">{formatPrice(price)}</p>
              </div>
              <span className="shrink-0 inline-flex items-center justify-center gap-1.5 w-8 h-8 @3xs:w-auto @3xs:h-10 @3xs:pl-4 @3xs:pr-3 rounded-full bg-gray-900 text-white text-sm font-medium group-hover/card:bg-red-600 transition-colors duration-300">
                <span className="hidden @3xs:inline">View</span>
                <ArrowRight weight="bold" className="w-4 h-4 transition-transform duration-300 group-hover/card:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
      <SaveButton
        vehicle={vehicle}
        className="absolute top-3 right-3 @3xs:top-[18px] @3xs:right-[18px] w-8 h-8 @3xs:w-9 @3xs:h-9 transition-transform duration-300 ease-out group-hover/save:-translate-y-1"
      />
    </motion.div>
  );
}
