import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useMarketplace, useVehicle } from "../../lib/publicApi";
import { vehicleShareUrl } from "../../utils/api";
import { formatNumber, formatPrice } from "../../lib/progressive";
import ProgressiveImage from "../ui/ProgressiveImage";
import Bone from "../ui/Bone";
import { VehicleDetailSkeleton } from "../skeletons/PageSkeletons";
import { placeBid } from "../../redux/slices/bidSlice";
import { AuthModals } from "../navbar/navbar";
import {
  AlertCircle, ArrowLeft, ArrowRight, BadgeCheck, Calendar, Camera, Car, Check, ChevronLeft, ChevronRight, Copy,
  DollarSign, Facebook, FileText, Fuel, Gauge, Loader2, Mail, MapPin, Phone, Settings2, Share2, ShieldCheck,
  WhatsappLogo, X, XLogo,
} from "../ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import ImagePreview, { useImagePreview } from "../imagePreviewing";
import useTracking from "../../hooks/useTracking";
import ListingCard, { ListingCardSkeleton, titleCase, formatKm } from "../vehicles/ListingCard";
import { HeroPattern } from "../ui/Pattern";
import QuoteRequestModal from "./quoteRequestModal";
import { SaveButton } from "../vehicles/SaveButton";

// Auto Eden handles every enquiry; these match the contact page.
const CONTACT = { phone: "+263 78 222 2032", email: "admin@autoeden.co.zw" };

