import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Shield, Check, Zap, DollarSign, Users, Car, BadgeCheck, Handshake, Eye, CarProfile, ShieldCheck, ArrowsOutCardinal, ListChecks, Gauge, Fuel, Settings2, MapPin } from "../ui/icons";
import { Link } from "react-router-dom";
import { useMarketplace, prefetchVehicle } from "../../lib/publicApi";
import { useProgressiveReveal, formatPrice } from "../../lib/progressive";
import Bone from "../ui/Bone";
import SmartImage from "../../utils/smartImage";

// Import the hero component
import HeroCarousel from "./hero";

/**
 * Featured vehicles — shared pieces
 */
// Listing data is often ALL CAPS ("NISSAN X-TRAIL"); show it in title case, keeping short
// acronyms (BMW, GTI, SUV) as they are.
const titleCase = (s = "") =>
  String(s)
    .split(" ")
    .map((w) =>
      w.length > 3 && w === w.toUpperCase()
        ? w.toLowerCase().replace(/(^|-)([a-z])/g, (_, p, c) => p + c.toUpperCase())
        : w
    )
    .join(" ");

// Mileage is free text in the DB ("85000", "85,000km").
const formatKm = (m) => {
  const n = Number(String(m ?? "").replace(/[^\d.]/g, ""));
  return n ? `${n.toLocaleString()} km` : null;
};

const CARD_WIDTH =
  "flex-none snap-start w-[84%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]";

/**
 * Vehicle Card Skeleton — same frame, inset photo, rows and footer as the real card.
 */
