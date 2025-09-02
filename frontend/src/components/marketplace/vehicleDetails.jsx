import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import {
  fetchMarketplace,
  fetchVehicleDetails,
} from "../../redux/slices/vehicleSlice";
import { placeBid } from "../../redux/slices/bidSlice";
import { requestQuote } from "../../redux/slices/quoteSlice";
import { AuthModals } from "../navbar/navbar";
import ImageWithFallback from "../../utils/smartImage";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import {
  Car,
  DollarSign,
  Calendar,
  Gauge,
  Tag,
  Map,
  Shield,
  Award,
  TrendingUp,
  Clock,
  ArrowLeft,
  X,
  Share2,
  Heart,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  Star,
  Zap,
  Info,
  Camera,
  MapPin,
  Calendar as CalendarIcon,
  Fuel,
  Settings,
  Users,
  Download,
  Facebook,
  Twitter,
  Copy,
  Loader2,
  Menu,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import ImagePreview, { useImagePreview } from "../imagePreviewing";
import useTracking from "../../hooks/useTracking";
import VehicleCard from "./vehicleCard";
import QuoteRequestModal from "./quoteRequestModal";

// Mock data for enhanced features
const mockVehicleDetails = {
  features: [
    "Air Conditioning",
    "Power Steering",
    "ABS Brakes",
    "Airbags",
    "Electric Windows",
    "Central Locking",
    "Alloy Wheels",
    "Bluetooth",
    "Backup Camera",
    "Cruise Control",
    "Leather Seats",
    "Sunroof",
  ],
  specifications: {
    engine: "2.0L Turbo",
    transmission: "Automatic",
    drivetrain: "Front-wheel drive",
    doors: 4,
    seats: 5,
    color: "Midnight Blue",
    interiorColor: "Black Leather",
    fuelEconomy: "8.5L/100km",
    tankCapacity: "60L",
    weight: "1,450 kg",
    dimensions: "4.5m x 1.8m x 1.4m",
  },
  seller: {
    name: "Auto Eden Motors",
    rating: 4.8,
    reviewCount: 247,
    verified: true,
    location: "Harare, Zimbabwe",
    phone: "+263 77 123 4567",
    email: "contact@autoeden.co.zw",
  },
  history: [
    { date: "2024-01-15", event: "Listed for sale", status: "info" },
    { date: "2024-01-10", event: "Physically verified", status: "success" },
    { date: "2024-01-05", event: "Digitally verified", status: "success" },
    { date: "2024-01-01", event: "Vehicle uploaded", status: "info" },
  ],
};

// Custom Toast Component
const Toast = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg max-w-sm w-full mx-4 ${
            type === "success"
              ? "bg-green-600 text-white"
              : type === "error"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children, title, size = "max-w-md" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm bg-opacity-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative bg-white rounded-xl shadow-xl ${size} w-full max-h-[90vh] overflow-y-auto`}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Tabs Component
const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => onTabChange(index)}
            className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === index
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

// Button Component
const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-100",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

function VehicleMetaTags({ vehicle }) {
  if (!vehicle) return null;

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} - Auto Eden`;
  const description = `${vehicle.year} ${vehicle.make} ${
    vehicle.model
  } for $${vehicle.price?.toLocaleString()} - ${
    vehicle.body_type || "Sedan"
  } with ${vehicle.mileage?.toLocaleString()}km. ${
    vehicle.is_physically_verified
      ? "Physically verified"
      : "Digitally verified"
  } vehicle on Auto Eden.`;

  const baseUrl = "https://autoeden.co.zw";
  const defaultImage = `${baseUrl}/default-car-image.jpg`;

  const getImageUrl = () => {
    if (vehicle.images && vehicle.images.length > 0) {
      const firstImage = vehicle.images[0]?.image;
      if (firstImage) {
        return firstImage.startsWith("http")
          ? firstImage
          : `${baseUrl}${firstImage}`;
      }
    }
    return defaultImage;
  };

  const image = getImageUrl();
  const url = `${baseUrl}/vehicles/${vehicle.id}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content={`${vehicle.make}, ${vehicle.model}, ${vehicle.year}, car, vehicle, auto, zimbabwe, harare, for sale`}
      />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={`${vehicle.year} ${vehicle.make} ${vehicle.model} for sale`}
      />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Auto Eden" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@AutoEdenZW" />
      <meta name="twitter:creator" content="@AutoEdenZW" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content={`${vehicle.year} ${vehicle.make} ${vehicle.model} for sale`}
      />

      <meta property="og:image:type" content="image/jpeg" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Auto Eden Motors" />
      <link rel="canonical" href={url} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Car",
          name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          description: description,
          image: [image],
          brand: {
            "@type": "Brand",
            name: vehicle.make,
          },
          model: vehicle.model,
          vehicleModelDate: vehicle.year,
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            value: vehicle.mileage,
            unitCode: "KMT",
          },
          offers: {
            "@type": "Offer",
            url: url,
            priceCurrency: "USD",
            price: vehicle.price,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            itemCondition: "https://schema.org/UsedCondition",
            availability: "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: "Auto Eden Motors",
              url: "https://autoeden.co.zw",
            },
          },
          manufacturer: {
            "@type": "Organization",
            name: vehicle.make,
          },
          vehicleConfiguration: vehicle.body_type,
          fuelType: vehicle.fuel_type || "Gasoline",
          url: url,
        })}
      </script>
    </Helmet>
  );
}

export default function CarDetailsPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useTracking(window.location.pathname, vehicleId);
  const { preview, openPreview, closePreview } = useImagePreview();

  // Get state from Redux
  const {
    currentVehicle,
    loadingDetails,
    marketplace: { results: marketplaceVehicles = [] },
  } = useSelector((state) => state.vehicles);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { placing } = useSelector((state) => state.bids);

  // Local state
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [authModal, setAuthModal] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [viewCount, setViewCount] = useState(1247);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Get recommendations (similar vehicles)
  const recommendations = useMemo(() => {
    if (!currentVehicle) return [];
    return marketplaceVehicles
      .filter(
        (v) =>
          v.id !== currentVehicle.id &&
          (v.make === currentVehicle.make ||
            v.body_type === currentVehicle.body_type)
      )
      .slice(0, 4);
  }, [marketplaceVehicles, currentVehicle]);

  useEffect(() => {
    if (vehicleId) {
      dispatch(fetchVehicleDetails(vehicleId));
    }
  }, [vehicleId, dispatch]);

  useEffect(() => {
    dispatch(fetchMarketplace());
  }, [dispatch]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const handlePlaceBid = () => {
    if (placing) return;
    if (currentVehicle && bidAmount) {
      dispatch(
        placeBid({
          vehicleId: currentVehicle.id,
          amount: parseFloat(bidAmount),
          message: bidMessage || "No message provided",
        })
      )
        .then(() => {
          showToast("Your bid has been placed successfully!");
          setBidAmount("");
          setBidMessage("");
        })
        .catch((error) => {
          const errorMessage =
            error?.payload?.detail ||
            error?.payload?.message ||
            "Failed to place bid. Please try again.";
          showToast(errorMessage, "error");
        });
    }
  };

  const handleImageClick = (imageIndex = currentImageIndex) => {
    const imageUrls = vehicle.images?.map((img) => img.image) || [
      vehicle.main_image,
    ];
    openPreview(
      imageUrls,
      imageIndex,
      `${vehicle.make} ${vehicle.model}`,
      `${vehicle.make} ${vehicle.model} Gallery`,
      "Vehicle image gallery"
    );
  };

  const vehicle = currentVehicle;

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${url}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${title} - ${url}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!");
        break;
    }
    setShowShareModal(false);
  };

  const getVerificationIcon = (vehicle) => {
    if (vehicle.verification_state === "physical") {
      return <CheckCircle className="text-green-500" size={20} />;
    } else if (vehicle.is_digitally_verified) {
      return <Shield className="text-blue-500" size={20} />;
    } else if (vehicle.is_rejected) {
      return <XCircle className="text-red-500" size={20} />;
    }
    return <AlertCircle className="text-yellow-500" size={20} />;
  };

  const getVerificationText = (vehicle) => {
    if (vehicle.verification_state === "physical") return "Physically Verified";
    if (vehicle.is_digitally_verified) return "Digitally Verified";
    if (vehicle.is_rejected) return "Rejected";
    return "Verification Pending";
  };

  const tabs = ["Specifications", "Features", "Seller Info", "History"];

  if (!vehicle || loadingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VehicleMetaTags vehicle={vehicle} />

      {/* Mobile-First Header */}
      <div className="bg-gray-100 shadow-sm pt-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              icon={ArrowLeft}
            >
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center text-gray-600 text-sm">
                <Eye size={16} className="mr-1" />
                <span>{viewCount.toLocaleString()}</span>
              </div>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Heart
                  size={20}
                  className={
                    isWishlisted ? "text-red-500 fill-current" : "text-gray-500"
                  }
                />
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareModal(true)}
                icon={Share2}
              >
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 ">
        {/* Main Vehicle Card - Mobile Optimized */}
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Image Gallery */}
          <div className="relative">
            <div
              className="aspect-w-16 aspect-h-9 sm:aspect-h-12"
              onClick={() => handleImageClick(currentImageIndex)}
            >
              <ImageWithFallback
                src={vehicle.images?.[currentImageIndex]?.image}
                className="w-full h-74 sm:h-80 lg:h-96 object-cover cursor-pointer"
                alt={`${vehicle.make} ${vehicle.model}`}
              />
            </div>

            {/* Image counter and camera icon */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {vehicle.images?.length || 1}
              </div>
              <div className="bg-black bg-opacity-50 text-white p-2 rounded-full">
                <Camera size={16} />
              </div>
            </div>

            {/* Mobile thumbnail strip */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {vehicle.images?.slice(0, 5).map((img, index) => (
                  <motion.button
                    key={index}
                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleImageClick(index)}
                  >
                    <ImageWithFallback
                      src={img.image}
                      className="w-full h-full object-cover"
                      alt={`Preview ${index + 1}`}
                    />
                  </motion.button>
                ))}
                {vehicle.images?.length > 5 && (
                  <button
                    onClick={() => handleImageClick(0)}
                    className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white text-xs"
                  >
                    +{vehicle.images.length - 5}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Info - Mobile Optimized */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-0">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex items-center space-x-2">
                  {getVerificationIcon(vehicle)}
                  <span className="text-xs sm:text-sm text-gray-600">
                    {getVerificationText(vehicle)}
                  </span>
                </div>
              </div>

              {/* Price and badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg sm:text-xl">
                  ${vehicle.price?.toLocaleString() || "0"}
                </div>

                {vehicle.listing_type === "marketplace" && (
                  <div className="flex items-center text-red-500 bg-red-50 px-3 py-1 rounded-full text-sm">
                    <TrendingUp className="mr-1" size={16} />
                    <span>Marketplace</span>
                  </div>
                )}

                <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm relative">
                  <MessageCircle className="mr-1" size={16} />
                  <span>Bids</span>
                  {vehicle.bid_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {vehicle.bid_count}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Key specs grid - Mobile optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Gauge className="text-blue-500 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Mileage</p>
                  <p className="font-semibold text-sm truncate">
                    {vehicle.mileage?.toLocaleString() || "0"} km
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Tag className="text-green-500 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Body Type</p>
                  <p className="font-semibold text-sm truncate">
                    {vehicle.body_type || "Sedan"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="text-purple-500 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="font-semibold text-sm truncate">
                    {vehicle.location || "Auto Eden HQ"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Fuel className="text-orange-500 flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600">Fuel Type</p>
                  <p className="font-semibold text-sm truncate">
                    {vehicle.fuel_type || "Petrol"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action section - Mobile optimized */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 sm:p-6 rounded-xl">
              {vehicle.listing_type === "marketplace" ? (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <DollarSign className="mr-2 text-red-500" />
                    Make an Offer
                  </h3>

                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <DollarSign
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="number"
                          placeholder="Your bid amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <textarea
                        placeholder="Tell the seller why you're interested..."
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />

                      <Button
                        variant="primary"
                        size="lg"
                        loading={placing}
                        onClick={handlePlaceBid}
                        className="w-full"
                      >
                        {placing ? "Submitting..." : "Submit Offer"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setAuthModal("login")}
                        className="w-full"
                      >
                        Login to Make an Offer
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-gray-50 text-gray-500">
                            or
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowQuoteModal(true)}
                        className="w-full"
                      >
                        Get Instant Quote
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={Zap}
                  className="w-full"
                >
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details Tabs - Mobile Optimized */}
        <motion.div
          className="bg-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-4 sm:p-6">
            {/* Specifications Tab */}
            {activeTab === 0 && (
              <div className="space-y-4">
                {vehicle.description && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {vehicle.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-700">{vehicle.description}</span>
                </div>
              </div>
            )}

            {/* Seller Info Tab */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {mockVehicleDetails.seller.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold">
                        {mockVehicleDetails.seller.name}
                      </h3>
                      {mockVehicleDetails.seller.verified && (
                        <CheckCircle className="text-green-500" size={20} />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Star className="text-yellow-400" size={16} />
                      <span>{mockVehicleDetails.seller.rating}</span>
                      <span>
                        ({mockVehicleDetails.seller.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-1" />
                      <span>{mockVehicleDetails.seller.location}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    icon={Phone}
                    onClick={() =>
                      window.open(`tel:${mockVehicleDetails.seller.phone}`)
                    }
                    className="w-full"
                  >
                    <span className="hidden sm:inline">
                      {mockVehicleDetails.seller.phone}
                    </span>
                    <span className="sm:hidden">Call</span>
                  </Button>
                  <Button
                    variant="outline"
                    icon={Mail}
                    onClick={() =>
                      window.open(`mailto:${mockVehicleDetails.seller.email}`)
                    }
                    className="w-full"
                  >
                    <span className="hidden sm:inline">Send Email</span>
                    <span className="sm:hidden">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    icon={FaWhatsapp}
                    onClick={() =>
                      window.open(
                        `https://wa.me/${mockVehicleDetails.seller.phone.replace(
                          /\D/g,
                          ""
                        )}`
                      )
                    }
                    className="w-full sm:col-span-2 text-green-600"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 3 && (
              <div className="space-y-4">
                {mockVehicleDetails.history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {item.status === "success" ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <Info className="text-blue-500" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.event}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommendations - Mobile Optimized */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 px-2">
              Similar Vehicles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Carousel Modal */}
      <Modal
        isOpen={showCarousel}
        onClose={() => setShowCarousel(false)}
        size="max-w-6xl"
      >
        <div className="bg-black text-white">
          <div className="relative aspect-w-16 aspect-h-9">
            <img
              src={vehicle.images?.[currentImageIndex]?.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-96 sm:h-[70vh] object-contain"
            />

            {/* Navigation arrows */}
            <button
              onClick={() =>
                setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
              }
              disabled={currentImageIndex === 0}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() =>
                setCurrentImageIndex(
                  Math.min(vehicle.images?.length - 1, currentImageIndex + 1)
                )
              }
              disabled={currentImageIndex === vehicle.images?.length - 1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-70 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Close button */}
            <button
              onClick={() => setShowCarousel(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Image indicators */}
          <div className="flex justify-center space-x-2 p-4 overflow-x-auto">
            {vehicle.images?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentImageIndex === index ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share this vehicle"
      >
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              icon={Facebook}
              onClick={() => handleShare("facebook")}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              icon={FaXTwitter}
              onClick={() => handleShare("twitter")}
              className="text-black border-gray-200 hover:bg-gray-50"
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              icon={FaWhatsapp}
              onClick={() => handleShare("whatsapp")}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              icon={Copy}
              onClick={() => handleShare("copy")}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        open={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        vehicle={vehicle}
        vehicleId={vehicle?.id}
      />

      {/* Auth Modals */}
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

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}
