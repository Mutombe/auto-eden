import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Award,
  TrendingUp,
  Clock,
  Gauge,
  MapPin,
  Tag,
  Fuel,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import ImageWithFallback from "../../utils/smartImage";

const VehicleCard = ({ vehicle, viewMode = "grid", onClick }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isOwner = isAuthenticated && user?.id === vehicle.owner?.id;
  const canBid = vehicle.listing_type === "marketplace" && isAuthenticated && !isOwner;

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${
        viewMode === "list" ? "flex flex-col sm:flex-row" : ""
      }`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image Section */}
      <div className={`relative overflow-hidden ${viewMode === "list" ? "sm:w-2/5 lg:w-1/3" : ""}`}>
        <div className={`relative ${viewMode === "list" ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[200px]" : "aspect-[4/3]"}`}>
          <ImageWithFallback
            src={vehicle.main_image}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Featured Badge */}
        {vehicle.featured && (
          <div className="absolute top-3 left-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-r-full shadow-md flex items-center text-xs font-semibold">
            <Award className="w-3.5 h-3.5 mr-1" />
            Featured
          </div>
        )}

        {/* Top Right Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${
            vehicle.listing_type === "instant_sale"
              ? "bg-emerald-500"
              : "bg-blue-600"
          }`}>
            {vehicle.listing_type === "instant_sale" ? "Buy Now" : "Auction"}
          </span>

          {vehicle.is_physically_verified && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Bid Count Badge */}
        {vehicle.bid_count > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            {vehicle.bid_count} {vehicle.bid_count === 1 ? 'bid' : 'bids'}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`p-4 flex flex-col ${viewMode === "list" ? "sm:w-3/5 lg:w-2/3 sm:p-5" : ""}`}>
        {/* Title & Year */}
        <div className="mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-500">
            {vehicle.year} • {vehicle.mileage?.toLocaleString() || "0"} km
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-600 mb-3 ${
          viewMode === "list" ? "sm:grid-cols-4" : ""
        }`}>
          <div className="flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{vehicle.body_type || "Sedan"}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{vehicle.location || "Auto Eden"}</span>
          </div>
          <div className="flex items-center">
            <Gauge className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{vehicle.transmission || "Auto"}</span>
          </div>
          <div className="flex items-center">
            <Fuel className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{vehicle.fuel_type || "Petrol"}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-red-600">
              ${vehicle.price?.toLocaleString()}
            </span>
            {vehicle.discount_price && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${vehicle.discount_price?.toLocaleString()}
              </span>
            )}
          </div>

          {canBid ? (
            <button
              onClick={onClick}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-1"
            >
              Place Bid
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="w-full sm:w-auto px-5 py-2.5 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-all text-center flex items-center justify-center gap-1 active:scale-[0.98]"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Posted Date */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Posted {new Date(vehicle.created_at).toLocaleDateString()}
          </div>
          {vehicle.ending_soon && (
            <div className="flex items-center text-red-500 font-medium">
              <span className="animate-pulse mr-1">●</span>
              Ending soon
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