const VehicleCardSkeleton = () => (
  <div aria-hidden="true" className={CARD_WIDTH}>
    <div className="h-full bg-white rounded-[22px] ring-1 ring-gray-200/70 p-2">
      <Bone className="aspect-[4/3] w-full rounded-[16px]" />
      <div className="px-2 pt-3 pb-2">
        <Bone className="h-3 w-24" />
        <Bone className="h-5 w-3/5 mt-2" />
        <div className="flex gap-1.5 mt-3.5">
          <Bone className="h-6 w-20 rounded-full" />
          <Bone className="h-6 w-16 rounded-full" />
          <Bone className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-end justify-between mt-5 pt-4 border-t border-gray-100">
          <div>
            <Bone className="h-2.5 w-10" />
            <Bone className="h-6 w-24 mt-1.5" />
          </div>
          <Bone className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Vehicle Card — the whole card is one link; photo sits inset in the card like the hero
 * sits in the page. Quiet scrims only where text overlays the photo.
 */
const VehicleCard = ({ vehicle, priority }) => {
  const mainImage = vehicle.main_image || vehicle.images?.[0]?.image;
  const instant = vehicle.listing_type === "instant_sale";
  const price = instant ? vehicle.proposed_price || vehicle.price : vehicle.price || vehicle.proposed_price;
  const verified = vehicle.verification_state === "physical";
  const name = titleCase(`${vehicle.make} ${vehicle.model}`);
  const specs = [
    { icon: Gauge, label: formatKm(vehicle.mileage) },
    { icon: Fuel, label: vehicle.fuel_type && titleCase(vehicle.fuel_type).replace(/^./, (c) => c.toUpperCase()) },
    { icon: Settings2, label: vehicle.transmission && titleCase(vehicle.transmission).replace(/^./, (c) => c.toUpperCase()) },
  ].filter((s) => s.label);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={CARD_WIDTH}
    >
      <Link
        to={`/vehicles/${vehicle.id}`}
        onMouseEnter={() => prefetchVehicle(vehicle.id)}
        onTouchStart={() => prefetchVehicle(vehicle.id)}
        onFocus={() => prefetchVehicle(vehicle.id)}
        aria-label={`${vehicle.year} ${name}, ${formatPrice(price)}`}
        className="group/card pacaembu-font flex flex-col h-full bg-white rounded-[22px] p-2 ring-1 ring-gray-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_22px_44px_-18px_rgba(16,24,40,0.28)] hover:-translate-y-1 transition-[box-shadow,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        {/* Photo */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-gray-100 isolate">
          <SmartImage
            src={mainImage}
            alt={`${vehicle.year} ${name} for sale in Zimbabwe`}
            className="w-full h-full object-cover !transition-[transform,opacity] !duration-700 ease-out group-hover/card:scale-[1.04]"
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
          />
          {/* Soft scrim at the top only, so the chips stay legible on bright photos */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {verified && (
                <span className="inline-flex items-center gap-1 h-7 pl-1.5 pr-2.5 rounded-full bg-white/95 backdrop-blur text-[12px] font-semibold text-gray-900 shadow-sm">
                  <BadgeCheck weight="fill" className="w-4 h-4 text-emerald-500" />
                  Verified
                </span>
              )}
              {vehicle.body_type && (
                <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-black/35 backdrop-blur-md text-[12px] font-medium text-white capitalize">
                  {vehicle.body_type}
                </span>
              )}
            </div>
            <span className="grid place-items-center w-9 h-9 rounded-full bg-white/95 text-gray-900 shadow-sm translate-y-0 sm:opacity-0 sm:-translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
              <ArrowUpRight weight="bold" className="w-4 h-4" />
            </span>
          </div>

          {instant && (
            <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-red-600 text-white text-[12px] font-semibold shadow-sm">
              <Zap weight="fill" className="w-3.5 h-3.5" />
              Instant sale
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 px-2 pt-3 pb-2">
          <p className="text-[12.5px] text-gray-500 flex items-center gap-1.5 min-w-0">
            <span className="tabular-nums font-medium text-gray-700">{vehicle.year}</span>
            {vehicle.location && (
              <>
                <span className="text-gray-300">•</span>
                <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{titleCase(vehicle.location)}</span>
              </>
            )}
          </p>
          <h3 className="mt-0.5 text-[17px] sm:text-lg font-semibold text-gray-900 leading-snug truncate">{name}</h3>

          {specs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1 sm:gap-1.5">
              {specs.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1 sm:gap-1.5 h-6 sm:h-7 px-2 sm:px-2.5 rounded-full bg-gray-50 ring-1 ring-gray-100 text-[11.5px] sm:text-[12px] text-gray-600 whitespace-nowrap">
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                  {label}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-4">
            <div className="flex items-end justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{instant ? "Offer price" : "Price"}</p>
                <p className="text-[22px] leading-7 font-semibold text-gray-900 tabular-nums truncate">{formatPrice(price)}</p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 h-10 pl-4 pr-3 rounded-full bg-gray-900 text-white text-sm font-medium group-hover/card:bg-red-600 transition-colors duration-300">
                View
                <ArrowRight weight="bold" className="w-4 h-4 transition-transform duration-300 group-hover/card:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/**
 * Featured Vehicles Section — snap-scrolling rail: one card + a peek on phones, 2/3/4 across
 * on larger screens. Arrows step one card and disable at the ends; a slim track shows position.
 */
const FeaturedVehicles = () => {
  const railRef = React.useRef(null);
  const [rail, setRail] = useState({ start: true, end: false, thumb: 100, offset: 0 });
  const { data: marketplace, isLoading } = useMarketplace({ page: 1 });

  // Pick up to 8 vehicles with photos, once per data load (no reordering on re-render).
  const featuredVehicles = React.useMemo(() => {
    const vehicles = (marketplace?.results || []).filter((v) => v.main_image);
    return [...vehicles].sort(() => 0.5 - Math.random()).slice(0, 8);
  }, [marketplace]);
  const revealed = useProgressiveReveal(featuredVehicles.length, !isLoading, { step: 60 });

  const measure = React.useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setRail({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft >= max - 4,
      thumb: el.scrollWidth ? Math.min(100, (el.clientWidth / el.scrollWidth) * 100) : 100,
      offset: el.scrollWidth ? (el.scrollLeft / el.scrollWidth) * 100 : 0,
    });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, featuredVehicles.length, revealed]);

  const step = (dir) => {
    const el = railRef.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  const arrow = (dir, Icon, label, disabled) => (
    <button
      onClick={() => step(dir)}
      disabled={disabled}
      aria-label={label}
      className="grid place-items-center w-11 h-11 rounded-full bg-white ring-1 ring-gray-200 text-gray-800 hover:bg-gray-900 hover:text-white hover:ring-gray-900 disabled:opacity-35 disabled:pointer-events-none transition-colors"
    >
      <Icon weight="bold" className="w-4 h-4" />
    </button>
  );

  return (
    <section className="pacaembu-font py-14 lg:py-20 bg-white" aria-labelledby="featured-vehicles-heading">
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-red-600">
              <BadgeCheck className="w-4 h-4" />
              Hand-picked
            </span>
            <h2 id="featured-vehicles-heading" className="mt-2 text-2xl lg:text-3xl font-medium text-gray-900">
              Featured Vehicles
            </h2>
            <p className="text-gray-500 mt-1">Verified and ready for you</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/marketplace" className="sm:mr-3 inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              {arrow(-1, ChevronLeft, "Previous vehicles", rail.start)}
              {arrow(1, ChevronRight, "Next vehicles", rail.end)}
            </div>
          </div>
        </div>

        {/* Rail */}
        <div
          ref={railRef}
          onScroll={measure}
          className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-8 px-4 sm:px-6 lg:px-8 py-3 -my-3"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <VehicleCardSkeleton key={i} />)
          ) : featuredVehicles.length > 0 ? (
            featuredVehicles.map((vehicle, index) =>
              index < revealed ? (
                <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 2} />
              ) : (
                <VehicleCardSkeleton key={`sk-${vehicle.id}`} />
              )
            )
          ) : (
            <div className="w-full text-center py-12 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No vehicles available at the moment</p>
            </div>
          )}
        </div>

        {/* Position track */}
        <div className="px-4 sm:px-6 lg:px-8 mt-6">
          <div className="relative h-1 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
            <div
              className="absolute inset-y-0 rounded-full bg-gray-900 transition-[left,width] duration-150"
              style={{ width: `${rail.thumb}%`, left: `${rail.offset}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Brand Logos Marquee - Auto-scrolling brand logos
 */
const BrandLogosMarquee = () => {
  const brands = [
    { name: "Toyota", logo: "/logos/autoeden-toyota-logo.png" },
    { name: "Honda", logo: "/logos/autoeden-honda-logo.png" },
    { name: "Mercedes-Benz", logo: "/logos/autoeden-mercedes-logo.png" },
    { name: "Nissan", logo: "/logos/autoeden-nissan-logo.png" },
    { name: "Isuzu", logo: "/logos/autoeden-isuzu-logo.png" },
    { name: "Haval", logo: "/logos/autoeden-haval-logo.png" },
    { name: "BMW", logo: "/logos/autoeden-bmw-logo.png" },
    { name: "Mazda", logo: "/logos/autoeden-mazda-logo.png" },
    { name: "Volkswagen", logo: "/logos/autoeden-vw-logo.png" },
    { name: "Ford", logo: "/logos/autoeden-ford-logo.png" },
  ];

  // Double the brands array for seamless loop
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="pacaembu-font py-10 bg-gray-50 overflow-hidden" aria-label="Popular car brands in Zimbabwe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-medium">
          Popular Brands in Zimbabwe
        </p>
      </div>
      
      {/* Marquee Container */}
      <div className="relative">
        <motion.div
          className="flex gap-12 items-center"
          animate={{ x: [0, -1920] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <Link
              key={`${brand.name}-${index}`}
              to={`/marketplace?make=${brand.name}`}
              className="flex-shrink-0 flex items-center justify-center w-32 h-16 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo}
                alt={`${brand.name} vehicles for sale in Zimbabwe`}
                className="max-h-10 max-w-full object-contain"
                loading="lazy"
                onError={(e) => {
                  // Fallback to text if logo doesn't load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="text-gray-600 font-medium text-lg hidden">{brand.name}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/**
 * Value Proposition / Narrative Section
 * SEO-optimized content explaining Auto Eden's unique selling points
 */
const NarrativeSection = () => {
  const steps = [
    {
      icon: <CarProfile className="w-8 h-8" />,
      title: "List for Free",
      description: "Sellers upload vehicles at zero cost. No listing fees, no hidden charges.",
      forWho: "For Sellers"
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Free Verification",
      description: "We verify every vehicle digitally and physically at no cost to you.",
      forWho: "Our Promise"
    },
    {
      icon: <ArrowsOutCardinal className="w-8 h-8" />,
      title: "Browse Freely",
      description: "Buyers explore our entire marketplace without any viewing fees.",
      forWho: "For Buyers"
    },
    {
      icon: <Handshake className="w-8 h-8" />,
      title: "Secure Transaction",
      description: "We handle the payment. Seller gets paid, buyer gets their car safely.",
      forWho: "The Deal"
    }
  ];

  return (
    <section className="pacaembu-font py-16 lg:py-24 bg-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SEO-rich header */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Why We're Different
          </span>
          
          <h2 id="how-it-works-heading" className="text-3xl lg:text-4xl font-medium text-gray-900 mb-6">
            Zimbabwe's First Truly Free Car Marketplace
          </h2>
          
          {/* SEO narrative paragraph */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Unlike other platforms that charge sellers to list vehicles, 
            <strong className="text-gray-900"> Auto Eden is 100% free for sellers</strong>. 
            We verify every car at no cost, and buyers can browse without restrictions. 
            When you find your perfect car, we handle the secure transaction — 
            sellers get paid, buyers drive away happy.
          </p>
        </header>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              {/* Step Number */}
              <div className="absolute top-5 right-5 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              
              {/* For Who Badge */}
              <span className="text-xs font-medium text-red-600 uppercase tracking-wider">
                {step.forWho}
              </span>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-700 my-4 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/sell"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors inline-flex items-center"
            >
              Sell Your Car Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Top Sellers Section - Shows popular makes/models in Zimbabwe
 */
const TopSellersSection = () => {
  const topSellers = [
    { make: "Toyota", model: "Hilux", image: "/top-sellers/autoeden-hilux.avif", count: 45 },
    { make: "Honda", model: "Fit", image: "/top-sellers/autoeden-honda-fit.avif", count: 38 },
    { make: "Nissan", model: "X-Trail", image: "/top-sellers/autoeden-xtrail.webp", count: 32 },
    { make: "Toyota", model: "Aqua", image: "/top-sellers/2023-toyota-aqua-gr-sport.jpg", count: 28 },
    { make: "Mercedes", model: "C-Class", image: "/top-sellers/autoeden-c-class.jpg", count: 24 },
    { make: "Toyota", model: "Fortuner", image: "/top-sellers/Autoeden-Toyota-Fortuner.avif", count: 21 },
  ];

  return (
    <section className="pacaembu-font py-16 lg:py-20 bg-gray-50" aria-labelledby="top-sellers-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 id="top-sellers-heading" className="text-2xl lg:text-3xl font-medium text-gray-900">
              Top Sellers in Zimbabwe
            </h2>
            <p className="text-gray-500 mt-1">Most popular vehicles on our platform</p>
          </div>
          <Link
            to="/marketplace"
            className="hidden sm:inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topSellers.map((car, index) => (
            <Link
              key={index}
              to={`/marketplace?make=${car.make}&model=${car.model}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-200"
            >
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 z-10 w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Image */}
              <img
                src={car.image}
                alt={`${car.make} ${car.model} for sale in Zimbabwe`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/placeholder-car.jpg";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold">{car.make}</p>
                <p className="text-white/80 text-sm">{car.model}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden text-center mt-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            View all vehicles
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/**
 * Simple CTA Section
 */
const SimpleCTA = () => (
  <section className="pacaembu-font py-16 lg:py-20 bg-gray-900 text-white">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl lg:text-4xl font-medium mb-4">
        Ready to Find Your Next Car?
      </h2>
      <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
        Join thousands of Zimbabweans who trust Auto Eden for buying and selling vehicles. 
        Zero fees, verified cars, secure transactions.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/marketplace"
          className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center"
        >
          Browse Cars
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
        <Link
          to="/sell"
          className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-white/20"
        >
          Sell Your Car
        </Link>
      </div>
      
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-400">
        <div className="flex items-center">
          <ListChecks className="w-5 h-5 mr-2 text-green-400" />
          100% Free Listing
        </div>
        <div className="flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-blue-400" />
          Verified Vehicles
        </div>
        <div className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-400" />
          1000+ Happy Customers
        </div>
      </div>
    </div>
  </section>
);

/**
 * Main Homepage Component
 */
export default function HomePage() {
  return (
    <main className="pacaembu-font min-h-screen bg-white">
      {/* SEO Meta Content - Hidden but crawlable */}
      <h1 className="sr-only">
        Auto Eden - Zimbabwe's Free Car Marketplace | Buy & Sell Vehicles Online
      </h1>
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Featured Vehicles - Tesla-style horizontal scroll */}
      <FeaturedVehicles />

      {/* Brand Logos Marquee */}
      <BrandLogosMarquee />

      {/* Value Proposition / How It Works */}
      <NarrativeSection />

      {/* Top Sellers in Zimbabwe */}
      <TopSellersSection />

      {/* Simple CTA */}
      <SimpleCTA />

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          "name": "Auto Eden",
          "description": "Zimbabwe's first truly free car marketplace. List vehicles for free, browse for free, verified cars, secure transactions.",
          "url": "https://autoeden.co.zw",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Harare",
            "addressCountry": "ZW"
          },
          "priceRange": "Free to list",
          "openingHours": "Mo-Su 00:00-24:00",
          "sameAs": [
            "https://facebook.com/autoedenzw",
            "https://instagram.com/autoedenzw",
            "https://twitter.com/autoedenzw"
          ]
        })}
      </script>
    </main>
  );
}