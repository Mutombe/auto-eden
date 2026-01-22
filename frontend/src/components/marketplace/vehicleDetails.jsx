import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  fetchMarketplace,
  fetchVehicleDetails,
} from "../../redux/slices/vehicleSlice";
import { placeBid } from "../../redux/slices/bidSlice";
import { AuthModals } from "../navbar/navbar";
import ImageWithFallback from "../../utils/smartImage";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import {
  DollarSign,
  Gauge,
  Tag,
  Shield,
  TrendingUp,
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
  Star,
  Zap,
  Info,
  Camera,
  MapPin,
  Fuel,
  Facebook,
  Copy,
  Loader2,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImagePreview, { useImagePreview } from "../imagePreviewing";
import useTracking from "../../hooks/useTracking";
import VehicleCard from "./vehicleCard";
import QuoteRequestModal from "./quoteRequestModal";

// Mock data for seller info
const mockSellerInfo = {
  name: "Auto Eden Motors",
  rating: 4.8,
  reviewCount: 247,
  verified: true,
  location: "Harare, Zimbabwe",
  phone: "+263 77 123 4567",
  email: "contact@autoeden.co.zw",
};

const mockHistory = [
  { date: "2024-01-15", event: "Listed for sale", status: "info" },
  { date: "2024-01-10", event: "Physically verified", status: "success" },
  { date: "2024-01-05", event: "Digitally verified", status: "success" },
  { date: "2024-01-01", event: "Vehicle uploaded", status: "info" },
];

// SEO Meta Tags Component
function VehicleMetaTags({ vehicle }) {
  if (!vehicle) return null;

  const baseUrl = "https://autoeden.co.zw";
  const url = `${baseUrl}/vehicles/${vehicle.id}`;
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale | Auto Eden Zimbabwe`;
  const description = `Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.location || 'Zimbabwe'}. ${vehicle.mileage?.toLocaleString()}km, ${vehicle.fuel_type || 'Petrol'}, ${vehicle.transmission || 'Manual'}. ${vehicle.is_physically_verified ? 'Verified Condition.' : ''} Price: $${vehicle.price?.toLocaleString()}.`;
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

// Stat Card Component - Mobile Optimized
const StatCard = ({ icon: Icon, label, value, color = "text-gray-400" }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
    <div className={`p-1.5 sm:p-2 rounded-lg bg-white/10 ${color}`}>
      <Icon size={16} className="sm:w-5 sm:h-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide truncate">{label}</p>
      <p className="text-white font-semibold text-sm sm:text-base truncate">{value}</p>
    </div>
  </div>
);

// Tab Button Component
const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 sm:px-5 py-3 font-medium text-sm transition-all whitespace-nowrap flex-shrink-0 ${
      active
        ? "text-red-500 border-b-2 border-red-500 bg-red-50/50"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

export default function CarDetailsPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useTracking(window.location.pathname, vehicleId);
  const { preview, openPreview, closePreview } = useImagePreview();

  const {
    currentVehicle,
    loadingDetails,
    marketplace: { results: marketplaceVehicles = [] },
  } = useSelector((state) => state.vehicles);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { placing } = useSelector((state) => state.bids);

  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [authModal, setAuthModal] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [viewCount] = useState(1247);
  const [showMobileBidSection, setShowMobileBidSection] = useState(false);

  const vehicle = currentVehicle;

  const recommendations = useMemo(() => {
    if (!currentVehicle) return [];
    return marketplaceVehicles
      .filter(
        (v) =>
          v.id !== currentVehicle.id &&
          (v.make === currentVehicle.make || v.body_type === currentVehicle.body_type)
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
        .unwrap()
        .then(() => {
          toast.success("Your bid has been placed successfully!");
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
    const url = window.location.href;
    const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${title} - ${url}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
    }
    setShowShareModal(false);
  };

  const getVerificationBadge = (vehicle) => {
    if (vehicle.verification_state === "physical") {
      return { icon: CheckCircle, text: "Physically Verified", color: "text-green-400", bg: "bg-green-500/20" };
    } else if (vehicle.is_digitally_verified) {
      return { icon: Shield, text: "Digitally Verified", color: "text-blue-400", bg: "bg-blue-500/20" };
    } else if (vehicle.is_rejected) {
      return { icon: XCircle, text: "Rejected", color: "text-red-400", bg: "bg-red-500/20" };
    }
    return { icon: AlertCircle, text: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/20" };
  };

  const tabs = ["Overview", "Features", "Seller", "History"];

  if (!vehicle || loadingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm sm:text-base">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  const badge = getVerificationBadge(vehicle);
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-gray-100 pb-20 lg:pb-0">
      <VehicleMetaTags vehicle={vehicle} />

      {/* Dark Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 pt-16 sm:pt-20 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-white transition-colors py-2 -ml-2 pl-2 pr-3 rounded-lg active:bg-white/10"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center text-gray-400 text-sm">
                <Eye size={16} className="mr-1" />
                <span>{viewCount.toLocaleString()} views</span>
              </div>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
              >
                <Heart
                  size={18}
                  className={`sm:w-5 sm:h-5 ${isWishlisted ? "text-red-500 fill-current" : "text-gray-400"}`}
                />
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="p-2.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
              >
                <Share2 size={18} className="sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Vehicle Title & Badge */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badge.bg}`}>
                <BadgeIcon size={14} className={badge.color} />
                <span className={`text-xs font-medium ${badge.color}`}>{badge.text}</span>
              </div>
              {vehicle.listing_type === "marketplace" && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  <TrendingUp size={12} />
                  <span>Marketplace</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xl sm:text-2xl lg:text-3xl shadow-lg shadow-red-500/30">
                ${vehicle.price?.toLocaleString() || "0"}
              </div>
              {vehicle.bid_count > 0 && (
                <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>{vehicle.bid_count} {vehicle.bid_count === 1 ? 'bid' : 'bids'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <StatCard icon={Gauge} label="Mileage" value={`${vehicle.mileage?.toLocaleString() || "0"} km`} color="text-blue-400" />
            <StatCard icon={Tag} label="Body Type" value={vehicle.body_type || "Sedan"} color="text-green-400" />
            <StatCard icon={MapPin} label="Location" value={vehicle.location || "Auto Eden"} color="text-purple-400" />
            <StatCard icon={Fuel} label="Fuel Type" value={vehicle.fuel_type || "Petrol"} color="text-orange-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Images & Tabs */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Image Gallery */}
            <motion.div
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div
                  className="aspect-[4/3] sm:aspect-video cursor-pointer"
                  onClick={() => handleImageClick(currentImageIndex)}
                >
                  <ImageWithFallback
                    src={vehicle.images?.[currentImageIndex]?.image}
                    className="w-full h-full object-cover"
                    alt={`${vehicle.make} ${vehicle.model}`}
                  />
                </div>

                {/* Image Counter */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <div className="bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-1">
                    <Camera size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span>{currentImageIndex + 1}/{vehicle.images?.length || 1}</span>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {vehicle.images?.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                      }}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-black/70 active:scale-95 transition-all"
                    >
                      <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(Math.min(vehicle.images?.length - 1, currentImageIndex + 1));
                      }}
                      disabled={currentImageIndex === vehicle.images?.length - 1}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-black/70 active:scale-95 transition-all"
                    >
                      <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {vehicle.images?.length > 1 && (
                <div className="p-3 sm:p-4 border-t border-gray-100">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                    {vehicle.images?.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                          currentImageIndex === index ? "border-red-500 ring-2 ring-red-500/30" : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <ImageWithFallback
                          src={img.image}
                          className="w-full h-full object-cover"
                          alt={`Preview ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tabs Section */}
            <motion.div
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                {tabs.map((tab, index) => (
                  <TabButton key={tab} active={activeTab === index} onClick={() => setActiveTab(index)}>
                    {tab}
                  </TabButton>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {/* Overview Tab */}
                {activeTab === 0 && (
                  <div className="space-y-5 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {vehicle.description || "No description provided for this vehicle."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Key Specifications</h4>
                        <div className="space-y-2">
                          {[
                            { label: "Year", value: vehicle.year },
                            { label: "Make", value: vehicle.make },
                            { label: "Model", value: vehicle.model },
                            { label: "Mileage", value: `${vehicle.mileage?.toLocaleString()} km` },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-500">{item.label}</span>
                              <span className="text-gray-900 font-medium">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Vehicle Details</h4>
                        <div className="space-y-2">
                          {[
                            { label: "Body Type", value: vehicle.body_type || "N/A" },
                            { label: "Fuel Type", value: vehicle.fuel_type || "N/A" },
                            { label: "Transmission", value: vehicle.transmission || "N/A" },
                            { label: "Location", value: vehicle.location || "N/A" },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-500">{item.label}</span>
                              <span className="text-gray-900 font-medium truncate ml-2">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === 1 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Vehicle Features</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {vehicle.description || "Feature list not available for this vehicle."}
                    </p>
                  </div>
                )}

                {/* Seller Tab */}
                {activeTab === 2 && (
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg flex-shrink-0">
                        {mockSellerInfo.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{mockSellerInfo.name}</h3>
                          {mockSellerInfo.verified && <CheckCircle className="text-green-500 flex-shrink-0" size={18} />}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 mb-1 text-sm">
                          <Star className="text-yellow-400 fill-current flex-shrink-0" size={14} />
                          <span className="font-medium">{mockSellerInfo.rating}</span>
                          <span className="text-gray-400">({mockSellerInfo.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                          <MapPin size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{mockSellerInfo.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <button
                        onClick={() => window.open(`tel:${mockSellerInfo.phone}`)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-3.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl transition-colors"
                      >
                        <Phone size={18} className="text-gray-600" />
                        <span className="font-medium text-gray-700 text-xs sm:text-sm">Call</span>
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${mockSellerInfo.email}`)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-3.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl transition-colors"
                      >
                        <Mail size={18} className="text-gray-600" />
                        <span className="font-medium text-gray-700 text-xs sm:text-sm">Email</span>
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${mockSellerInfo.phone.replace(/\D/g, "")}`)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-3.5 bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-xl transition-colors"
                      >
                        <FaWhatsapp size={18} className="text-green-600" />
                        <span className="font-medium text-green-700 text-xs sm:text-sm">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 3 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Vehicle Timeline</h3>
                    {mockHistory.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-b-0">
                        <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${item.status === "success" ? "bg-green-100" : "bg-blue-100"}`}>
                          {item.status === "success" ? (
                            <CheckCircle className="text-green-600" size={16} />
                          ) : (
                            <Info className="text-blue-600" size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{item.event}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Bid Section (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-6 sticky top-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {vehicle.listing_type === "marketplace" ? (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <DollarSign className="text-red-500" size={24} />
                      Make an Offer
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Submit your best offer for this vehicle</p>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Offer</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                        <textarea
                          placeholder="Tell the seller why you're interested..."
                          value={bidMessage}
                          onChange={(e) => setBidMessage(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                        />
                      </div>

                      <button
                        onClick={handlePlaceBid}
                        disabled={placing || !bidAmount}
                        className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                      >
                        {placing ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Submitting...
                          </>
                        ) : (
                          "Submit Offer"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={() => setAuthModal("login")}
                        className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-500/30"
                      >
                        Login to Make an Offer
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">or</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowQuoteModal(true)}
                        className="w-full py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Get Instant Quote
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Shield size={18} className="text-green-500 flex-shrink-0" />
                      <span>Secure transaction protected by Auto Eden</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-gray-900">${vehicle.price?.toLocaleString()}</div>
                  <button className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
                    <Zap size={20} />
                    Buy Now
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Similar Vehicles */}
        {recommendations.length > 0 && (
          <motion.div
            className="mt-8 sm:mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Similar Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((rec) => (
                <VehicleCard
                  key={rec.id}
                  vehicle={rec}
                  onClick={() => navigate(`/vehicles/${rec.id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 lg:hidden z-40 safe-area-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-xl font-bold text-gray-900">${vehicle.price?.toLocaleString()}</p>
          </div>
          {vehicle.listing_type === "marketplace" ? (
            <button
              onClick={() => isAuthenticated ? setShowMobileBidSection(true) : setAuthModal("login")}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              Make Offer
            </button>
          ) : (
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 active:scale-[0.98]">
              <Zap size={18} />
              Buy Now
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bid Sheet */}
      <AnimatePresence>
        {showMobileBidSection && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileBidSection(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto safe-area-bottom"
            >
              <div className="p-4 sm:p-6">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Make an Offer</h3>
                  <button
                    onClick={() => setShowMobileBidSection(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Offer Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      placeholder="Tell the seller why you're interested..."
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={handlePlaceBid}
                    disabled={placing || !bidAmount}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 text-lg"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Submitting...
                      </>
                    ) : (
                      "Submit Offer"
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                    <Shield size={14} className="text-green-500" />
                    Secure transaction protected by Auto Eden
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 sm:p-6 safe-area-bottom"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Share this vehicle</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-xl transition-colors"
                >
                  <Facebook size={20} className="text-blue-600" />
                  <span className="font-medium text-blue-700">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl transition-colors"
                >
                  <FaXTwitter size={20} className="text-gray-800" />
                  <span className="font-medium text-gray-800">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-xl transition-colors"
                >
                  <FaWhatsapp size={20} className="text-green-600" />
                  <span className="font-medium text-green-700">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl transition-colors"
                >
                  <Copy size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-700">Copy Link</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        open={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        vehicle={vehicle}
        vehicleId={vehicle?.id}
      />

      {/* Auth Modals */}
      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />

      {/* Image Preview */}
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
