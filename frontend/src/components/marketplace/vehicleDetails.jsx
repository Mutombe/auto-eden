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
import { FaXTwitter } from "react-icons/fa6";
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
} from "lucide-react";
import {
  Button,
  TextField,
  Chip,
  Dialog,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { FaWhatsapp } from "react-icons/fa";
import VehicleCard from "./vehicleCard";

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

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function VehicleMetaTags({ vehicle }) {
  if (!vehicle) return null;

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} - Auto Eden`;
  const description = `${vehicle.year} ${vehicle.make} ${vehicle.model} for $${vehicle.price?.toLocaleString()} - ${vehicle.body_type || 'Sedan'} with ${vehicle.mileage?.toLocaleString()}km. ${vehicle.is_physically_verified ? 'Physically verified' : 'Digitally verified'} vehicle on Auto Eden.`;
  const image = vehicle.images?.[0]?.image || 'https://autoeden.co.zw/default-car-image.jpg';
  const url = `https://autoeden.co.zw/vehicles/${vehicle.id}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${vehicle.make}, ${vehicle.model}, ${vehicle.year}, car, vehicle, auto, zimbabwe, harare, for sale`} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Auto Eden" />
      <meta property="og:locale" content="en_US" />
      
      {/* Product specific Open Graph tags */}
      <meta property="product:price:amount" content={vehicle.price} />
      <meta property="product:price:currency" content="USD" />
      <meta property="product:condition" content="used" />
      <meta property="product:availability" content="in stock" />
      <meta property="product:brand" content={vehicle.make} />
      <meta property="product:category" content="Vehicles" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@AutoEdenZW" />
      <meta name="twitter:creator" content="@AutoEdenZW" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Auto Eden Motors" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data for better SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Car",
          "name": `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          "description": description,
          "image": image,
          "brand": {
            "@type": "Brand",
            "name": vehicle.make
          },
          "model": vehicle.model,
          "vehicleModelDate": vehicle.year,
          "mileageFromOdometer": {
            "@type": "QuantitativeValue",
            "value": vehicle.mileage,
            "unitCode": "KMT"
          },
          "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "USD",
            "price": vehicle.price,
            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "itemCondition": "https://schema.org/UsedCondition",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Auto Eden Motors",
              "url": "https://autoeden.co.zw"
            }
          },
          "manufacturer": {
            "@type": "Organization",
            "name": vehicle.make
          },
          "vehicleConfiguration": vehicle.body_type,
          "fuelType": vehicle.fuel_type || "Gasoline",
          "url": url
        })}
      </script>
    </Helmet>
  );
}

export default function CarDetailsPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const {
    currentVehicle,
    loadingDetails,
    marketplace: { results: marketplaceVehicles = [] },
  } = useSelector((state) => state.vehicles);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [authModal, setAuthModal] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [viewCount, setViewCount] = useState(1247);

  const [quoteForm, setQuoteForm] = useState({
    fullName: "",
    email: "",
    country: "",
    city: "",
    address: "",
    telephone: "",
    note: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

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

  const handleSubmitQuote = () => {
    if (currentVehicle) {
      dispatch(
        requestQuote({
          vehicleId: currentVehicle.id,
          ...quoteForm,
        })
      )
        .then(() => {
          setShowQuoteModal(false);
          setSnackbar({
            open: true,
            message: "Quote request submitted successfully!",
            severity: "success",
          });
        })
        .catch((error) => {
          setSnackbar({
            open: true,
            message: error?.message || "Failed to submit quote request",
            severity: "error",
          });
        });
    }
  };

  const handlePlaceBid = () => {
    if (currentVehicle && bidAmount) {
      dispatch(
        placeBid({
          vehicleId: currentVehicle.id,
          amount: parseFloat(bidAmount),
          message: bidMessage || "No message provided",
        })
      )
        .then(() => {
          setSnackbar({
            open: true,
            message: "Your bid has been placed successfully!",
            severity: "success",
          });
        })
        .catch((error) => {
          setSnackbar({
            open: true,
            message: error?.message || "Failed to place bid. Please try again.",
            severity: "error",
          });
        });
    }
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
        setSnackbar({
          open: true,
          message: "Link copied to clipboard!",
          severity: "success",
        });
        break;
    }
    setShowShareModal(false);
  };

  const getVerificationIcon = (vehicle) => {
    if (vehicle.is_physically_verified) {
      return <CheckCircle className="text-green-500" size={20} />;
    } else if (vehicle.is_digitally_verified) {
      return <Shield className="text-blue-500" size={20} />;
    } else if (vehicle.is_rejected) {
      return <XCircle className="text-red-500" size={20} />;
    }
    return <AlertCircle className="text-yellow-500" size={20} />;
  };

  const getVerificationText = (vehicle) => {
    if (vehicle.is_physically_verified) return "Physically Verified";
    if (vehicle.is_digitally_verified) return "Digitally Verified";
    if (vehicle.is_rejected) return "Rejected";
    return "Verification Pending";
  };

  if (!vehicle || loadingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CircularProgress sx={{ color: "#dc2626" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: "red", color: "white", padding: "10px" }}>
        TEST: Component is rendering
      </div>
      {/* Meta Tags */}
      <VehicleMetaTags vehicle={vehicle} />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between">
            <Button
              startIcon={<ArrowLeft />}
              onClick={() => navigate(-1)}
              sx={{ color: "#dc2626" }}
            >
              Back to Marketplace
            </Button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-gray-600">
                <Eye size={16} className="mr-1" />
                <span className="text-sm">
                  {viewCount.toLocaleString()} views
                </span>
              </div>

              <IconButton
                onClick={() => setIsWishlisted(!isWishlisted)}
                sx={{ color: isWishlisted ? "#dc2626" : "#6b7280" }}
              >
                <Heart fill={isWishlisted ? "currentColor" : "none"} />
              </IconButton>

              <Button
                startIcon={<Share2 />}
                onClick={() => setShowShareModal(true)}
                variant="outlined"
                size="small"
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Vehicle Details */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Enhanced Image Gallery */}
            <div className="relative">
              <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                <ImageWithFallback
                  src={vehicle.images?.[currentImageIndex]?.image}
                  className="w-full h-96 object-cover cursor-pointer"
                  alt={`${vehicle.make} ${vehicle.model}`}
                  onClick={() => setShowCarousel(true)}
                />

                {/* Image counter */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {vehicle.images?.length || 1}
                </div>

                {/* Camera icon */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full">
                  <Camera size={20} />
                </div>
              </div>

              {/* Enhanced thumbnail gallery */}
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {vehicle.images?.map((img, index) => (
                    <motion.div
                      key={index}
                      className={`flex-shrink-0 relative cursor-pointer ${
                        currentImageIndex === index ? "ring-2 ring-red-500" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <ImageWithFallback
                        src={img.image}
                        className="h-20 w-20 object-cover rounded-lg"
                        alt={`Preview ${index + 1}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Vehicle Info */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h1>
                    <div className="flex items-center space-x-2">
                      {getVerificationIcon(vehicle)}
                      <span className="text-sm text-gray-600">
                        {getVerificationText(vehicle)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <Chip
                      label={`$${vehicle.price?.toLocaleString() || "0"}`}
                      sx={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        fontSize: "1.125rem",
                        fontWeight: "bold",
                        padding: "0.5rem",
                      }}
                    />

                    {vehicle.listing_type === "marketplace" && (
                      <div className="flex items-center text-red-500 bg-red-50 px-3 py-1 rounded-full">
                        <TrendingUp className="mr-1" size={16} />
                        <span className="text-sm font-medium">Marketplace</span>
                      </div>
                    )}

                    <Badge badgeContent={vehicle.bid_count || 0} color="error">
                      <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <MessageCircle className="mr-1" size={16} />
                        <span className="text-sm">Bids</span>
                      </div>
                    </Badge>
                  </div>
                </div>

                {/* Key specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Gauge className="text-blue-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Mileage</p>
                      <p className="font-semibold">
                        {vehicle.mileage?.toLocaleString() || "0"} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Tag className="text-green-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Body Type</p>
                      <p className="font-semibold">
                        {vehicle.body_type || "Sedan"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="text-purple-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">
                        {vehicle.location || "Auto Eden HQ"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Fuel className="text-orange-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Fuel Type</p>
                      <p className="font-semibold">
                        {vehicle.fuel_type || "Petrol"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Bid/Quote Section */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
                  {vehicle.listing_type === "marketplace" ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <DollarSign className="mr-2 text-red-500" />
                        Make an Offer
                      </h3>

                      {isAuthenticated ? (
                        <>
                          <TextField
                            fullWidth
                            type="number"
                            label="Your Bid Amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            variant="outlined"
                            InputProps={{
                              startAdornment: (
                                <DollarSign className="mr-2 text-gray-400" />
                              ),
                            }}
                          />
                           <Divider className="p-1" />

                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Message to Seller"
                            value={bidMessage}
                            onChange={(e) => setBidMessage(e.target.value)}
                            placeholder="Tell the seller why you're interested..."
                            variant="outlined"
                          />

                           <Divider className="p-1"/>

                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handlePlaceBid}
                            size="large"
                            sx={{
                              backgroundColor: "#dc2626",
                              "&:hover": { backgroundColor: "#b91c1c" },
                              py: 1.5,
                            }}
                          >
                            Submit Offer
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => setAuthModal("login")}
                            size="large"
                            sx={{
                              backgroundColor: "#dc2626",
                              "&:hover": { backgroundColor: "#b91c1c" },
                              py: 1.5,
                            }}
                          >
                            Login to Make an Offer
                          </Button>

                          <Divider>or</Divider>

                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setShowQuoteModal(true)}
                            size="large"
                            sx={{ py: 1.5 }}
                          >
                            Get Instant Quote
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: "#dc2626",
                        "&:hover": { backgroundColor: "#b91c1c" },
                        py: 1.5,
                      }}
                    >
                      <Zap className="mr-2" />
                      Buy Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Details Tabs */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Specifications" />
            <Tab label="Features" />
            <Tab label="Seller Info" />
            <Tab label="History" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {Object.entries(mockVehicleDetails.specifications).map(
                ([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{ textTransform: "capitalize", mb: 1 }}
                        >
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              {mockVehicleDetails.features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar sx={{ width: 64, height: 64, bgcolor: "#dc2626" }}>
                  {mockVehicleDetails.seller.name.charAt(0)}
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold">
                      {mockVehicleDetails.seller.name}
                    </h3>
                    {mockVehicleDetails.seller.verified && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outlined"
                  startIcon={<Phone />}
                  fullWidth
                  href={`tel:${mockVehicleDetails.seller.phone}`}
                >
                  {mockVehicleDetails.seller.phone}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Mail />}
                  fullWidth
                  href={`mailto:${mockVehicleDetails.seller.email}`}
                >
                  Send Email
                </Button>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <List>
              {mockVehicleDetails.history.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {item.status === "success" ? (
                      <CheckCircle className="text-green-500" />
                    ) : (
                      <Info className="text-blue-500" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.event}
                    secondary={new Date(item.date).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Similar Vehicles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Image Carousel Modal */}
      <Dialog
        open={showCarousel}
        onClose={() => setShowCarousel(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "black", color: "white" },
        }}
      >
        <div className="relative">
          <IconButton
            onClick={() => setShowCarousel(false)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              zIndex: 1,
            }}
          >
            <X />
          </IconButton>

          <div className="relative">
            <img
              src={vehicle.images?.[currentImageIndex]?.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-96 object-contain"
            />

            {/* Navigation arrows */}
            <IconButton
              onClick={() =>
                setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
              }
              disabled={currentImageIndex === 0}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={() =>
                setCurrentImageIndex(
                  Math.min(vehicle.images?.length - 1, currentImageIndex + 1)
                )
              }
              disabled={currentImageIndex === vehicle.images?.length - 1}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
              }}
            >
              <ChevronRight />
            </IconButton>
          </div>

          {/* Image indicators */}
          <div className="flex justify-center space-x-2 p-4">
            {vehicle.images?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  currentImageIndex === index ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onClose={() => setShowShareModal(false)}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Share this vehicle</h3>
            <IconButton onClick={() => setShowShareModal(false)}>
              <X />
            </IconButton>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outlined"
              startIcon={<Facebook />}
              onClick={() => handleShare("facebook")}
              sx={{ color: "#1877f2" }}
            >
              Facebook
            </Button>
            <Button
              variant="outlined"
              startIcon={<FaXTwitter />}
              onClick={() => handleShare("twitter")}
              sx={{ color: "#1da1f2" }}
            ></Button>
            <Button
              variant="outlined"
              startIcon={<FaWhatsapp />}
              onClick={() => handleShare("whatsapp")}
              sx={{ color: "#25d366" }}
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              startIcon={<Copy />}
              onClick={() => handleShare("copy")}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Quote Modal */}
      <Dialog
        open={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        maxWidth="md"
        fullWidth
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Get Vehicle Quote
              </h3>
              <p className="text-gray-600 mt-1">
                Get a personalized quote for this {vehicle.year} {vehicle.make}{" "}
                {vehicle.model}
              </p>
            </div>
            <IconButton onClick={() => setShowQuoteModal(false)}>
              <X />
            </IconButton>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitQuote();
            }}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="Full Name"
                  required
                  value={quoteForm.fullName}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, fullName: e.target.value })
                  }
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, email: e.target.value })
                  }
                  variant="outlined"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={quoteForm.country}
                    label="Country"
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, country: e.target.value })
                    }
                    required
                  >
                    <MenuItem value="Zimbabwe">Zimbabwe</MenuItem>
                    <MenuItem value="Botswana">Botswana</MenuItem>
                    <MenuItem value="Zambia">Zambia</MenuItem>
                    <MenuItem value="South Africa">South Africa</MenuItem>
                    <MenuItem value="Namibia">Namibia</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="City"
                  required
                  value={quoteForm.city}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, city: e.target.value })
                  }
                  variant="outlined"
                />
              </div>

              <TextField
                fullWidth
                label="Telephone"
                type="tel"
                required
                value={quoteForm.telephone}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, telephone: e.target.value })
                }
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={quoteForm.address}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, address: e.target.value })
                }
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Additional Notes"
                placeholder="Any specific requirements, financing needs, or questions?"
                multiline
                rows={3}
                value={quoteForm.note}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, note: e.target.value })
                }
                variant="outlined"
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="text-blue-500" size={20} />
                  <span className="font-medium text-blue-900">
                    What happens next?
                  </span>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Our team will review your request within 24 hours</li>
                  <li>• You'll receive a personalized quote via email</li>
                  <li>• We'll include financing options if requested</li>
                  <li>• Schedule a test drive or inspection</li>
                </ul>
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#3b82f6",
                  "&:hover": { backgroundColor: "#2563eb" },
                  py: 1.5,
                  mt: 3,
                }}
              >
                Submit Quote Request
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Auth Modals */}
      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
