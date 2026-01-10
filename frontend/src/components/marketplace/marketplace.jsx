import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMarketplace } from "../../redux/slices/vehicleSlice";
import { Link } from "react-router-dom";
import { placeBid } from "../../redux/slices/bidSlice";
import { AuthModals } from "../navbar/navbar";
import { formatMediaUrl } from "../../utils/image";
import QuoteRequestModal from "./quoteRequestModal";
import ImagePreview, { useImagePreview } from "../imagePreviewing";
import SmartImage from "../../utils/smartImage";
import {
  Car,
  Search,
  Sliders,
  DollarSign,
  Calendar,
  Gauge,
  ArrowUpDown,
  Tag,
  Map,
  Shield,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
  Grid3X3,
  List,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Chip,
  Dialog,
  IconButton,
  InputAdornment,
  Slider,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Backdrop,
  Divider,
  Badge,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import useTracking from "../../hooks/useTracking";

/**
 * A resilient image component that tries multiple URL formats before falling back to a placeholder.
 *
 * @param {object} props - The component props.
 * @param {string} props.src - The initial image URL from the API.
 * @param {string} props.alt - The alt text for the image.
 * @param {string} props.className - CSS classes for styling the image.
 * @param {string} [props.placeholder='/placeholder-car.jpg'] - The path to the placeholder image.
 */
const ImageWithFallback = ({
  src: initialSrc,
  alt,
  className,
  placeholder = "/placeholder-car.jpg",
}) => {
  const baseUrl = "https://autoeden.sgp1.cdn.digitaloceanspaces.com/";
  const mediaPrefix = "media/";

  /**
   * Generates the URL with the '/media/' prefix logic.
   * This is the first URL we will attempt to load.
   */
  const getFormattedUrl = (url) => {
    if (!url || typeof url !== "string") return placeholder;
    // If it already has the prefix, return it as is.
    if (url.includes(`/${mediaPrefix}`)) return url;
    // If it has the base URL, insert the prefix.
    if (url.startsWith(baseUrl)) {
      return url.replace(baseUrl, `${baseUrl}${mediaPrefix}`);
    }
    // Fallback for relative paths, though unlikely in this case.
    return `${baseUrl}${mediaPrefix}${
      url.startsWith("/") ? url.slice(1) : url
    }`;
  };

  // Define the two URLs we will try.
  const formattedUrl = getFormattedUrl(initialSrc);
  const originalUrl = initialSrc || placeholder;

  // State to hold the current image source URL. We start with the formatted one.
  const [imgSrc, setImgSrc] = useState(formattedUrl);

  // Effect to reset the component's state if the initial `src` prop changes.
  useEffect(() => {
    setImgSrc(getFormattedUrl(initialSrc));
  }, [initialSrc]);

  /**
   * Handles image loading errors.
   * If the formatted URL fails, it tries the original URL.
   * If the original URL also fails, it shows the final placeholder.
   */
  const handleError = () => {
    // First error: The formatted URL failed. Let's try the original URL.
    if (imgSrc === formattedUrl) {
      setImgSrc(originalUrl);
    }
    // Second error: The original URL also failed. Fallback to the placeholder.
    else {
      setImgSrc(placeholder);
    }
  };

  return (
    <img src={imgSrc} alt={alt} className={className} onError={handleError} />
  );
};

// --- Vehicle Skeleton Component ---
const VehicleSkeleton = ({ viewMode }) => (
  <div
    className={`bg-white rounded-xl shadow-sm overflow-hidden animate-pulse ${
      viewMode === "list" ? "flex flex-col md:flex-row" : ""
    }`}
  >
    <div
      className={`relative bg-gray-200 ${
        viewMode === "list" ? "md:w-1/3 h-56 md:h-full" : "h-52 rounded-t-xl"
      }`}
    >
      {/* Placeholder for image */}
    </div>
    <div
      className={`p-4 flex flex-col ${viewMode === "list" ? "md:w-2/3" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded w-12"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="h-5 bg-gray-300 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between items-center mt-auto">
        <div className="h-10 bg-gray-300 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const CustomSelect = ({ label, value, onChange, options, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
      >
        <div className="flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Custom Input Component
const CustomInput = ({ label, value, onChange, placeholder, type = "text", icon: Icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
      />
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />}
    </div>
  </div>
);

export default function MarketplacePage() {
  const dispatch = useDispatch();
  useTracking(window.location.pathname);
  const { marketplace, loading } = useSelector((state) => state.vehicles);
  const { preview, openPreview, closePreview } = useImagePreview();

  const {
    results: vehicles = [],
    count: totalVehicles = 0,
    currentPage = 1,
    totalPages = 1,
    pageSize = 12,
  } = marketplace || {};
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    make: "",
    year: "",
    sortBy: "newest",
    bodyType: "",
    fuelType: "",
    searchTerm: "",
    page: 1, // Add this
    page_size: 12, // Add this
  });

  const [authModal, setAuthModal] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Popular makes for quick filtering
  const popularMakes = ["Toyota", "BMW", "Mercedes", "Honda", "Ford"];

  // Popular body types
  const bodyTypes = ["Sedan", "SUV", "Hatchback", "Coupe", "Truck", "Van"];
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "priceLowHigh", label: "Price: Low to High" },
    { value: "priceHighLow", label: "Price: High to Low" },
  ];

  const bodyTypeOptions = [
    { value: "", label: "Any Body Type" },
    ...bodyTypes.map((type) => ({ value: type, label: type })),
  ];

  const fuelTypeOptions = [
    { value: "", label: "Any Fuel Type" },
    ...fuelTypes.map((type) => ({ value: type, label: type })),
  ];

  useEffect(() => {
    setIsLoading(true);

    // Convert frontend filters to backend format
    const backendFilters = {
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      make: filters.make,
      year: filters.year,
      sort_by: filters.sortBy,
      body_type: filters.bodyType,
      fuel_type: filters.fuelType,
      search_term: filters.searchTerm,
      page: filters.page,
      page_size: filters.page_size,
    };

    dispatch(fetchMarketplace(backendFilters))
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch, filters]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));

    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle filter change - reset to page 1 when filters change
  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  // Similarly update other filter handlers to reset page to 1
  const handleQuickFilterMake = (make) => {
    setFilters({
      ...filters,
      make,
      page: 1,
    });
  };

  const handleQuickFilterBodyType = (bodyType) => {
    setFilters({
      ...filters,
      bodyType,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      make: "",
      year: "",
      sortBy: "newest",
      bodyType: "",
      fuelType: "",
      searchTerm: "",
      page: 1,
    });
  };

  const handleMarketplaceImageClick = (vehicle, imageIndex = 0) => {
    const imageUrls = vehicle.images?.map((img) => img.image) || [
      vehicle.main_image,
    ];
    openPreview(
      imageUrls,
      imageIndex,
      `${vehicle.make} ${vehicle.model}`,
      `${vehicle.make} ${vehicle.model}`,
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    );
  };

  const getPageRange = () => {
    const range = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value, index, array) => {
      const keys = Object.keys(filters);
      const key = keys[index];
      return value && key !== "sortBy" && key !== "page" && key !== "page_size";
    }
  ).length;

  return (
    <div className="pacaembu-font min-h-screen bg-gray-50">
      {/* Hero Section with Parallax Effect */}
      <motion.section
        className="relative h-[60vh] sm:h-[50vh] md:h-[40vh] lg:h-96 bg-gradient-to-br from-red-600 via-red-700 to-red-800 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-white rounded-full"
              initial={{
                scale: 0.1,
                x: Math.random() * window.innerWidth,
                y: Math.random() * 400,
                opacity: 0.1,
              }}
              animate={{
                scale: [0.1, 0.3 + Math.random() * 0.4],
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [Math.random() * 400, Math.random() * 400],
                opacity: [0.1, 0.15 + Math.random() * 0.1],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Find Your Perfect Ride
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mb-6 sm:mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Browse our extensive collection of premium vehicles from trusted
            sellers
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="bg-white rounded-xl shadow-xl flex flex-col sm:flex-row overflow-hidden w-full max-w-4xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex-grow p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}

                    onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Search triggers automatically via useEffect
                      }
                    }}
                  placeholder="Search by make, model, or keyword..."
                  className="w-full pl-10 pr-4 py-3 sm:py-2 text-gray-900 placeholder-gray-500 border-0 focus:ring-0 focus:outline-none rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => {
                /* Search functionality can be added here */
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 sm:py-2 font-medium transition-colors duration-200 sm:rounded-r-xl"
            >
              Search
            </button>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-10">
        {/* Quick Filters - Makes */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-4 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-gray-700 font-semibold text-sm sm:text-base whitespace-nowrap">
              Popular Makes:
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularMakes.map((make) => (
                <button
                  key={make}
                  onClick={() => handleQuickFilterMake(make)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    filters.make === make
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {make}
                </button>
              ))}
              {filters.make && (
                <button
                  onClick={() => handleFilterChange("make", "")}
                  className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Clear make filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        {/* Filter Bar */}
        <motion.div
          className="bg-white shadow-lg rounded-xl mb-6 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Filter Header */}
          <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="text-gray-600 w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-900">
                Filters & Sorting
              </h2>
              {activeFiltersCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                {showFilters ? "Hide" : "Show"} Filters
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-100"
              >
                <div className="p-4 space-y-4">
                  {/* Price Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomInput
                      label="Min Price"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      placeholder="0"
                      type="number"
                      icon={DollarSign}
                    />
                    <CustomInput
                      label="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      placeholder="No limit"
                      type="number"
                      icon={DollarSign}
                    />
                  </div>

                  {/* Make and Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomInput
                      label="Make"
                      value={filters.make}
                      onChange={(e) =>
                        handleFilterChange("make", e.target.value)
                      }
                      placeholder="Any make"
                      icon={Car}
                    />
                    <CustomInput
                      label="Year"
                      value={filters.year}
                      onChange={(e) =>
                        handleFilterChange("year", e.target.value)
                      }
                      placeholder="Any year"
                      type="number"
                      icon={Calendar}
                    />
                  </div>

                  {/* Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CustomSelect
                      label="Body Type"
                      value={filters.bodyType}
                      onChange={(value) =>
                        handleFilterChange("bodyType", value)
                      }
                      options={bodyTypeOptions}
                      placeholder="Any body type"
                      icon={Tag}
                    />
                    <CustomSelect
                      label="Fuel Type"
                      value={filters.fuelType}
                      onChange={(value) =>
                        handleFilterChange("fuelType", value)
                      }
                      options={fuelTypeOptions}
                      placeholder="Any fuel type"
                      icon={Gauge}
                    />
                    <CustomSelect
                      label="Sort By"
                      value={filters.sortBy}
                      onChange={(value) => handleFilterChange("sortBy", value)}
                      options={sortOptions}
                      placeholder="Sort by"
                      icon={ArrowUpDown}
                    />
                  </div>

                  {/* Body Type Quick Filters */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h3 className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                        Quick Filter:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {bodyTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => handleQuickFilterBodyType(type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                              filters.bodyType === type
                                ? "bg-red-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count & View Mode */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * pageSize, totalVehicles)}
            </span>{" "}
            of <span className="font-semibold">{totalVehicles}</span> vehicles
            {filters.make && (
              <span>
                {" "}
                in <span className="font-semibold">{filters.make}</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Tooltip title="Grid View">
              <IconButton
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "!bg-red-50" : ""}
                sx={{ color: viewMode === "grid" ? "#dc2626" : "#6b7280" }}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "!bg-red-50" : ""}
                sx={{ color: viewMode === "list" ? "#dc2626" : "#6b7280" }}
              >
                <div className="flex flex-col gap-0.5 items-center">
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                </div>
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && vehicles.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <Car className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any vehicles matching your criteria. Try
              adjusting your filters or logging in again.
            </p>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                color: "#dc2626",
                borderColor: "#dc2626",
                "&:hover": {
                  borderColor: "#b91c1c",
                  backgroundColor: "rgba(220, 38, 38, 0.04)",
                },
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Vehicle Grid */}
        {!isLoading && vehicles.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {vehicles.map((vehicle, index) => (
              <Link to={`/vehicles/${vehicle.id}`} key={vehicle.id}>
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * (index % 6) }}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                    viewMode === "list" ? "flex flex-col md:flex-row" : ""
                  }`}
                >
                  <div
                    className={`relative ${
                      viewMode === "list" ? "md:w-1/3" : ""
                    }`}
                  >
                    <ImageWithFallback
                      src={vehicle.main_image}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      onClick={() => handleMarketplaceImageClick(vehicle, 0)}
                      className={`w-full object-cover ${
                        viewMode === "list"
                          ? "h-56 md:h-full md:rounded-l-xl"
                          : "h-52 rounded-t-xl"
                      }`}
                    />
                    {/* Featured Badge */}
                    {vehicle.featured && (
                      <div className="absolute top-4 left-0 bg-yellow-500 text-white px-3 py-1 rounded-r-full shadow-md flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">Featured</span>
                      </div>
                    )}

                    {/* Chips and badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Chip
                        label={
                          vehicle.listing_type === "instant_sale"
                            ? "Buy Now"
                            : "Marketplace"
                        }
                        color={
                          vehicle.listing_type === "instant_sale"
                            ? "success"
                            : "primary"
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            vehicle.listing_type === "instant_sale"
                              ? "#059669"
                              : "#1d4ed8",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />

                      {vehicle.is_verified && (
                        <Chip
                          icon={<Shield className="w-3 h-3 text-green-700" />}
                          label="Verified"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(240, 253, 244, 0.9)",
                            color: "#15803d",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            "& .MuiChip-icon": {
                              color: "#15803d",
                            },
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className={`p-4 flex flex-col ${
                      viewMode === "list" ? "md:w-2/3" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-gray-600">
                          {vehicle.year} •{" "}
                          {vehicle.mileage?.toLocaleString() || "0"} km
                        </p>
                      </div>
                      <Badge
                        badgeContent={vehicle.bid_count || 0}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: "#dc2626",
                            color: "white",
                          },
                        }}
                      >
                        <TrendingUp className="text-gray-400 w-5 h-5" />
                      </Badge>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Tag className="w-4 h-4 mr-1.5 text-gray-500" />
                        <span>{vehicle.body_type || "Sedan"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Map className="w-4 h-4 mr-1.5 text-gray-500" />
                        <span>{vehicle.location || "Auto Eden HQ"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Gauge className="w-4 h-4 mr-1.5 text-gray-500" />
                        <span>{vehicle.transmission || "Automatic"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1.5 text-gray-500" />
                        <span>{vehicle.fuel_type || "Petrol"}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-red-600">
                          ${vehicle.price?.toLocaleString()}
                        </span>
                        {vehicle.discount_price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${vehicle.discount_price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* In the vehicle card buttons section (modify the existing code) */}
                      {vehicle.listing_type === "marketplace" &&
                      isAuthenticated &&
                      user?.id !== vehicle.owner?.id ? (
                        <Button
                          variant="contained"
                          size={viewMode === "grid" ? "medium" : "large"}
                          onClick={() => setSelectedVehicle(vehicle)}
                          sx={{
                            backgroundColor: "#dc2626",
                            "&:hover": {
                              backgroundColor: "#b91c1c",
                            },
                          }}
                          className="!rounded-lg !font-medium"
                        >
                          Make an offer
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size={viewMode === "grid" ? "medium" : "large"}
                          onClick={() => setSelectedVehicle(vehicle)}
                          sx={{
                            color: "#dc2626",
                            borderColor: "#dc2626",
                            "&:hover": {
                              borderColor: "#b91c1c",
                              backgroundColor: "rgba(220, 38, 38, 0.04)",
                            },
                          }}
                          className="!rounded-lg !font-medium"
                        >
                          View Details
                        </Button>
                      )}
                    </div>

                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          Posted{" "}
                          {new Date(vehicle.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {vehicle.ending_soon && (
                        <div className="flex items-center text-red-500">
                          <span className="animate-pulse mr-1">●</span>
                          <span>Ending soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                size="small"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                sx={{
                  color: "#6b7280",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#9ca3af",
                    backgroundColor: "rgba(156, 163, 175, 0.04)",
                  },
                  "&.Mui-disabled": {
                    borderColor: "#e5e7eb",
                    color: "#9ca3af",
                  },
                }}
              >
                Previous
              </Button>

              {getPageRange().map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handlePageChange(page)}
                  sx={
                    page === currentPage
                      ? {
                          backgroundColor: "#dc2626",
                          "&:hover": {
                            backgroundColor: "#b91c1c",
                          },
                        }
                      : {
                          color: "#6b7280",
                          borderColor: "#d1d5db",
                          "&:hover": {
                            borderColor: "#9ca3af",
                            backgroundColor: "rgba(156, 163, 175, 0.04)",
                          },
                        }
                  }
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outlined"
                size="small"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                sx={{
                  color: "#6b7280",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#9ca3af",
                    backgroundColor: "rgba(156, 163, 175, 0.04)",
                  },
                  "&.Mui-disabled": {
                    borderColor: "#e5e7eb",
                    color: "#9ca3af",
                  },
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Quote Request Modal */}
        <QuoteRequestModal
          open={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          vehicle={selectedVehicle}
          vehicleId={selectedVehicle?.id}
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

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
