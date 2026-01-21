// src/components/dashboard/userDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchUserVehicles,
  deleteVehicle,
  createVehicle,
  updateVehicle,
} from "../../redux/slices/vehicleSlice";
import { fetchUserBids } from "../../redux/slices/bidSlice";
import { fetchUserSearches, deleteSearch } from "../../redux/slices/searchSlice";
import { logout } from "../../redux/slices/authSlice";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  Car,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Search,
  Clock,
  CheckCircle,
  Gavel,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  Menu,
  Fuel,
  Gauge,
  MapPin,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
  Check,
} from "lucide-react";

// Sidebar Navigation Item
const SidebarItem = ({ icon: Icon, label, active, onClick, badge, color, collapsed }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
      active
        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
        : "text-gray-600 hover:bg-gray-100"
    } ${collapsed ? "justify-center" : ""}`}
  >
    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-500 group-hover:text-red-600"}`} />
    {!collapsed && (
      <>
        <span className="font-medium truncate">{label}</span>
        {badge > 0 && (
          <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
            active ? "bg-white/20 text-white" : color || "bg-red-100 text-red-600"
          }`}>
            {badge}
          </span>
        )}
      </>
    )}
    {collapsed && badge > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const configs = {
    physical: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Verified" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending" },
    rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Rejected" },
    accepted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Accepted" },
    declined: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Declined" },
  };
  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-lg border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, onClick, loading }) => {
  const colors = {
    red: "from-red-500 to-red-600",
    green: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-100 shadow-sm ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${colors[color]} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="h-7 sm:h-8 lg:h-9 w-12 bg-gray-200 rounded animate-pulse mb-1" />
          ) : (
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
          )}
          <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Vehicle Card Skeleton for optimistic UI
const VehicleCardSkeleton = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-gray-200" />
    <div className="p-3 sm:p-4">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="flex gap-3">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

// Overview Item Skeleton for loading states
const OverviewItemSkeleton = () => (
  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl animate-pulse">
    <div className="w-12 h-9 sm:w-14 sm:h-10 lg:w-16 lg:h-12 rounded-md sm:rounded-lg bg-gray-200 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2" />
    </div>
    <div className="h-5 sm:h-6 w-16 bg-gray-200 rounded-lg" />
  </div>
);

// Vehicle Card Component
const VehicleCard = ({ vehicle, onView, onEdit, onDelete, isLoading }) => {
  const imageUrl = vehicle.images?.[0]?.image || vehicle.images?.[0] || "/placeholder-car.jpg";

  if (isLoading) {
    return <VehicleCardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={imageUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = "/placeholder-car.jpg"; }}
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <StatusBadge status={vehicle.verification_state} />
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-red-600 font-bold text-lg sm:text-xl mt-1">
          ${Number(vehicle.price || vehicle.proposed_price || 0).toLocaleString()}
        </p>
        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3 sm:w-4 sm:h-4" />
            {Number(vehicle.mileage || 0).toLocaleString()} km
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="w-3 h-3 sm:w-4 sm:h-4" />
            {vehicle.fuel_type || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
          <button
            onClick={() => onView(vehicle)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden xs:inline">View</span>
          </button>
          <button
            onClick={() => onEdit(vehicle)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden xs:inline">Edit</span>
          </button>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden xs:inline">Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Bid Card Component
const BidCard = ({ bid }) => {
  const vehicle = bid.vehicle_details || bid.vehicle || {};
  const imageUrl = vehicle.images?.[0]?.image || "/placeholder-car.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="w-16 h-12 sm:w-20 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">{vehicle.year}</p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 flex-wrap">
            <p className="text-red-600 font-bold text-sm sm:text-base">${Number(bid.amount || 0).toLocaleString()}</p>
            <StatusBadge status={bid.status} />
          </div>
        </div>
      </div>
      {bid.message && (
        <p className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-600 line-clamp-2">
          {bid.message}
        </p>
      )}
    </motion.div>
  );
};

// Search Card Component
const SearchCard = ({ search, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start justify-between gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{search.name || "Saved Search"}</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
          {search.make && (
            <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-md sm:rounded-lg text-xs">{search.make}</span>
          )}
          {search.model && (
            <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-md sm:rounded-lg text-xs">{search.model}</span>
          )}
          {search.min_price && (
            <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-md sm:rounded-lg text-xs">
              From ${Number(search.min_price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(search.id)}
        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// Vehicle Details Modal
const VehicleDetailsModal = ({ vehicle, isOpen, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    setCurrentImage(0);
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const images = vehicle.images || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col lg:flex-row h-full max-h-[95vh] sm:max-h-[90vh]">
            {/* Image Section */}
            <div className="lg:w-1/2 relative bg-gray-900">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
                <img
                  src={images[currentImage]?.image || images[currentImage] || "/placeholder-car.jpg"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {images.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                        idx === currentImage ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="lg:w-1/2 flex flex-col max-h-[50vh] lg:max-h-none overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                <div className="flex items-center gap-2 sm:gap-3 mt-2">
                  <StatusBadge status={vehicle.verification_state} />
                </div>
              </div>

              <div className="p-4 sm:p-6 flex-1">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-4 sm:mb-6">
                  ${Number(vehicle.price || vehicle.proposed_price || 0).toLocaleString()}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                  <div className="p-2.5 sm:p-3 lg:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                      <Gauge className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs">Mileage</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">{Number(vehicle.mileage || 0).toLocaleString()} km</p>
                  </div>
                  <div className="p-2.5 sm:p-3 lg:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                      <Fuel className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs">Fuel Type</span>
                    </div>
                    <p className="font-semibold text-gray-900 capitalize text-xs sm:text-sm lg:text-base">{vehicle.fuel_type || "N/A"}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 lg:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs">Transmission</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">{vehicle.transmission || "N/A"}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 lg:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs">Location</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate">{vehicle.location || "N/A"}</p>
                  </div>
                </div>

                {vehicle.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Description</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{vehicle.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-10 sm:py-12 lg:py-16 text-center px-4"
  >
    <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6">
      <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
    </div>
    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{title}</h3>
    <p className="text-gray-500 max-w-sm text-xs sm:text-sm lg:text-base">{description}</p>
    {action && <div className="mt-4 sm:mt-6">{action}</div>}
  </motion.div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-6 sm:mt-8">
      <div className="inline-flex items-center gap-2 sm:gap-3 bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-2 sm:p-3 shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium text-gray-700">
          <span className="text-red-600">{currentPage}</span> / {totalPages}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

// Add Vehicle Modal Component (User version - submits for review)
const AddVehicleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    price: "",
    mileage: "",
    fuel_type: "petrol",
    transmission: "automatic",
    body_type: "sedan",
    location: "",
    description: "",
    listing_type: "marketplace",
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      images.forEach((image) => {
        submitData.append("images", image);
      });

      await onSubmit(submitData);

      // Reset form
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: "",
        price: "",
        mileage: "",
        fuel_type: "petrol",
        transmission: "automatic",
        body_type: "sedan",
        location: "",
        description: "",
        listing_type: "marketplace",
      });
      setImages([]);
      setImagePreview([]);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sell Your Vehicle</h3>
                  <p className="text-sm text-gray-500">Fill in your vehicle details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Make *</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      placeholder="e.g., Toyota"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="e.g., Corolla"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">VIN *</label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      placeholder="17-character VIN"
                      maxLength={17}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing & Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price (USD) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mileage (km)</label>
                    <input
                      type="text"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      placeholder="e.g., 50000"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fuel Type</label>
                    <select
                      name="fuel_type"
                      value={formData.fuel_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Transmission</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Body Type</label>
                    <select
                      name="body_type"
                      value={formData.body_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="coupe">Coupe</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="wagon">Wagon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, State"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your vehicle condition, features, history..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Vehicle Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="user-vehicle-images"
                  />
                  <label
                    htmlFor="user-vehicle-images"
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload images</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                  </label>
                </div>
                {imagePreview.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Your vehicle will be submitted for admin review. Once verified, it will appear in the marketplace.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.make || !formData.model || !formData.vin || !formData.price}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                loading || !formData.make || !formData.model || !formData.vin || !formData.price
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Edit Vehicle Modal Component
const EditVehicleModal = ({ isOpen, onClose, onSubmit, vehicle }) => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    price: "",
    mileage: "",
    fuel_type: "petrol",
    transmission: "automatic",
    body_type: "sedan",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || "",
        price: vehicle.price || vehicle.proposed_price || "",
        mileage: vehicle.mileage || "",
        fuel_type: vehicle.fuel_type || "petrol",
        transmission: vehicle.transmission || "automatic",
        body_type: vehicle.body_type || "sedan",
        location: vehicle.location || "",
        description: vehicle.description || "",
      });
    }
  }, [vehicle]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSubmit(vehicle.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Vehicle</h3>
                  <p className="text-sm text-gray-500">Update your vehicle details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Make *</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">VIN</label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing & Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price (USD) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mileage (km)</label>
                    <input
                      type="text"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fuel Type</label>
                    <select
                      name="fuel_type"
                      value={formData.fuel_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Transmission</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Body Type</label>
                    <select
                      name="body_type"
                      value={formData.body_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="coupe">Coupe</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="wagon">Wagon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.make || !formData.model || !formData.price}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                loading || !formData.make || !formData.model || !formData.price
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Loading Skeleton
const CardSkeleton = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-gray-200" />
    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

// Main User Dashboard Component
export default function UserDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userVehicles: userVehiclesData, userVehiclesLoading } = useSelector((state) => state.vehicles);
  const { items: bidsData, loading: bidLoading } = useSelector((state) => state.bids);
  const { items: searchesData, loading: searchLoading } = useSelector((state) => state.searches);

  // Handle both array and paginated response formats
  const userVehicles = Array.isArray(userVehiclesData) ? userVehiclesData : (userVehiclesData?.results || []);
  const bids = Array.isArray(bidsData) ? bidsData : (bidsData?.results || []);
  const searches = Array.isArray(searchesData) ? searchesData : (searchesData?.results || []);

  const { sidebarCollapsed, setSidebarCollapsed, setIsDashboardPage } = useSidebar();

  const [activeSection, setActiveSection] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [editVehicleModal, setEditVehicleModal] = useState({ open: false, vehicle: null });

  // Optimistic UI - track loading items by ID
  const [loadingVehicles, setLoadingVehicles] = useState(new Set());
  const [newVehicleLoading, setNewVehicleLoading] = useState(false);

  const ITEMS_PER_PAGE = 6;

  // Mark as dashboard page for navbar awareness
  useEffect(() => {
    setIsDashboardPage(true);
    return () => setIsDashboardPage(false);
  }, [setIsDashboardPage]);

  useEffect(() => {
    dispatch(fetchUserVehicles());
    dispatch(fetchUserBids());
    dispatch(fetchUserSearches());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Pagination
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return userVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [userVehicles, currentPage]);

  const paginatedBids = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return bids.slice(start, start + ITEMS_PER_PAGE);
  }, [bids, currentPage]);

  const paginatedSearches = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return searches.slice(start, start + ITEMS_PER_PAGE);
  }, [searches, currentPage]);

  // Handle delete vehicle - Optimistic UI
  const handleDeleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setLoadingVehicles(prev => new Set(prev).add(id));
      try {
        await dispatch(deleteVehicle(id));
        await dispatch(fetchUserVehicles());
      } finally {
        setLoadingVehicles(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleDeleteSearch = async (id) => {
    if (window.confirm("Delete this saved search?")) {
      await dispatch(deleteSearch(id));
      dispatch(fetchUserSearches());
    }
  };

  // Handle create vehicle - Optimistic UI
  const handleCreateVehicle = async (formData) => {
    setAddVehicleModal(false);
    setNewVehicleLoading(true);
    try {
      const result = await dispatch(createVehicle(formData)).unwrap();
      await dispatch(fetchUserVehicles());
      return result;
    } finally {
      setNewVehicleLoading(false);
    }
  };

  // Open edit vehicle modal
  const openEditVehicleModal = (vehicle) => {
    setEditVehicleModal({ open: true, vehicle });
  };

  // Handle edit vehicle - Optimistic UI
  const handleEditVehicle = async (vehicleId, data) => {
    setEditVehicleModal({ open: false, vehicle: null });
    setLoadingVehicles(prev => new Set(prev).add(vehicleId));
    try {
      await dispatch(updateVehicle({ id: vehicleId, data })).unwrap();
      await dispatch(fetchUserVehicles());
    } catch (err) {
      console.error("Edit error:", err);
      throw err;
    } finally {
      setLoadingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  // Stats
  const pendingCount = userVehicles.filter((v) => v.verification_state === "pending").length;
  const verifiedCount = userVehicles.filter((v) => v.verification_state === "physical").length;
  const activeBids = bids.filter((b) => b.status === "pending").length;

  const sidebarItems = [
    { id: "overview", icon: Home, label: "Overview", badge: 0 },
    { id: "vehicles", icon: Car, label: "My Vehicles", badge: userVehicles.length, color: "bg-blue-100 text-blue-600" },
    { id: "bids", icon: Gavel, label: "My Bids", badge: activeBids, color: "bg-purple-100 text-purple-600" },
    { id: "searches", icon: Heart, label: "Saved Searches", badge: searches.length, color: "bg-pink-100 text-pink-600" },
  ];

  const sidebarWidth = sidebarCollapsed ? "lg:w-20" : "lg:w-64 xl:w-72";
  const contentMargin = sidebarCollapsed ? "lg:ml-20" : "lg:ml-64 xl:ml-72";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Header Area - accounts for transparent navbar */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 pt-16 sm:pt-20 pb-6 sm:pb-8 lg:pb-12">
        <div className={`transition-all duration-300 ${contentMargin}`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                  Welcome back, {user?.username || "User"}
                </h1>
                <p className="text-gray-400 mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base">Manage your vehicles and track your activity</p>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 sm:p-2.5 bg-white/10 text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-all duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${sidebarWidth}
          w-64 sm:w-72
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Collapse Toggle */}
          <div className={`h-14 sm:h-16 lg:h-20 flex items-center px-3 sm:px-4 border-b border-gray-100 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!sidebarCollapsed && (
              <Link to="/" className="flex-shrink-0">
                <img src="/Auto-Eden-black-logo.png" alt="Auto Eden" className="h-7 sm:h-8 lg:h-10" />
              </Link>
            )}
            <div className={`flex items-center gap-1 sm:gap-2 ${sidebarCollapsed ? "" : ""}`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <PanelLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 sm:p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg flex-shrink-0">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user?.username || "User"}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed User Avatar */}
          {sidebarCollapsed && (
            <div className="p-3 border-b border-gray-100 flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-2 sm:p-3 lg:p-4 space-y-1 overflow-y-auto">
            {!sidebarCollapsed && (
              <p className="px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Dashboard
              </p>
            )}
            {sidebarItems.map((item) => (
              <div key={item.id} className="relative">
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  active={activeSection === item.id}
                  badge={item.badge}
                  color={item.color}
                  collapsed={sidebarCollapsed}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                />
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-2 sm:p-3 lg:p-4 border-t border-gray-100 space-y-1">
            <Link
              to="/profile"
              className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:py-3 text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
              title={sidebarCollapsed ? "Settings" : undefined}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm sm:text-base">Settings</span>}
            </Link>
            <button
              onClick={() => dispatch(logout())}
              className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm sm:text-base">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${contentMargin}`}>
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {activeSection === "overview" && "Overview"}
                {activeSection === "vehicles" && "My Vehicles"}
                {activeSection === "bids" && "My Bids"}
                {activeSection === "searches" && "Saved Searches"}
              </h2>
              <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                {activeSection === "overview" && "Your dashboard at a glance"}
                {activeSection === "vehicles" && `${userVehicles.length} vehicles listed`}
                {activeSection === "bids" && `${bids.length} bids placed`}
                {activeSection === "searches" && `${searches.length} saved searches`}
              </p>
            </div>
            {activeSection === "vehicles" && (
              <button
                onClick={() => setAddVehicleModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-red-700 transition-colors text-xs sm:text-sm lg:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Vehicle
              </button>
            )}
          </div>

          {/* Overview Section */}
          {activeSection === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              {/* Quick Action - Add Vehicle */}
              <button
                onClick={() => setAddVehicleModal(true)}
                className="block w-full p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-xl sm:rounded-2xl text-white hover:from-red-700 hover:to-red-800 transition-all group shadow-lg shadow-red-600/20 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">Sell Your Vehicle</h3>
                    <p className="text-red-100 text-sm mt-1">List your vehicle and start receiving bids today</p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                </div>
              </button>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
                <StatCard
                  icon={Car}
                  label="Total Vehicles"
                  value={userVehicles.length}
                  color="blue"
                  onClick={() => setActiveSection("vehicles")}
                  loading={userVehiclesLoading}
                />
                <StatCard
                  icon={Clock}
                  label="Pending Review"
                  value={pendingCount}
                  color="amber"
                  loading={userVehiclesLoading}
                />
                <StatCard
                  icon={CheckCircle}
                  label="Verified"
                  value={verifiedCount}
                  color="green"
                  loading={userVehiclesLoading}
                />
                <StatCard
                  icon={Gavel}
                  label="Active Bids"
                  value={activeBids}
                  color="purple"
                  onClick={() => setActiveSection("bids")}
                  loading={bidLoading}
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {/* Recent Vehicles */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Recent Vehicles</h3>
                    <button
                      onClick={() => setActiveSection("vehicles")}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  {userVehiclesLoading ? (
                    <div className="space-y-2 sm:space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <OverviewItemSkeleton key={i} />
                      ))}
                    </div>
                  ) : userVehicles.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 sm:py-8 text-xs sm:text-sm">No vehicles yet</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {userVehicles.slice(0, 3).map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <div className="w-12 h-9 sm:w-14 sm:h-10 lg:w-16 lg:h-12 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={vehicle.images?.[0]?.image || "/placeholder-car.jpg"}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base truncate">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              ${Number(vehicle.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <StatusBadge status={vehicle.verification_state} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Bids */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Recent Bids</h3>
                    <button
                      onClick={() => setActiveSection("bids")}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  {bidLoading ? (
                    <div className="space-y-2 sm:space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <OverviewItemSkeleton key={i} />
                      ))}
                    </div>
                  ) : bids.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 sm:py-8 text-xs sm:text-sm">No bids yet</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {bids.slice(0, 3).map((bid) => {
                        const vehicle = bid.vehicle_details || bid.vehicle || {};
                        return (
                          <div
                            key={bid.id}
                            className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-12 h-9 sm:w-14 sm:h-10 lg:w-16 lg:h-12 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={vehicle.images?.[0]?.image || "/placeholder-car.jpg"}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base truncate">
                                {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-xs sm:text-sm text-red-600 font-semibold">
                                ${Number(bid.amount || 0).toLocaleString()}
                              </p>
                            </div>
                            <StatusBadge status={bid.status} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Vehicles Section */}
          {activeSection === "vehicles" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {userVehiclesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : userVehicles.length === 0 ? (
                <EmptyState
                  icon={Car}
                  title="No vehicles yet"
                  description="Start selling by listing your first vehicle"
                  action={
                    <button
                      onClick={() => setAddVehicleModal(true)}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Your First Vehicle
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {/* Show skeleton when adding new vehicle */}
                    {newVehicleLoading && currentPage === 1 && <VehicleCardSkeleton />}
                    {paginatedVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onView={setSelectedVehicle}
                        onEdit={openEditVehicleModal}
                        onDelete={handleDeleteVehicle}
                        isLoading={loadingVehicles.has(vehicle.id)}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(userVehicles.length / ITEMS_PER_PAGE)}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* Bids Section */}
          {activeSection === "bids" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {bidLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 animate-pulse">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-16 h-12 sm:w-20 sm:h-16 bg-gray-200 rounded-lg sm:rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bids.length === 0 ? (
                <EmptyState
                  icon={Gavel}
                  title="No bids yet"
                  description="Browse the marketplace and place bids on vehicles you're interested in"
                  action={
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      Browse Marketplace
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {paginatedBids.map((bid) => (
                      <BidCard key={bid.id} bid={bid} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(bids.length / ITEMS_PER_PAGE)}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* Saved Searches Section */}
          {activeSection === "searches" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {searchLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 animate-pulse">
                      <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2 mb-2 sm:mb-3" />
                      <div className="flex gap-2">
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-16" />
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searches.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No saved searches"
                  description="Save your search criteria to get notified when matching vehicles are listed"
                  action={
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      Search Vehicles
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {paginatedSearches.map((search) => (
                      <SearchCard key={search.id} search={search} onDelete={handleDeleteSearch} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(searches.length / ITEMS_PER_PAGE)}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        vehicle={selectedVehicle}
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={addVehicleModal}
        onClose={() => setAddVehicleModal(false)}
        onSubmit={handleCreateVehicle}
      />

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        isOpen={editVehicleModal.open}
        onClose={() => setEditVehicleModal({ open: false, vehicle: null })}
        onSubmit={handleEditVehicle}
        vehicle={editVehicleModal.vehicle}
      />
    </div>
  );
}
