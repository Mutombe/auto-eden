import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMarketplace } from "../../redux/slices/vehicleSlice";
import { placeBid } from "../../redux/slices/bidSlice";
import { requestQuote } from "../../redux/slices/quoteSlice";
import { AuthModals } from "../navbar/navbar";
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
  X
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
} from "@mui/material";
import { motion } from "framer-motion";
import { useMemo } from "react";
import VehicleCard from "./vehicleCard"; // Reuse your existing card component

export default function CarDetailsPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: vehicles } = useSelector((state) => state.vehicles);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [vehicle, setVehicle] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [authModal, setAuthModal] = useState(null);
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
  });

  // Get recommendations (similar vehicles)
  const recommendations = useMemo(() => {
    if (!vehicle) return [];
    return vehicles
      .filter(
        (v) =>
          v.id !== vehicle.id &&
          (v.make === vehicle.make || v.body_type === vehicle.body_type)
      )
      .slice(0, 4);
  }, [vehicles, vehicle]);

  useEffect(() => {
    const foundVehicle = vehicles.find((v) => v.id === parseInt(vehicleId));
    if (foundVehicle) {
      setVehicle(foundVehicle);
    } else {
      dispatch(fetchMarketplace()).then(() => {
        const v = vehicles.find((v) => v.id === parseInt(vehicleId));
        if (v) setVehicle(v);
        else navigate("/marketplace");
      });
    }
  }, [vehicleId, vehicles]);

  const handleSubmitQuote = () => {
  if (vehicle) {
    dispatch(
      requestQuote({
        vehicleId: vehicle.id,
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
    if (vehicle && bidAmount) {
      dispatch(
        placeBid({
          vehicleId: vehicle.id,
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

  if (!vehicle) return <CircularProgress sx={{ color: "#dc2626" }} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Button
        startIcon={<ArrowLeft />}
        onClick={() => navigate(-1)}
        sx={{ color: "#dc2626", m: 2 }}
      >
        Back to Marketplace
      </Button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Vehicle Details */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <img
                src={
                  vehicle.images?.[0]?.image
                    ? `${
                        import.meta.env.VITE_API_BASE_URL_LOCAL ||
                        import.meta.env.VITE_API_BASE_URL_DEPLOY
                      }${vehicle.images[0].image}`
                    : "/placeholder-car.jpg"
                }
                className="w-full h-96 object-cover rounded-xl"
                alt={`${vehicle.make} ${vehicle.model}`}
              />
              <div className="grid grid-cols-3 gap-2">
                {vehicle.images.slice(0, 3).map((img, index) => (
                  <img
                    key={index}
                    src={
                      img.image
                        ? `${img.image}`
                        : "/placeholder-car.jpg"
                    }
                    className="h-32 w-full object-cover rounded-md"
                    alt={`Preview ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <Badge badgeContent={vehicle.bid_count} color="error">
                  <TrendingUp className="text-gray-400" />
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Chip
                  label={`$${vehicle.price.toLocaleString()}`}
                  sx={{ backgroundColor: "#dc2626", color: "white" }}
                />
                {vehicle.listing_type === "marketplace" && (
                  <div className="flex items-center text-red-500">
                    <Clock className="mr-1" />
                    <span>Marketplace</span>
                  </div>
                )}
              </div>

              <Divider className="!my-6" />

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Gauge className="mr-2" />
                  <span>{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex items-center">
                  <Tag className="mr-2" />
                  <span>{vehicle.body_type || "Sedan"}</span>
                </div>
                <div className="flex items-center">
                  <Map className="mr-2" />
                  <span>{vehicle.location}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="mr-2" />
                  <span>{vehicle.vin || "N/A"}</span>
                </div>
              </div>

              <Divider className="!my-6" />

              {/* Bid/Quote Section */}
              {vehicle.listing_type === "marketplace" ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Make an offer</h3>
                  {isAuthenticated ? (
                    <>
                      <TextField
                        fullWidth
                        type="number"
                        label="Bid Amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        InputProps={{
                          startAdornment: <DollarSign className="mr-2" />,
                        }}
                      />
                      <Divider className="!my-2" />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Message to Seller"
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                      />
                      <Divider className="!my-2" />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handlePlaceBid}
                        sx={{ backgroundColor: "#dc2626" }}
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
                        sx={{ backgroundColor: "#dc2626" }}
                      >
                        Login to Make an Offer
                      </Button>
                      <Divider className="!my-2">or</Divider>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setShowQuoteModal(true)}
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
                  sx={{ backgroundColor: "#dc2626" }}
                >
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <h2 className="text-2xl font-bold mb-4">Similar Vehicles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Quote Modal (similar to existing) */}
      <Dialog open={showQuoteModal} onClose={() => setShowQuoteModal(false)}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Get Vehicle Quote</h3>
            <IconButton onClick={() => setShowQuoteModal(false)}>
              <X />
            </IconButton>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
               handleSubmitQuote();
              // Handle quote submission
              setShowQuoteModal(false);
              setSnackbar({
                open: true,
                message: "Quote request submitted successfully!",
                severity: "success",
              });
            }}
          >
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Full Name"
                sx={{ paddingBottom: "0.5rem" }}
                required
                value={quoteForm.full_name}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, full_name: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Email Address"
                sx={{ paddingBottom: "0.5rem" }}
                type="email"
                required
                value={quoteForm.email}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, email: e.target.value })
                }
              />

              <FormControl fullWidth sx={{ paddingBottom: "0.5rem" }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={quoteForm.country}
                  label="Country"
                  sx={{ paddingBottom: "0.5rem" }}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, country: e.target.value })
                  }
                  required
                >
                  {/* Add countries list - you might want to import a full list */}
                  <MenuItem value="USA">United States</MenuItem>
                  <MenuItem value="UK">United Kingdom</MenuItem>
                  <MenuItem value="Germany">Germany</MenuItem>
                  {/* ... more countries */}
                </Select>
              </FormControl>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="City"
                  sx={{ paddingBottom: "0.5rem" }}
                  required
                  value={quoteForm.city}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, city: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Telephone"
                  sx={{ paddingBottom: "0.5rem" }}
                  type="tel"
                  required
                  value={quoteForm.telephone}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, telephone: e.target.value })
                  }
                />
              </div>

              <TextField
                fullWidth
                label="Address"
                sx={{ paddingBottom: "0.5rem" }}
                multiline
                rows={2}
                value={quoteForm.address}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, address: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Additional Notes"
                sx={{ paddingBottom: "0.5rem" }}
                placeholder="Any specific requirements or details?"
                multiline
                rows={3}
                value={quoteForm.note}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, note: e.target.value })
                }
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  "&:hover": { backgroundColor: "#2563eb" },
                }}
              >
                Submit Quote Request
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