// SEO Meta Tags Component
function VehicleMetaTags({ vehicle }) {
  if (!vehicle) return null;

  const baseUrl = "https://autoeden.co.zw";
  const url = `${baseUrl}/vehicles/${vehicle.id}`;
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale | Auto Eden Zimbabwe`;
  const description = `Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.location || 'Zimbabwe'}. ${formatNumber(vehicle.mileage)}km, ${vehicle.fuel_type || 'Petrol'}, ${vehicle.transmission || 'Manual'}. ${vehicle.is_physically_verified ? 'Verified Condition.' : ''} Price: ${formatPrice(vehicle.price)}.`;
  const vehicleImage = vehicle.main_image || (vehicle.images?.[0]?.image) || `${baseUrl}/logo2.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={vehicleImage} />
      <meta property="og:image:secure_url" content={vehicleImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={vehicleImage} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Car",
          "name": `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          "image": vehicleImage,
          "description": description,
          "brand": { "@type": "Brand", "name": vehicle.make },
          "model": vehicle.model,
          "vehicleModelDate": vehicle.year,
          "mileageFromOdometer": { "@type": "QuantitativeValue", "value": vehicle.mileage, "unitCode": "KMT" },
          "fuelType": vehicle.fuel_type,
          "vehicleConfiguration": vehicle.body_type,
          "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "USD",
            "price": vehicle.price,
            "itemCondition": "https://schema.org/UsedCondition",
            "availability": vehicle.is_sold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "Auto Eden" }
          }
        })}
      </script>
    </Helmet>
  );
}

const capitalise = (s) => s && titleCase(String(s)).replace(/^./, (c) => c.toUpperCase());
const fmtDate = (d) => d && new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const card = "bg-white rounded-xl ring-1 ring-gray-200/80";

function verification(vehicle) {
  if (vehicle.verification_state === "physical" || vehicle.is_physically_verified)
    return { label: "Inspected by Auto Eden", tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" };
  if (vehicle.verification_state === "digital" || vehicle.is_digitally_verified)
    return { label: "Details checked", tone: "bg-sky-500/15 text-sky-300 ring-sky-400/30" };
  return null;
}

function OfferForm({ amount, setAmount, message, setMessage, placing, onSubmit, price }) {
  const quick = price ? [0.9, 0.95].map((f) => Math.round((price * f) / 50) * 50) : [];
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <label className="block">
        <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Your offer (USD)</span>
        <div className="relative">
          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="number"
            inputMode="numeric"
            min="1"
            placeholder={price ? String(Math.round(price)) : "Amount"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[16px] font-medium tabular-nums"
          />
        </div>
      </label>
      {quick.length > 0 && (
        <div className="flex gap-2">
          {quick.map((q) => (
            <button key={q} type="button" onClick={() => setAmount(String(q))} className="flex-1 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-[13px] font-medium text-gray-700 tabular-nums">
              {formatPrice(q)}
            </button>
          ))}
        </div>
      )}
      <label className="block">
        <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Message <span className="text-gray-400 font-normal">(optional)</span></span>
        <textarea
          placeholder="When could you view it? Paying cash?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full px-3.5 py-3 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none resize-none text-[15px]"
        />
      </label>
      <button
        type="submit"
        disabled={placing || !amount}
        className="w-full h-12 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {placing ? <><Loader2 className="animate-spin" size={18} /> Sending…</> : "Send offer"}
      </button>
    </form>
  );
}

export default function CarDetailsPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useTracking(window.location.pathname, vehicleId);
  const { preview, openPreview, closePreview } = useImagePreview();

  // First paint comes from the marketplace card already in cache (title, price, photo);
  // the full record (all photos, description, bids) fills in behind it.
  const { data: vehicle, isError, error, refetch, isFetching } = useVehicle(vehicleId);

  // Show /vehicles/<id>/ in the address bar, so a link copied from it gets the car's preview
  // (the static host only serves the prerendered page for the trailing-slash form).
  const location = useLocation();
  useEffect(() => {
    if (!location.pathname.endsWith("/")) {
      navigate(`${location.pathname}/${location.search}${location.hash}`, { replace: true, state: location.state });
    }
  }, [location.pathname, location.search, location.hash, location.state, navigate]);
  const isPartial = !!vehicle?.__partial;
  // Shares the marketplace's cached page 1, so "Similar vehicles" costs no extra request.
  const { data: market } = useMarketplace({ page: 1 });
  const marketplaceVehicles = market?.results || [];

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { placing } = useSelector((state) => state.bids);

  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [authModal, setAuthModal] = useState(null);
  const [showMobileBidSection, setShowMobileBidSection] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Same make or body type first, then anything else, so the row is always full.
  const recommendations = useMemo(() => {
    if (!vehicle) return [];
    const others = marketplaceVehicles.filter((v) => String(v.id) !== String(vehicle.id));
    const close = others.filter((v) => v.make === vehicle.make || (vehicle.body_type && v.body_type === vehicle.body_type));
    return [...close, ...others.filter((v) => !close.includes(v))].slice(0, 4);
  }, [marketplaceVehicles, vehicle]);

  // New vehicle (e.g. from "Similar vehicles"): start at its first photo.
  useEffect(() => {
    setCurrentImageIndex(0);
    setExpanded(false);
  }, [vehicleId]);

  const images = vehicle?.images?.length ? vehicle.images : [];
  const imageCount = Math.max(images.length, 1);
  const goTo = (i) => setCurrentImageIndex(Math.min(Math.max(i, 0), imageCount - 1));

  // Warm the neighbouring photos so arrows/swipes feel instant.
  useEffect(() => {
    [currentImageIndex - 1, currentImageIndex + 1].forEach((i) => {
      const src = images[i]?.image;
      if (src) new Image().src = src;
    });
  }, [currentImageIndex, images]);

  // Keep the active thumbnail in view.
  const thumbs = useRef(null);
  useEffect(() => {
    thumbs.current?.children[currentImageIndex]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [currentImageIndex]);

  // Swipe left/right on the main photo (phones).
  const touch = useRef(null);
  const onTouchStart = (e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY });
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(currentImageIndex + (dx < 0 ? 1 : -1));
  };

  const handlePlaceBid = () => {
    if (placing) return;
    if (vehicle && bidAmount) {
      dispatch(
        placeBid({
          vehicleId: vehicle.id,
          amount: parseFloat(bidAmount),
          message: bidMessage || "No message provided",
        })
      )
        .unwrap()
        .then(() => {
          toast.success("Offer sent. We'll let you know when the seller replies.");
          setBidAmount("");
          setBidMessage("");
          setShowMobileBidSection(false);
        })
        .catch((error) => {
          const errorMessage = error?.detail || error?.message || "Failed to place bid. Please try again.";
          toast.error(errorMessage);
        });
    }
  };

  const handleImageClick = (imageIndex = currentImageIndex) => {
    const imageUrls = vehicle.images?.map((img) => img.image) || [vehicle.main_image];
    openPreview(
      imageUrls,
      imageIndex,
      `${vehicle.make} ${vehicle.model}`,
      `${vehicle.make} ${vehicle.model} Gallery`,
      "Vehicle image gallery"
    );
  };

  const handleShare = (platform) => {
    const url = vehicleShareUrl(vehicle.id);
    const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
    }
    setShowShareModal(false);
  };

  // Phones get the system share sheet; everything else gets ours.
  const share = () => {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      navigator.share({ title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, url: vehicleShareUrl(vehicle.id) }).catch(() => {});
    } else {
      setShowShareModal(true);
    }
  };

  if (!vehicle && isError && error?.response?.status !== 404) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center px-4">
        <div className={`${card} p-8 text-center max-w-sm w-full`}>
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Couldn't load this car</h1>
          <p className="text-sm text-gray-500 mb-5">Check your connection and try again.</p>
          <button onClick={() => refetch()} disabled={isFetching} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium disabled:opacity-60">
            {isFetching ? "Trying again…" : "Try again"}
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle && isError) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center px-4">
        <div className={`${card} p-8 text-center max-w-sm w-full`}>
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Vehicle not available</h1>
          <p className="text-sm text-gray-500 mb-5">It may have been sold or removed.</p>
          <button onClick={() => navigate("/marketplace")} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium">
            Browse the marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) return <VehicleDetailSkeleton />;

  const name = titleCase(`${vehicle.make} ${vehicle.model}`);
  const instant = vehicle.listing_type === "instant_sale";
  const price = Number(instant ? vehicle.proposed_price || vehicle.price : vehicle.price || vehicle.proposed_price) || 0;
  const km = formatKm(vehicle.mileage);
  const badge = verification(vehicle);
  const isOwner = isAuthenticated && vehicle.owner?.id && user?.id === vehicle.owner.id;
  const canOffer = vehicle.listing_type === "marketplace" && !isOwner;
  const description = vehicle.description?.trim();
  const longDescription = description && description.length > 420;

  const specs = [
    { icon: Calendar, label: "Year", value: vehicle.year },
    { icon: Gauge, label: "Mileage", value: km },
    { icon: Fuel, label: "Fuel", value: capitalise(vehicle.fuel_type) },
    { icon: Settings2, label: "Gearbox", value: capitalise(vehicle.transmission) },
    { icon: Car, label: "Body", value: capitalise(vehicle.body_type) },
    { icon: MapPin, label: "Location", value: capitalise(vehicle.location) },
  ];

  // Built from the record's own dates; steps not reached yet show as upcoming.
  const timeline = [
    { label: "Listed on Auto Eden", date: vehicle.created_at, done: true },
    { label: "Details and VIN checked", date: vehicle.digitally_verified_at, done: vehicle.is_digitally_verified || vehicle.verification_state === "digital" || vehicle.verification_state === "physical" },
    { label: "Inspected in person", date: vehicle.physically_verified_at, done: vehicle.is_physically_verified || vehicle.verification_state === "physical" },
  ];

  const contactRow = (
    <div className="grid grid-cols-3 gap-2">
      <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 ring-1 ring-gray-200/80 py-2.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100">
        <Phone size={18} /> Call
      </a>
      <a
        href={`https://wa.me/${CONTACT.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi Auto Eden, I'm interested in the ${vehicle.year} ${name} (${window.location.href})`)}`}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 ring-1 ring-gray-200/80 py-2.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100"
      >
        <WhatsappLogo size={18} className="text-emerald-600" /> WhatsApp
      </a>
      <a
        href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`${vehicle.year} ${name} (#${vehicle.id})`)}`}
        className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 ring-1 ring-gray-200/80 py-2.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100"
      >
        <Mail size={18} /> Email
      </a>
    </div>
  );

  return (
    <div className="pacaembu-font min-h-screen bg-[#f6f7f9] pb-28 lg:pb-0">
      <VehicleMetaTags vehicle={vehicle} />

      {/* Header */}
      <header className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_85%_0%,rgba(220,38,38,0.32),transparent_60%)]" />
        <HeroPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/marketplace"))}
              className="inline-flex items-center gap-1.5 -ml-2 px-2 py-1.5 rounded-lg text-sm text-white/65 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={16} /> Back to cars
            </button>
            <div className="flex items-center gap-2">
            <SaveButton vehicle={vehicle} variant="pill" />
            <button
              onClick={share}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/10 text-sm text-white/90 transition-colors"
            >
              <Share2 size={16} /> Share
            </button>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {badge && (
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium ring-1 ${badge.tone}`}>
                    <BadgeCheck size={14} weight="fill" /> {badge.label}
                  </span>
                )}
                <span className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium ring-1 ring-white/15 bg-white/5 text-white/75">
                  {instant ? "Sold by Auto Eden" : "Open to offers"}
                </span>
              </div>
              <p className="text-white/55 text-sm">{vehicle.year}</p>
              <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">{name}</h1>
              <p className="mt-2 text-sm text-white/60 flex flex-wrap gap-x-3 gap-y-1">
                {[km, capitalise(vehicle.transmission), capitalise(vehicle.location)].filter(Boolean).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-3">{i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" />}{t}</span>
                ))}
              </p>
            </div>
            <div className="hidden lg:block text-right shrink-0">
              <p className="text-[12px] uppercase tracking-[0.14em] text-white/50">{instant ? "Price" : "Asking price"}</p>
              <p className="text-4xl font-semibold tabular-nums">{price ? formatPrice(price) : "On request"}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Left column */}
          <div className="min-w-0 space-y-4 sm:space-y-6">
            {/* Gallery */}
            <section className={`${card} overflow-hidden p-1.5 sm:p-2`} aria-label="Photos">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <div
                  className="aspect-[4/3] sm:aspect-[16/10] cursor-zoom-in select-none touch-pan-y"
                  onClick={() => images.length && handleImageClick(currentImageIndex)}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  <ProgressiveImage
                    src={images[currentImageIndex]?.image}
                    className="w-full h-full"
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}, photo ${currentImageIndex + 1}`}
                    draggable={false}
                    priority
                  />
                </div>

                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-gray-950/70 backdrop-blur px-2 py-1 text-[12px] font-medium text-white tabular-nums">
                  <Camera size={13} /> {currentImageIndex + 1} / {imageCount}
                </span>

                {images.length > 1 && (
                  <>
                    <button
                      aria-label="Previous photo"
                      onClick={(e) => { e.stopPropagation(); goTo(currentImageIndex - 1); }}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-gray-900 shadow-md disabled:opacity-0 hover:bg-white transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      aria-label="Next photo"
                      onClick={(e) => { e.stopPropagation(); goTo(currentImageIndex + 1); }}
                      disabled={currentImageIndex === images.length - 1}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-gray-900 shadow-md disabled:opacity-0 hover:bg-white transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {isPartial ? (
                <div className="pt-2 flex gap-2 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => <Bone key={i} className="w-20 sm:w-24 aspect-[4/3] rounded-md shrink-0" />)}
                </div>
              ) : images.length > 1 && (
                <div ref={thumbs} className="pt-2 flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, index) => (
                    <button
                      key={img.id ?? index}
                      aria-label={`Show photo ${index + 1}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative shrink-0 w-20 sm:w-24 aspect-[4/3] rounded-md overflow-hidden transition-opacity ${
                        currentImageIndex === index ? "" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <ProgressiveImage src={img.image} className="w-full h-full" alt="" draggable={false} />
                      {/* Drawn inside the thumbnail so the strip's edge can't clip it. */}
                      {currentImageIndex === index && <span aria-hidden="true" className="absolute inset-0 rounded-md ring-2 ring-inset ring-red-600" />}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Price + actions on phones (desktop has the sticky panel) */}
            <section className={`${card} p-4 lg:hidden`}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.12em] text-gray-500">{instant ? "Price" : "Asking price"}</p>
                  <p className="text-[28px] font-semibold text-gray-900 tabular-nums leading-tight">{price ? formatPrice(price) : "On request"}</p>
                </div>
                {vehicle.bid_count > 0 && (
                  <span className="rounded-md bg-red-50 text-red-700 px-2 py-1 text-[12px] font-medium">
                    {vehicle.bid_count} {vehicle.bid_count === 1 ? "offer" : "offers"} so far
                  </span>
                )}
              </div>
              <div className="mt-4">{contactRow}</div>
            </section>

            {/* Specs */}
            <section className={`${card} p-4 sm:p-6`} aria-labelledby="specs">
              <h2 id="specs" className="text-lg font-semibold text-gray-900">Key details</h2>
              <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg bg-gray-50 ring-1 ring-gray-100 p-3 sm:p-3.5">
                    <dt className="flex items-center gap-1.5 text-[12px] text-gray-500"><Icon size={14} /> {label}</dt>
                    <dd className="mt-1 text-[15px] font-medium text-gray-900 truncate">{isPartial && !value ? <Bone className="h-4 w-16" /> : value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Description */}
            <section className={`${card} p-4 sm:p-6`} aria-labelledby="about-car">
              <h2 id="about-car" className="text-lg font-semibold text-gray-900">About this car</h2>
              {isPartial ? (
                <div className="mt-3 space-y-2"><Bone className="h-3.5 w-full" /><Bone className="h-3.5 w-11/12" /><Bone className="h-3.5 w-2/3" /></div>
              ) : description ? (
                <>
                  <p className={`mt-3 text-[15px] leading-relaxed text-gray-600 whitespace-pre-line ${longDescription && !expanded ? "line-clamp-6" : ""}`}>{description}</p>
                  {longDescription && (
                    <button onClick={() => setExpanded((v) => !v)} className="mt-2 text-sm font-medium text-red-600 hover:text-red-700">
                      {expanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-3 text-[15px] text-gray-500">The seller hasn't added a description yet. Ask us anything about this car and we'll find out.</p>
              )}
            </section>

            {/* Verification */}
            <section className={`${card} relative isolate overflow-hidden p-4 sm:p-6`} aria-labelledby="checks">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-lg bg-gray-950 text-white shrink-0"><ShieldCheck size={20} /></span>
                <div>
                  <h2 id="checks" className="text-lg font-semibold text-gray-900">Auto Eden checks</h2>
                  <p className="text-sm text-gray-500">Every car goes through these before you can buy it.</p>
                </div>
              </div>
              <ol className="mt-5 space-y-0">
                {timeline.map((s, i) => (
                  <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < timeline.length - 1 && <span className={`absolute left-[11px] top-6 bottom-0 w-px ${s.done ? "bg-emerald-300" : "bg-gray-200"}`} />}
                    <span className={`relative grid place-items-center w-6 h-6 rounded-full shrink-0 ${s.done ? "bg-emerald-500 text-white" : "bg-white ring-2 ring-gray-200 text-gray-300"}`}>
                      {s.done && <Check size={13} weight="bold" />}
                    </span>
                    <div className="min-w-0 -mt-0.5">
                      <p className={`text-[15px] font-medium ${s.done ? "text-gray-900" : "text-gray-400"}`}>{s.label}</p>
                      <p className="text-[13px] text-gray-500">{s.done ? fmtDate(s.date) || "Done" : "Not yet"}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Right column (desktop) */}
          <aside className="hidden lg:block sticky top-24 space-y-4">
            <div className={`${card} p-6`}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.12em] text-gray-500">{instant ? "Price" : "Asking price"}</p>
                  <p className="text-3xl font-semibold text-gray-900 tabular-nums">{price ? formatPrice(price) : "On request"}</p>
                </div>
                {vehicle.bid_count > 0 && (
                  <span className="rounded-md bg-red-50 text-red-700 px-2 py-1 text-[12px] font-medium">
                    {vehicle.bid_count} {vehicle.bid_count === 1 ? "offer" : "offers"}
                  </span>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                {isOwner ? (
                  <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    This is your listing. Offers on it show up in your{" "}
                    <Link to="/dashboard?tab=offers" className="font-medium text-red-600 hover:text-red-700">dashboard</Link>.
                  </div>
                ) : canOffer ? (
                  isAuthenticated ? (
                    <>
                      <h2 className="font-semibold text-gray-900 mb-3">Make an offer</h2>
                      <OfferForm
                        amount={bidAmount} setAmount={setBidAmount}
                        message={bidMessage} setMessage={setBidMessage}
                        placing={placing} onSubmit={handlePlaceBid} price={price}
                      />
                      <button onClick={() => setShowQuoteModal(true)} className="mt-2.5 w-full h-12 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 text-gray-900 font-medium transition-colors inline-flex items-center justify-center gap-2">
                        <FileText size={18} /> Get a quote
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2.5">
                      <button onClick={() => setAuthModal("login")} className="w-full h-12 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
                        Sign in to make an offer
                      </button>
                      <button onClick={() => setShowQuoteModal(true)} className="w-full h-12 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 text-gray-900 font-medium transition-colors inline-flex items-center justify-center gap-2">
                        <FileText size={18} /> Get a quote
                      </button>
                    </div>
                  )
                ) : (
                  <button onClick={() => setShowQuoteModal(true)} className="w-full h-12 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors inline-flex items-center justify-center gap-2">
                    <FileText size={18} /> Get a quote
                  </button>
                )}
              </div>

              <div className="mt-5">
                <p className="text-[13px] text-gray-500 mb-2">Questions? Talk to Auto Eden</p>
                {contactRow}
              </div>
            </div>

            <ul className={`${card} p-5 space-y-3 text-sm text-gray-600`}>
              {[
                "No fees for buyers",
                "We check the VIN and paperwork",
                "View the car before you pay",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600"><Check size={12} weight="bold" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Similar vehicles */}
        {(!market || recommendations.length > 0) && (
          <section className="mt-10 sm:mt-14" aria-labelledby="similar">
            <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-red-600">Keep looking</p>
                <h2 id="similar" className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Similar cars</h2>
              </div>
              <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-red-600">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {!market
                ? [0, 1, 2, 3].map((i) => <ListingCardSkeleton key={i} />)
                : recommendations.map((rec) => <ListingCard key={rec.id} vehicle={rec} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur border-t border-gray-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-gray-500 truncate">{vehicle.year} {name}</p>
            <p className="text-xl font-semibold text-gray-900 tabular-nums">{price ? formatPrice(price) : "On request"}</p>
          </div>
          {isOwner ? (
            <Link to="/dashboard?tab=listings" className="h-12 px-5 rounded-lg bg-gray-900 text-white font-semibold inline-flex items-center">Manage</Link>
          ) : canOffer ? (
            <>
              <button
                onClick={() => setShowQuoteModal(true)}
                aria-label="Get a quote"
                className="h-12 px-3.5 rounded-lg ring-1 ring-gray-200 active:bg-gray-50 text-gray-900 font-medium inline-flex items-center gap-1.5"
              >
                <FileText size={18} /> Quote
              </button>
              <button
                onClick={() => (isAuthenticated ? setShowMobileBidSection(true) : setAuthModal("login"))}
                className="h-12 px-4 rounded-lg bg-red-600 active:bg-red-700 text-white font-semibold whitespace-nowrap"
              >
                Make an offer
              </button>
            </>
          ) : (
            <button onClick={() => setShowQuoteModal(true)} className="h-12 px-5 rounded-lg bg-red-600 active:bg-red-700 text-white font-semibold inline-flex items-center gap-2 whitespace-nowrap">
              <FileText size={18} /> Get a quote
            </button>
          )}
        </div>
      </div>

      {/* Mobile offer sheet */}
      <AnimatePresence>
        {showMobileBidSection && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Make an offer">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileBidSection(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl max-h-[88svh] overflow-y-auto px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Make an offer</h3>
                  <p className="text-sm text-gray-500">{vehicle.year} {name} · asking {formatPrice(price)}</p>
                </div>
                <button aria-label="Close" onClick={() => setShowMobileBidSection(false)} className="p-2 -mr-2 rounded-lg hover:bg-gray-100">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <OfferForm
                amount={bidAmount} setAmount={setBidAmount}
                message={bidMessage} setMessage={setBidMessage}
                placing={placing} onSubmit={handlePlaceBid} price={price}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Share this car">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share this car</h3>
                <button aria-label="Close" onClick={() => setShowShareModal(false)} className="p-2 -mr-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["whatsapp", WhatsappLogo, "WhatsApp", "text-emerald-600"],
                  ["facebook", Facebook, "Facebook", "text-blue-600"],
                  ["twitter", XLogo, "X", "text-gray-900"],
                  ["copy", Copy, "Copy link", "text-gray-600"],
                ].map(([id, Icon, label, tone]) => (
                  <button key={id} onClick={() => handleShare(id)} className="flex items-center justify-center gap-2 h-12 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-800">
                    <Icon size={18} className={tone} /> {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuoteRequestModal
        open={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        vehicle={vehicle}
        vehicleId={vehicle?.id}
      />

      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />

      <ImagePreview
        isOpen={preview.isOpen}
        onClose={closePreview}
        images={preview.images}
        currentIndex={preview.currentIndex}
        alt={preview.alt}
        title={preview.title}
        description={preview.description}
      />
    </div>
  );
}
