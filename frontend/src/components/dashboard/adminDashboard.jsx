// src/components/dashboard/adminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  deleteVehicle,
  fetchPendingReview,
  updateVehicleStatus,
  fetchAllVehicles,
  createVehicle,
  updateVehicle,
  toggleVisibility,
} from "../../redux/slices/vehicleSlice";
import { fetchBids, deleteBid } from "../../redux/slices/bidSlice";
import { fetchMarketplaceStats } from "../../redux/slices/analyticsSlice";
import { logout } from "../../redux/slices/authSlice";
import { useSidebar } from "../../contexts/SidebarContext";
import {
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Search,
  Trash2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Shield,
  Gavel,
  RefreshCw,
  Settings,
  Home,
  Menu,
  LogOut,
  Fuel,
  Gauge,
  MapPin,
  FileText,
  PanelLeftClose,
  PanelLeft,
  Plus,
  AlertTriangle,
  Edit3,
  Share2,
  Mail,
  Download,
  CheckSquare,
  Square,
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
    physical: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Physically Verified" },
    digital: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Digitally Verified" },
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

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor, icon: Icon }) => {
  if (!isOpen) return null;

  const colorClasses = {
    red: "bg-red-600 hover:bg-red-700",
    green: "bg-emerald-600 hover:bg-emerald-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {Icon && (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  confirmColor === "red" ? "bg-red-100 text-red-600" :
                  confirmColor === "green" ? "bg-emerald-100 text-emerald-600" :
                  "bg-blue-100 text-blue-600"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
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
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors ${colorClasses[confirmColor] || colorClasses.blue}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Verification Modal Component
const VerificationModal = ({ isOpen, onClose, onVerify, vehicle }) => {
  const [selectedType, setSelectedType] = useState(null);

  if (!isOpen || !vehicle) return null;

  const handleVerify = () => {
    if (selectedType) {
      onVerify(vehicle.id, selectedType);
      setSelectedType(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Verify Vehicle</h3>
                <p className="text-sm text-gray-500">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Select the verification type for this vehicle:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedType("digital")}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === "digital"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedType === "digital" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Digital Verification</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Documents and details verified online
                    </p>
                  </div>
                  {selectedType === "digital" && (
                    <Check className="w-5 h-5 text-blue-500 ml-auto" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedType("physical")}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === "physical"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedType === "physical" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Physical Verification</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Vehicle physically inspected and verified
                    </p>
                  </div>
                  {selectedType === "physical" && (
                    <Check className="w-5 h-5 text-emerald-500 ml-auto" />
                  )}
                </div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => {
                setSelectedType(null);
                onClose();
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={!selectedType}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors ${
                selectedType
                  ? selectedType === "digital"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Verify Vehicle
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Add Vehicle Modal Component (Admin version with verification)
const AddVehicleModal = ({ isOpen, onClose, onSubmit, isAdmin = false }) => {
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
  const [verificationType, setVerificationType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    // Create preview URLs
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
        submitData.append("image_files", image);
      });

      // For admin, include verification type
      if (isAdmin && verificationType) {
        submitData.append("verification_state", verificationType);
      }

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
      setVerificationType(null);
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
                  <h3 className="text-lg font-bold text-gray-900">Add New Vehicle</h3>
                  <p className="text-sm text-gray-500">Fill in the vehicle details below</p>
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
                  placeholder="Describe the vehicle condition, features, history..."
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
                    id="vehicle-images"
                  />
                  <label
                    htmlFor="vehicle-images"
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

              {/* Admin Verification Section */}
              {isAdmin && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Verification (Admin Only)</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Optionally verify this vehicle upon creation
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setVerificationType(null)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        verificationType === null
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Clock className={`w-5 h-5 mx-auto mb-1 ${verificationType === null ? "text-amber-600" : "text-gray-400"}`} />
                      <span className={`text-xs font-medium ${verificationType === null ? "text-amber-700" : "text-gray-600"}`}>
                        Pending
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationType("digital")}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        verificationType === "digital"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Shield className={`w-5 h-5 mx-auto mb-1 ${verificationType === "digital" ? "text-blue-600" : "text-gray-400"}`} />
                      <span className={`text-xs font-medium ${verificationType === "digital" ? "text-blue-700" : "text-gray-600"}`}>
                        Digital
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationType("physical")}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        verificationType === "physical"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Car className={`w-5 h-5 mx-auto mb-1 ${verificationType === "physical" ? "text-emerald-600" : "text-gray-400"}`} />
                      <span className={`text-xs font-medium ${verificationType === "physical" ? "text-emerald-700" : "text-gray-600"}`}>
                        Physical
                      </span>
                    </button>
                  </div>
                </div>
              )}
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {isAdmin ? "Create & Verify" : "Submit for Review"}
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
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Populate form when vehicle changes
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
      // Load existing images
      const imgs = (vehicle.images || []).map((img) =>
        typeof img === "string" ? img : img?.image
      ).filter(Boolean);
      setExistingImages(imgs);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    }
  }, [vehicle]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImageFiles((prev) => [...prev, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previews]);
    }
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use FormData so we can include image files
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== "" && val !== null && val !== undefined) {
          fd.append(key, val);
        }
      });
      // Append new image files
      newImageFiles.forEach((file) => {
        fd.append("image_files", file);
      });

      await onSubmit(vehicle.id, fd);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (!isOpen || !vehicle) return null;

  const totalImages = existingImages.length + newImageFiles.length;

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
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Vehicle</h3>
                  <p className="text-sm text-gray-500">Update vehicle details and images</p>
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
              {/* Vehicle Images */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Vehicle Images ({totalImages})
                </h4>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-200" style={{ aspectRatio: "4/3" }}>
                        <img
                          src={url}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "/placeholder-car.jpg"; }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Image Previews */}
                {newImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {newImagePreviews.map((url, index) => (
                      <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden border-2 border-amber-300" style={{ aspectRatio: "4/3" }}>
                        <img
                          src={url}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-medium rounded">
                          NEW
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                  <Plus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Add Images</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

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

              {/* Description */}
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

// Row Skeleton for optimistic UI
const RowSkeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="py-3 sm:py-4 px-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="w-12 h-9 sm:w-16 sm:h-12 rounded-md sm:rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4 hidden sm:table-cell">
      <div className="h-4 bg-gray-200 rounded w-20" />
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4 hidden md:table-cell">
      <div className="h-4 bg-gray-200 rounded w-24" />
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4">
      <div className="h-6 bg-gray-200 rounded-lg w-20" />
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4">
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
      </div>
    </td>
  </tr>
);

// Card Skeleton for optimistic UI (Mobile)
const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
    <div className="flex gap-3">
      <div className="w-20 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
        <div className="h-5 bg-gray-200 rounded-lg w-20" />
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
      <div className="h-3 bg-gray-200 rounded w-20" />
      <div className="flex items-center gap-1">
        <div className="w-7 h-7 bg-gray-200 rounded-lg" />
        <div className="w-7 h-7 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, trend, loading }) => {
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
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${colors[color]} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-600">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            {trend}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 sm:mt-4 h-7 sm:h-8 lg:h-9 w-16 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="mt-3 sm:mt-4 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
      )}
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
    </motion.div>
  );
};

// Overview Item Skeleton (for pending/recent lists)
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

// Vehicle Table Row (Desktop)
const VehicleRow = ({ vehicle, onView, onEdit, onVerify, onReject, onDelete, onToggleVisibility, isLoading, selectMode, isSelected, onToggleSelect }) => {
  const imageUrl = vehicle.images?.[0]?.image || vehicle.images?.[0] || "/placeholder-car.jpg";
  const isVisible = vehicle.is_visible !== false; // Default to visible if not set

  // Show skeleton if this specific item is loading
  if (isLoading) {
    return <RowSkeleton />;
  }

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!isVisible ? 'opacity-60' : ''} ${isSelected ? 'bg-red-50' : ''}`}
      onClick={selectMode ? () => onToggleSelect(vehicle.id) : undefined}
    >
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {selectMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(vehicle.id);
              }}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-gray-300 hover:border-red-400'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </button>
          )}
          <div className="w-12 h-9 sm:w-16 sm:h-12 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "/placeholder-car.jpg"; }}
            />
            {!isVisible && (
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                <EyeOff className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {vehicle.owner_details?.username || "Unknown Owner"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4 hidden sm:table-cell">
        <p className="font-semibold text-gray-900 text-sm">
          ${Number(vehicle.price || vehicle.proposed_price || 0).toLocaleString()}
        </p>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4 hidden md:table-cell">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          {Number(vehicle.mileage || 0).toLocaleString()} km
        </div>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <StatusBadge status={vehicle.verification_state} />
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(vehicle)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(vehicle)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleVisibility(vehicle.id)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isVisible
                ? 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
            }`}
            title={isVisible ? "Hide from marketplace" : "Show in marketplace"}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {vehicle.verification_state === "pending" && (
            <>
              <button
                onClick={() => onVerify(vehicle)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Verify"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(vehicle.id)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(vehicle.id)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// Vehicle Card (Mobile)
const VehicleCard = ({ vehicle, onView, onEdit, onVerify, onReject, onDelete, onToggleVisibility, isLoading, selectMode, isSelected, onToggleSelect }) => {
  const imageUrl = vehicle.images?.[0]?.image || vehicle.images?.[0] || "/placeholder-car.jpg";
  const isVisible = vehicle.is_visible !== false; // Default to visible if not set

  // Show skeleton if this specific item is loading
  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={selectMode ? () => onToggleSelect(vehicle.id) : undefined}
      className={`bg-white rounded-xl border p-3 hover:shadow-md transition-shadow cursor-pointer ${!isVisible ? 'opacity-60' : ''} ${isSelected ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}
    >
      <div className="flex gap-3">
        {selectMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(vehicle.id);
            }}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors self-center ${
              isSelected
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-gray-300 hover:border-red-400'
            }`}
          >
            {isSelected && <Check className="w-3 h-3" />}
          </button>
        )}
        <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "/placeholder-car.jpg"; }}
          />
          {!isVisible && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
          <p className="text-red-600 font-bold text-sm">
            ${Number(vehicle.price || vehicle.proposed_price || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={vehicle.verification_state} />
            {!isVisible && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                Hidden
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate flex-1">
          {vehicle.owner_details?.username || "Unknown Owner"}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(vehicle)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(vehicle)}
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleVisibility(vehicle.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isVisible
                ? 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
            }`}
            title={isVisible ? "Hide" : "Show"}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {vehicle.verification_state === "pending" && (
            <>
              <button
                onClick={() => onVerify(vehicle)}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(vehicle.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(vehicle.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Bid Row Skeleton
const BidRowSkeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="py-3 sm:py-4 px-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-8 sm:w-12 sm:h-10 rounded-md sm:rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
          <div className="h-2 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4 hidden sm:table-cell">
      <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
      <div className="h-2 bg-gray-200 rounded w-24" />
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4">
      <div className="h-4 bg-gray-200 rounded w-16" />
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4 hidden md:table-cell">
      <div className="h-6 bg-gray-200 rounded-lg w-16" />
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4 hidden lg:table-cell">
      <div className="h-3 bg-gray-200 rounded w-20" />
    </td>
    <td className="py-3 sm:py-4 px-3 sm:px-4">
      <div className="w-8 h-8 bg-gray-200 rounded-lg" />
    </td>
  </tr>
);

// Bid Card Skeleton (Mobile)
const BidCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
    <div className="flex gap-3">
      <div className="w-16 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-14" />
      </div>
      <div className="w-7 h-7 bg-gray-200 rounded-lg flex-shrink-0" />
    </div>
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
      <div className="h-3 bg-gray-200 rounded w-16" />
      <div className="h-5 bg-gray-200 rounded-lg w-16" />
    </div>
  </div>
);

// Bid Table Row
const BidRow = ({ bid, onDelete, isLoading }) => {
  const vehicle = bid.vehicle_details || bid.vehicle || {};
  const bidder = bid.bidder_details || bid.bidder || {};

  if (isLoading) {
    return <BidRowSkeleton />;
  }

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-8 sm:w-12 sm:h-10 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={vehicle.images?.[0]?.image || "/placeholder-car.jpg"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-xs text-gray-500">{vehicle.year}</p>
          </div>
        </div>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4 hidden sm:table-cell">
        <p className="font-medium text-gray-900 text-sm truncate">{bidder.username || "Anonymous"}</p>
        <p className="text-xs text-gray-500 truncate">{bidder.email}</p>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <p className="font-semibold text-red-600 text-sm">${Number(bid.amount || 0).toLocaleString()}</p>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4 hidden md:table-cell">
        <StatusBadge status={bid.status} />
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4 hidden lg:table-cell">
        <p className="text-xs sm:text-sm text-gray-500">
          {new Date(bid.created_at).toLocaleDateString()}
        </p>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <button
          onClick={() => onDelete(bid.id)}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  );
};

// Bid Card (Mobile)
const BidCard = ({ bid, onDelete, isLoading }) => {
  const vehicle = bid.vehicle_details || bid.vehicle || {};
  const bidder = bid.bidder_details || bid.bidder || {};

  if (isLoading) {
    return <BidCardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 p-3"
    >
      <div className="flex gap-3">
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={vehicle.images?.[0]?.image || "/placeholder-car.jpg"}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-red-600 font-bold text-sm">${Number(bid.amount || 0).toLocaleString()}</p>
        </div>
        <button
          onClick={() => onDelete(bid.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate">{bidder.username || "Anonymous"}</p>
        <StatusBadge status={bid.status} />
      </div>
    </motion.div>
  );
};

// Vehicle Details Modal
const VehicleDetailsModal = ({ vehicle, isOpen, onClose, onVerify, onReject }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [dividerPosition, setDividerPosition] = useState(50); // Percentage (50% = middle)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);

  // Handle mouse/touch drag for the curtain divider
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrag = React.useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 20), 80); // Limit between 20% and 80%
    setDividerPosition(percentage);
  }, [isDragging]);

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse/touch events for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

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
          className="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile: Stack vertically, Desktop: Side by side with draggable divider */}
          <div className="flex flex-col lg:hidden h-full max-h-[95vh]">
            {/* Mobile Image Section */}
            <div className="relative bg-gray-900">
              <div className="aspect-[4/3]">
                <img
                  src={images[currentImage]?.image || images[currentImage] || "/placeholder-car.jpg"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImage ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Mobile Details Section */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StatusBadge status={vehicle.verification_state} />
                  <span className="text-xs text-gray-500">
                    by {vehicle.owner_details?.username || vehicle.owner?.username || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1">
                <p className="text-xl font-bold text-red-600 mb-4">
                  ${Number(vehicle.price || vehicle.proposed_price || 0).toLocaleString()}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                      <Gauge className="w-3 h-3" />
                      <span className="text-xs">Mileage</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs">{Number(vehicle.mileage || 0).toLocaleString()} km</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                      <Fuel className="w-3 h-3" />
                      <span className="text-xs">Fuel</span>
                    </div>
                    <p className="font-semibold text-gray-900 capitalize text-xs">{vehicle.fuel_type || "N/A"}</p>
                  </div>
                </div>
                {vehicle.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">Description</h3>
                    <p className="text-gray-600 text-xs">{vehicle.description}</p>
                  </div>
                )}
              </div>
              {vehicle.verification_state === "pending" && (
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => onReject(vehicle.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => onVerify(vehicle)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verify
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Side by side with draggable curtain */}
          <div
            ref={containerRef}
            className="hidden lg:flex h-[80vh] relative select-none"
            style={{ cursor: isDragging ? 'col-resize' : 'default' }}
          >
            {/* Image Section */}
            <div
              className="relative bg-gray-900 overflow-hidden"
              style={{ width: `${dividerPosition}%` }}
            >
              <div className="absolute inset-0">
                <img
                  src={images[currentImage]?.image || images[currentImage] || "/placeholder-car.jpg"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              {images.length > 1 && (
                <>
                  {/* Image navigation arrows */}
                  <button
                    onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {/* Image dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          idx === currentImage ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Image counter */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-lg">
                    {currentImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Draggable Divider/Curtain */}
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="absolute top-0 bottom-0 w-4 -ml-2 cursor-col-resize z-20 group flex items-center justify-center"
              style={{ left: `${dividerPosition}%` }}
            >
              {/* Visible handle */}
              <div className="w-1 h-full bg-gray-300 group-hover:bg-red-500 transition-colors relative">
                {/* Grip indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-16 bg-white rounded-full shadow-lg border border-gray-200 flex flex-col items-center justify-center gap-1 group-hover:border-red-500 transition-colors">
                  <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-red-500"></div>
                  <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-red-500"></div>
                  <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-red-500"></div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div
              className="flex flex-col overflow-hidden bg-white"
              style={{ width: `${100 - dividerPosition}%` }}
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <StatusBadge status={vehicle.verification_state} />
                  <span className="text-sm text-gray-500">
                    by {vehicle.owner_details?.username || vehicle.owner?.username || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <p className="text-3xl font-bold text-red-600 mb-6">
                  ${Number(vehicle.price || vehicle.proposed_price || 0).toLocaleString()}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Gauge className="w-4 h-4" />
                      <span className="text-xs">Mileage</span>
                    </div>
                    <p className="font-semibold text-gray-900">{Number(vehicle.mileage || 0).toLocaleString()} km</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Fuel className="w-4 h-4" />
                      <span className="text-xs">Fuel Type</span>
                    </div>
                    <p className="font-semibold text-gray-900 capitalize">{vehicle.fuel_type || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Settings className="w-4 h-4" />
                      <span className="text-xs">Transmission</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.transmission || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">VIN</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm truncate">{vehicle.vin || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Car className="w-4 h-4" />
                      <span className="text-xs">Body Type</span>
                    </div>
                    <p className="font-semibold text-gray-900 capitalize">{vehicle.body_type || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">Location</span>
                    </div>
                    <p className="font-semibold text-gray-900">{vehicle.location || "N/A"}</p>
                  </div>
                </div>

                {vehicle.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description}</p>
                  </div>
                )}

                {/* Owner Info */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Owner Details</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="text-gray-500">Username:</span> {vehicle.owner_details?.username || vehicle.owner?.username || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">Email:</span> {vehicle.owner_details?.email || vehicle.owner?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {vehicle.verification_state === "pending" && (
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => onReject(vehicle.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => onVerify(vehicle)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
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
  </motion.div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t border-gray-100">
      {/* Item count */}
      <div className="text-xs sm:text-sm text-gray-500">
        {totalItems === 0 ? (
          "No items"
        ) : (
          <>
            Showing <span className="font-medium text-gray-700">{startItem}</span> to{" "}
            <span className="font-medium text-gray-700">{endItem}</span> of{" "}
            <span className="font-medium text-gray-700">{totalItems}</span> items
          </>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="inline-flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 p-2 sm:p-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium text-gray-700">
            <span className="text-red-600">{currentPage}</span> / {totalPages}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Loading Skeleton
const TableSkeleton = () => (
  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
        <div className="w-12 h-9 sm:w-16 sm:h-12 bg-gray-200 rounded-md sm:rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-lg" />
      </div>
    ))}
  </div>
);

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { allVehicles: allVehiclesData, pendingReview: pendingReviewData, loading } = useSelector((state) => state.vehicles);
  const { allBids: bidsData, loading: bidsLoading } = useSelector((state) => state.bids);

  // Handle both array and paginated response formats
  const allVehicles = Array.isArray(allVehiclesData) ? allVehiclesData : (allVehiclesData?.results || []);
  const pendingReview = Array.isArray(pendingReviewData) ? pendingReviewData : (pendingReviewData?.results || []);
  const bids = Array.isArray(bidsData) ? bidsData : (bidsData?.results || []);

  const { sidebarCollapsed, setSidebarCollapsed, setIsDashboardPage } = useSidebar();

  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [verifyModal, setVerifyModal] = useState({ open: false, vehicle: null });
  const [rejectModal, setRejectModal] = useState({ open: false, vehicleId: null });
  const [deleteVehicleModal, setDeleteVehicleModal] = useState({ open: false, vehicleId: null });
  const [deleteBidModal, setDeleteBidModal] = useState({ open: false, bidId: null });
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [editVehicleModal, setEditVehicleModal] = useState({ open: false, vehicle: null });

  // Optimistic UI - track loading items by ID
  const [loadingVehicles, setLoadingVehicles] = useState(new Set());
  const [loadingBids, setLoadingBids] = useState(new Set());
  const [newVehicleLoading, setNewVehicleLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState(new Set());
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Mark as dashboard page for navbar awareness
  useEffect(() => {
    setIsDashboardPage(true);
    return () => setIsDashboardPage(false);
  }, [setIsDashboardPage]);

  useEffect(() => {
    dispatch(fetchAllVehicles());
    dispatch(fetchPendingReview());
    dispatch(fetchBids());
    dispatch(fetchMarketplaceStats());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection, searchQuery]);

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

  // Filter vehicles based on section and search
  const filteredVehicles = useMemo(() => {
    let vehicles = [];
    if (activeSection === "overview" || activeSection === "all") {
      vehicles = allVehicles;
    } else if (activeSection === "pending") {
      vehicles = pendingReview;
    } else if (activeSection === "verified") {
      vehicles = allVehicles.filter((v) => v.verification_state === "physical" || v.verification_state === "digital");
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      vehicles = vehicles.filter(
        (v) =>
          v.make?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query) ||
          v.owner_details?.username?.toLowerCase().includes(query)
      );
    }

    return vehicles;
  }, [activeSection, allVehicles, pendingReview, searchQuery]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  const paginatedBids = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return bids.slice(start, start + ITEMS_PER_PAGE);
  }, [bids, currentPage]);

  // Open verify modal
  const openVerifyModal = (vehicle) => {
    setVerifyModal({ open: true, vehicle });
  };

  // Handle verify with type (digital or physical) - Optimistic UI
  const handleVerify = async (vehicleId, verificationType) => {
    setVerifyModal({ open: false, vehicle: null });
    setLoadingVehicles(prev => new Set(prev).add(vehicleId));
    try {
      // Backend expects is_digitally_verified or is_physically_verified boolean flags
      const statusData = verificationType === "digital"
        ? { is_digitally_verified: true }
        : { is_physically_verified: true };
      await dispatch(updateVehicleStatus({ vehicleId, statusData })).unwrap();
      await dispatch(fetchAllVehicles());
      await dispatch(fetchPendingReview());
      toast.success(`Vehicle verified as ${verificationType}!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Failed to verify vehicle", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoadingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  // Open reject modal
  const openRejectModal = (vehicleId) => {
    setRejectModal({ open: true, vehicleId });
  };

  // Handle reject confirmation - Optimistic UI
  const handleReject = async () => {
    const vehicleId = rejectModal.vehicleId;
    setRejectModal({ open: false, vehicleId: null });
    setLoadingVehicles(prev => new Set(prev).add(vehicleId));
    try {
      // Backend expects is_rejected boolean flag
      await dispatch(updateVehicleStatus({ vehicleId, statusData: { is_rejected: true } })).unwrap();
      await dispatch(fetchAllVehicles());
      await dispatch(fetchPendingReview());
      toast.success("Vehicle rejected", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Rejection error:", err);
      toast.error("Failed to reject vehicle", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoadingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  // Open delete vehicle modal
  const openDeleteVehicleModal = (vehicleId) => {
    setDeleteVehicleModal({ open: true, vehicleId });
  };

  // Handle delete vehicle confirmation - Optimistic UI
  const handleDeleteVehicle = async () => {
    const vehicleId = deleteVehicleModal.vehicleId;
    setDeleteVehicleModal({ open: false, vehicleId: null });
    setLoadingVehicles(prev => new Set(prev).add(vehicleId));
    try {
      await dispatch(deleteVehicle(vehicleId));
      await dispatch(fetchAllVehicles());
      await dispatch(fetchPendingReview());
      toast.success("Vehicle deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete vehicle", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoadingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  // Open delete bid modal
  const openDeleteBidModal = (bidId) => {
    setDeleteBidModal({ open: true, bidId });
  };

  // Handle delete bid confirmation - Optimistic UI
  const handleDeleteBid = async () => {
    const bidId = deleteBidModal.bidId;
    setDeleteBidModal({ open: false, bidId: null });
    setLoadingBids(prev => new Set(prev).add(bidId));
    try {
      await dispatch(deleteBid(bidId));
      await dispatch(fetchBids());
      toast.success("Bid deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Delete bid error:", err);
      toast.error("Failed to delete bid", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoadingBids(prev => {
        const newSet = new Set(prev);
        newSet.delete(bidId);
        return newSet;
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAllVehicles()),
        dispatch(fetchPendingReview()),
        dispatch(fetchBids()),
        dispatch(fetchMarketplaceStats()),
      ]);
      toast.success("Data refreshed!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      toast.error("Failed to refresh data", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle toggle visibility - Optimistic UI
  const handleToggleVisibility = async (vehicleId) => {
    setLoadingVehicles(prev => new Set(prev).add(vehicleId));
    try {
      const result = await dispatch(toggleVisibility(vehicleId)).unwrap();
      await dispatch(fetchAllVehicles());
      toast.success(result.is_visible ? "Vehicle is now visible" : "Vehicle is now hidden", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Toggle visibility error:", err);
      toast.error("Failed to toggle visibility", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoadingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  // Handle create vehicle - Optimistic UI (only shows skeleton for new row)
  const handleCreateVehicle = async (formData) => {
    setAddVehicleModal(false);
    setActiveSection("all"); // Navigate to All Vehicles tab
    setCurrentPage(1); // Go to first page to see new vehicle
    setNewVehicleLoading(true);
    try {
      const result = await dispatch(createVehicle(formData)).unwrap();
      // Redux reducer adds the vehicle to state immediately - no need to refetch
      // Show skeleton briefly as visual feedback, then reveal the new row
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Vehicle added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      return result;
    } catch (err) {
      toast.error(err || "Failed to add vehicle", {
        position: "top-right",
        autoClose: 5000,
      });
      throw err;
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
      await dispatch(fetchAllVehicles());
      await dispatch(fetchPendingReview());
      toast.success("Vehicle updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Edit error:", err);
      toast.error(err || "Failed to update vehicle", {
        position: "top-right",
        autoClose: 5000,
      });
      throw err;
    } finally {
      setLoadingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  // Multi-select handlers
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      setSelectedVehicleIds(new Set());
    }
  };

  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vehicleId)) {
        newSet.delete(vehicleId);
      } else {
        newSet.add(vehicleId);
      }
      return newSet;
    });
  };

  const selectAllVehicles = () => {
    const currentVehicles = activeSection === "pending" ? pendingReview :
                           activeSection === "verified" ? allVehicles.filter(v => v.verification_state === "physical" || v.verification_state === "digital") :
                           allVehicles;
    const filteredIds = currentVehicles
      .filter(v => v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   v.model?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(v => v.id);
    setSelectedVehicleIds(new Set(filteredIds));
  };

  const deselectAllVehicles = () => {
    setSelectedVehicleIds(new Set());
  };

  // Get selected vehicles data
  const selectedVehiclesData = useMemo(() => {
    return allVehicles.filter(v => selectedVehicleIds.has(v.id));
  }, [allVehicles, selectedVehicleIds]);

  // Share/Export functions
  const generateVehicleListText = (vehicles) => {
    return vehicles.map((v, i) =>
      `${i + 1}. ${v.year} ${v.make} ${v.model}\n   Price: $${Number(v.price || 0).toLocaleString()}\n   Mileage: ${Number(v.mileage || 0).toLocaleString()} km\n   Status: ${v.verification_state}`
    ).join('\n\n');
  };

  const handleShareWhatsApp = () => {
    if (selectedVehiclesData.length === 0) return;
    const header = `*Auto Eden - Vehicle Selection*\n\nI'd like to share ${selectedVehiclesData.length} vehicle(s) with you:\n\n`;
    const vehiclesList = generateVehicleListText(selectedVehiclesData);
    const footer = `\n\n---\nView more at Auto Eden`;
    const message = encodeURIComponent(header + vehiclesList + footer);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShareMenuOpen(false);
  };

  const handleShareEmail = () => {
    if (selectedVehiclesData.length === 0) return;
    const subject = encodeURIComponent(`Auto Eden - ${selectedVehiclesData.length} Vehicle(s) Selection`);
    const header = `I'd like to share the following ${selectedVehiclesData.length} vehicle(s) with you:\n\n`;
    const vehiclesList = generateVehicleListText(selectedVehiclesData);
    const footer = `\n\n---\nView more at Auto Eden`;
    const body = encodeURIComponent(header + vehiclesList + footer);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShareMenuOpen(false);
  };

  const handleExportCSV = () => {
    if (selectedVehiclesData.length === 0) return;
    const headers = ['Year', 'Make', 'Model', 'Price', 'Mileage', 'Status', 'Location', 'VIN'];
    const rows = selectedVehiclesData.map(v => [
      v.year,
      v.make,
      v.model,
      v.price || 0,
      v.mileage || 0,
      v.verification_state,
      v.location || '',
      v.vin || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auto-eden-vehicles-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShareMenuOpen(false);
  };

  // Stats calculations
  const verifiedCount = allVehicles.filter((v) => v.verification_state === "physical" || v.verification_state === "digital").length;
  const pendingCount = pendingReview.length;
  const totalBids = bids.length;

  const sidebarItems = [
    { id: "overview", icon: Home, label: "Overview", badge: 0 },
    { id: "all", icon: Car, label: "All Vehicles", badge: allVehicles.length, color: "bg-blue-100 text-blue-600" },
    { id: "pending", icon: Clock, label: "Pending Review", badge: pendingCount, color: "bg-amber-100 text-amber-600" },
    { id: "verified", icon: CheckCircle, label: "Verified", badge: verifiedCount, color: "bg-emerald-100 text-emerald-600" },
    { id: "bids", icon: Gavel, label: "All Bids", badge: totalBids, color: "bg-purple-100 text-purple-600" },
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
                  Admin Dashboard
                </h1>
                <p className="text-gray-400 mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base">Monitor and manage your marketplace</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setAddVehicleModal(true)}
                  className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Add Vehicle</span>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors text-xs sm:text-sm ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 sm:p-2.5 bg-white/10 text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
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
            <div className="flex items-center gap-1 sm:gap-2">
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

          {/* Admin Info */}
          {!sidebarCollapsed && (
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg flex-shrink-0">
                  {user?.username?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user?.username || "Admin"}</p>
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-red-100 text-red-700 rounded-md">
                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    Admin
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Admin Avatar */}
          {sidebarCollapsed && (
            <div className="p-3 border-b border-gray-100 flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                Admin
              </span>
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
                {activeSection === "all" && "All Vehicles"}
                {activeSection === "pending" && "Pending Review"}
                {activeSection === "verified" && "Verified Vehicles"}
                {activeSection === "bids" && "All Bids"}
              </h2>
              <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                {activeSection === "overview" && "Your admin dashboard at a glance"}
                {activeSection === "all" && `${allVehicles.length} vehicles in total`}
                {activeSection === "pending" && `${pendingCount} vehicles awaiting review`}
                {activeSection === "verified" && `${verifiedCount} verified vehicles`}
                {activeSection === "bids" && `${totalBids} bids in total`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddVehicleModal(true)}
                className="sm:hidden inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`sm:hidden inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
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
                    <h3 className="font-bold text-lg sm:text-xl">Add New Vehicle</h3>
                    <p className="text-red-100 text-sm mt-1">Add and verify a vehicle instantly</p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                </div>
              </button>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
                <StatCard icon={Car} label="Total Vehicles" value={allVehicles.length} color="blue" loading={loading} />
                <StatCard icon={Clock} label="Pending Review" value={pendingCount} color="amber" loading={loading} />
                <StatCard icon={CheckCircle} label="Verified" value={verifiedCount} color="green" loading={loading} />
                <StatCard icon={Gavel} label="Total Bids" value={totalBids} color="purple" loading={bidsLoading} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {/* Pending Review Preview */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Pending Review</h3>
                    <button
                      onClick={() => setActiveSection("pending")}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  {loading ? (
                    <div className="space-y-2 sm:space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <OverviewItemSkeleton key={i} />
                      ))}
                    </div>
                  ) : pendingReview.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 sm:py-8 text-xs sm:text-sm">No pending vehicles</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {pendingReview.slice(0, 4).map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <div className="w-12 h-9 sm:w-14 sm:h-10 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={vehicle.images?.[0]?.image || "/placeholder-car.jpg"}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              ${Number(vehicle.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openVerifyModal(vehicle);
                              }}
                              className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Verify"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRejectModal(vehicle.id);
                              }}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
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
                  {bidsLoading ? (
                    <div className="space-y-2 sm:space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <OverviewItemSkeleton key={i} />
                      ))}
                    </div>
                  ) : bids.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 sm:py-8 text-xs sm:text-sm">No bids yet</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {bids.slice(0, 4).map((bid) => {
                        const vehicle = bid.vehicle_details || bid.vehicle || {};
                        return (
                          <div
                            key={bid.id}
                            className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-12 h-9 sm:w-14 sm:h-10 rounded-md sm:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={vehicle.images?.[0]?.image || "/placeholder-car.jpg"}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                                {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">
                                by {bid.bidder_details?.username || "Anonymous"}
                              </p>
                            </div>
                            <p className="font-semibold text-red-600 text-xs sm:text-sm">
                              ${Number(bid.amount || 0).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Vehicles Sections (all, pending, verified) */}
          {(activeSection === "all" || activeSection === "pending" || activeSection === "verified") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Search Bar & Select Mode */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectMode}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      selectMode
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {selectMode ? 'Done Selecting' : 'Select'}
                  </button>
                  {selectMode && (
                    <>
                      <button
                        onClick={selectAllVehicles}
                        className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                      >
                        Select All
                      </button>
                      {selectedVehicleIds.size > 0 && (
                        <button
                          onClick={deselectAllVehicles}
                          className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                        >
                          Deselect
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Selected Vehicles Action Bar */}
              <AnimatePresence>
                {selectMode && selectedVehicleIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-red-600/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{selectedVehicleIds.size} vehicle{selectedVehicleIds.size !== 1 ? 's' : ''} selected</p>
                          <p className="text-red-100 text-sm">Choose an action below</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Share Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setShareMenuOpen(!shareMenuOpen)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <AnimatePresence>
                            {shareMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                              >
                                <button
                                  onClick={handleShareWhatsApp}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                  Share via WhatsApp
                                </button>
                                <button
                                  onClick={handleShareEmail}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                  <Mail className="w-5 h-5 text-blue-500" />
                                  Share via Email
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <button
                          onClick={handleExportCSV}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export CSV
                        </button>
                        <button
                          onClick={deselectAllVehicles}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          title="Clear selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              {loading ? (
                <TableSkeleton />
              ) : filteredVehicles.length === 0 ? (
                <EmptyState
                  icon={Car}
                  title="No vehicles found"
                  description={searchQuery ? "Try adjusting your search" : "No vehicles in this category"}
                />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">Vehicle</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm hidden sm:table-cell">Price</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm hidden md:table-cell">Mileage</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">Status</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Show skeleton row when adding new vehicle */}
                          {newVehicleLoading && currentPage === 1 && <RowSkeleton />}
                          {paginatedVehicles.map((vehicle) => (
                            <VehicleRow
                              key={vehicle.id}
                              vehicle={vehicle}
                              onView={setSelectedVehicle}
                              onEdit={openEditVehicleModal}
                              onVerify={openVerifyModal}
                              onReject={openRejectModal}
                              onDelete={openDeleteVehicleModal}
                              onToggleVisibility={handleToggleVisibility}
                              isLoading={loadingVehicles.has(vehicle.id)}
                              selectMode={selectMode}
                              isSelected={selectedVehicleIds.has(vehicle.id)}
                              onToggleSelect={toggleVehicleSelection}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE)}
                      onPageChange={setCurrentPage}
                      totalItems={filteredVehicles.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3 bg-white rounded-xl border border-gray-100 p-3">
                    {/* Show skeleton card when adding new vehicle */}
                    {newVehicleLoading && currentPage === 1 && <CardSkeleton />}
                    {paginatedVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onView={setSelectedVehicle}
                        onEdit={openEditVehicleModal}
                        onVerify={openVerifyModal}
                        onReject={openRejectModal}
                        onDelete={openDeleteVehicleModal}
                        onToggleVisibility={handleToggleVisibility}
                        isLoading={loadingVehicles.has(vehicle.id)}
                        selectMode={selectMode}
                        isSelected={selectedVehicleIds.has(vehicle.id)}
                        onToggleSelect={toggleVehicleSelection}
                      />
                    ))}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE)}
                      onPageChange={setCurrentPage}
                      totalItems={filteredVehicles.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
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
              {bidsLoading ? (
                <TableSkeleton />
              ) : bids.length === 0 ? (
                <EmptyState
                  icon={Gavel}
                  title="No bids yet"
                  description="Bids will appear here when users make offers"
                />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">Vehicle</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm hidden sm:table-cell">Bidder</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">Amount</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm hidden md:table-cell">Status</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm hidden lg:table-cell">Date</th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-600 text-xs sm:text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBids.map((bid) => (
                            <BidRow
                              key={bid.id}
                              bid={bid}
                              onDelete={openDeleteBidModal}
                              isLoading={loadingBids.has(bid.id)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(bids.length / ITEMS_PER_PAGE)}
                      onPageChange={setCurrentPage}
                      totalItems={bids.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3 bg-white rounded-xl border border-gray-100 p-3">
                    {paginatedBids.map((bid) => (
                      <BidCard
                        key={bid.id}
                        bid={bid}
                        onDelete={openDeleteBidModal}
                        isLoading={loadingBids.has(bid.id)}
                      />
                    ))}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(bids.length / ITEMS_PER_PAGE)}
                      onPageChange={setCurrentPage}
                      totalItems={bids.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
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
        onVerify={(vehicle) => {
          setSelectedVehicle(null);
          openVerifyModal(vehicle);
        }}
        onReject={(vehicleId) => {
          setSelectedVehicle(null);
          openRejectModal(vehicleId);
        }}
      />

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verifyModal.open}
        onClose={() => setVerifyModal({ open: false, vehicle: null })}
        onVerify={handleVerify}
        vehicle={verifyModal.vehicle}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, vehicleId: null })}
        onConfirm={handleReject}
        title="Reject Vehicle"
        message="Are you sure you want to reject this vehicle? The owner will be notified of this decision."
        confirmText="Reject"
        confirmColor="red"
        icon={XCircle}
      />

      {/* Delete Vehicle Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteVehicleModal.open}
        onClose={() => setDeleteVehicleModal({ open: false, vehicleId: null })}
        onConfirm={handleDeleteVehicle}
        title="Delete Vehicle"
        message="Are you sure you want to permanently delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
        icon={Trash2}
      />

      {/* Delete Bid Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteBidModal.open}
        onClose={() => setDeleteBidModal({ open: false, bidId: null })}
        onConfirm={handleDeleteBid}
        title="Delete Bid"
        message="Are you sure you want to delete this bid? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
        icon={Trash2}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={addVehicleModal}
        onClose={() => setAddVehicleModal(false)}
        onSubmit={handleCreateVehicle}
        isAdmin={true}
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
