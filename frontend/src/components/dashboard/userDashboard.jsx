// src/pages/DashboardPage.jsx
import React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserVehicles,
  deleteVehicle,
  createVehicle,
  updateVehicle,
  toggleVisibility,
  fetchVehicleDetails,
} from "../../redux/slices/vehicleSlice";
import SearchModal from "./searchModal";
import {
  fetchUserSearches,
  deleteSearch,
  createSearch,
} from "../../redux/slices/searchSlice";
import { fetchUserBids, fetchBidderDetails } from "../../redux/slices/bidSlice";
import {
  Tab,
  Tabs,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Typography,
  Box,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
  Skeleton,
  Avatar,
} from "@mui/material";
import {
  Search,
  Car,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  Gauge,
  Shield,
} from "lucide-react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import VehicleDialog from "./vehiclemodal";
import VehicleDetailsModal from "./vehiclemodal2";

// Create theme with brand colors
const customTheme = createTheme({
  palette: {
    primary: {
      main: "#e41c38", // Red
    },
    secondary: {
      main: "#333333", // Black
    },
    background: {
      default: "#f7f7f7", // Light gray
      paper: "#ffffff", // White
    },
    text: {
      primary: "#333333", // Black
      secondary: "#666666", // Dark gray
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#e41c38",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#c4102a",
          },
        },
        outlined: {
          borderColor: "#e41c38",
          color: "#e41c38",
          "&:hover": {
            borderColor: "#c4102a",
            backgroundColor: "rgba(228, 28, 56, 0.04)",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#e41c38",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#e41c38",
          },
        },
      },
    },
  },
});

// Hero section component with animation
const DashboardHero = ({ onAddVehicle }) => {
  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #1a1a1a, #e41c38)",
        color: "white",
        pt: { xs: 6, sm: 8, md: 10 },
        pb: { xs: 4, sm: 5, md: 6 },
        mb: 4,
      }}
    >
      <Box
        className="max-w-7xl mx-auto pt-10"
        sx={{
          px: { xs: 2, sm: 4 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            }}
          >
            Vehicle Dashboard
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.85)",
              maxWidth: "700px",
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
              mb: 2,
            }}
          >
            Manage your vehicle listings and track offers in real-time. Add your
            vehicle details to receive an instant evaluation.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                size="large"
                onClick={onAddVehicle}
                sx={{
                  bgcolor: "white",
                  color: "#e41c38",
                  borderRadius: "8px",
                  px: 3,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                Add New Vehicle
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

// Vehicle Card Skeleton Component
const VehicleCardSkeleton = () => (
  <Grid item xs={12}>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid #eee",
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box flex={1}>
          <Skeleton variant="text" width={250} height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={100} height={28} sx={{ mb: 2 }} />
          <Box display="flex" gap={1} flexWrap="wrap">
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={120} height={24} />
            <Skeleton variant="rounded" width={90} height={24} />
          </Box>
        </Box>
        <Box display="flex" gap={1} mt={{ xs: 2, sm: 0 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </Box>
    </Paper>
  </Grid>
);

// Bid Card Skeleton Component
const BidCardSkeleton = () => (
  <Grid item xs={12}>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid #eee",
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box flex={1} mr={2}>
          <Box display="flex" alignItems="center" gap={2} mb={1.5}>
            <Skeleton variant="text" width={200} height={30} />
          </Box>
          <Box display="flex" gap={1}>
            <Skeleton variant="rounded" width={140} height={24} />
            <Skeleton variant="rounded" width={120} height={24} />
          </Box>
        </Box>
        <Box minWidth={200} mt={{ xs: 2, sm: 0 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width={100} height={20} />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={80} height={24} />
            <Skeleton variant="rounded" width={60} height={24} />
          </Box>
          <Skeleton variant="text" width={120} height={16} />
        </Box>
      </Box>
    </Paper>
  </Grid>
);

// Search Card Skeleton Component
const SearchCardSkeleton = () => (
  <Grid item xs={12}>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid #eee",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box flex={1}>
          <Skeleton variant="text" width={280} height={32} sx={{ mb: 1 }} />
          <Box display="flex" gap={1} flexWrap="wrap">
            <Skeleton variant="rounded" width={120} height={24} />
            <Skeleton variant="rounded" width={140} height={24} />
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={90} height={24} />
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </Box>
    </Paper>
  </Grid>
);

// Multiple Skeleton Loaders Component
const SkeletonList = ({ count = 3, type = "vehicle" }) => {
  const SkeletonComponent = 
    type === "vehicle" ? VehicleCardSkeleton :
    type === "bid" ? BidCardSkeleton :
    SearchCardSkeleton;

  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </Grid>
  );
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { userVehicles, userVehiclesLoading, loading, error } = useSelector((state) => state.vehicles);
  const { items: bids, status: bidStatus } = useSelector((state) => state.bids);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editSearch, setEditSearch] = useState(null);
  const { searches, status: searchStatus } = useSelector(
    (state) => state.searches
  );
  const [activeTab, setActiveTab] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(fetchUserVehicles());
    dispatch(fetchUserBids());
    dispatch(fetchUserSearches());
  }, [dispatch]);

  // Reset submitSuccess when modal opens
  useEffect(() => {
    if (showAddModal) {
      setSubmitSuccess(false);
    }
  }, [showAddModal]);

  const handleSubmit = async (formData) => {
    try {
      if (editVehicle) {
        await dispatch(
          updateVehicle({ id: editVehicle.id, data: formData })
        ).unwrap();
      } else {
        await dispatch(createVehicle(formData)).unwrap();
      }
      // Set success state
      setSubmitSuccess(true);
      // Refetch vehicles
      dispatch(fetchUserVehicles());
    } catch (err) {
      console.error("Submission error:", err);
      // Error will be handled via the error prop
    }
  };

  const handleDialogClose = () => {
    setShowAddModal(false);
    setEditVehicle(null);
    setSubmitSuccess(false);
  };

  const handleEditClick = (vehicle) => {
    setEditVehicle(vehicle);
    setShowAddModal(true);
  };

  const canEditDelete = (vehicle) =>
    vehicle.verification_state === "pending" ||
    vehicle.verification_state === "rejected";

  const handleEditSearch = (search) => {
    setEditSearch(search);
    setShowSearchModal(true);
  };

  const handleSearchModalClose = () => {
    setShowSearchModal(false);
    setEditSearch(null);
  };

  const getStatusColor = (verification_state) => {
    switch (verification_state) {
      case "physical":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const EmptyState = ({ type }) => (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
        border: "1px dashed #ccc",
        minHeight: "300px",
      }}
    >
      {type === "vehicles" ? (
        <>
          <Upload size={64} color="#999" />
          <Typography variant="h6" mt={2} color="text.secondary">
            You haven't uploaded any vehicles yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            sx={{ mt: 2 }}
            onClick={() => setShowAddModal(true)}
          >
            Add Your First Car
          </Button>
        </>
      ) : type === "bids" ? (
        <>
          <AlertCircle size={64} color="#999" />
          <Typography variant="h6" mt={2} color="text.secondary">
            You haven't placed any bids yet
          </Typography>
        </>
      ) : (
        <>
          <Search size={64} color="#999" />
          <Typography variant="h6" mt={2} color="text.secondary">
            You haven't saved any vehicle searches yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
            textAlign="center"
          >
            Save your search criteria to get notified when matching vehicles are
            listed
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            sx={{ mt: 2 }}
            onClick={() => setShowSearchModal(true)}
          >
            Create Your First Search
          </Button>
        </>
      )}
    </Paper>
  );

  const BidItem = ({ bid }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const vehicle = useSelector((state) =>
      state.vehicles.items.find((v) => v.id === bid.vehicle)
    );
    const bidder = useSelector(
      (state) =>
        state.bids.biddersCache[bid.bidder] ||
        (bid.bidder === user?.id ? user : null)
    );

    // Fetch vehicle details if missing
    useEffect(() => {
      if (!vehicle) {
        dispatch(fetchVehicleDetails(bid.vehicle));
      }
    }, [vehicle, bid.vehicle, dispatch]);

    // Fetch bidder details if missing
    useEffect(() => {
      if (!bidder && bid.bidder !== user?.id) {
        dispatch(fetchBidderDetails(bid.bidder));
      }
    }, [bidder, bid.bidder, user?.id, dispatch]);

    return (
      <Grid item xs={12} key={bid.id}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid #eee",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            {/* Vehicle Details Section */}
            <Box flex={1} mr={2}>
              <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                {vehicle ? (
                  <>
                    <Typography variant="h6" fontWeight={600}>
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </Typography>
                  </>
                ) : (
                  <Skeleton variant="text" width={180} height={30} />
                )}
              </Box>

              {vehicle ? (
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip
                    label={`Mileage: ${
                      vehicle.mileage?.toLocaleString() || "N/A"
                    } km`}
                    variant="outlined"
                    size="small"
                    icon={<Gauge size={14} />}
                  />
                </Box>
              ) : (
                <Box display="flex" gap={1}>
                  <Skeleton variant="rounded" width={140} height={24} />
                  <Skeleton variant="rounded" width={160} height={24} />
                </Box>
              )}
            </Box>

            {/* Bid Details Section */}
            <Box minWidth={200} mt={{ xs: 2, sm: 0 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Avatar src={bidder?.avatar} sx={{ width: 32, height: 32 }}>
                  {bidder?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="body2">
                  Bid by
                  <strong> {bidder?.username}</strong>
                </Typography>
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" color="primary" fontWeight={500}>
                  ${Number(bid.amount).toLocaleString()}
                </Typography>
                <Chip
                  label={bid.status}
                  size="small"
                  color={
                    bid.status === "accepted"
                      ? "success"
                      : bid.status === "rejected"
                      ? "error"
                      : "default"
                  }
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Bid placed: {new Date(bid.created_at).toLocaleDateString()}
              </Typography>

              {bid.message && (
                <Box mt={1} p={1} bgcolor="background.default" borderRadius={1}>
                  <Typography variant="caption">Note: {bid.message}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>
    );
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          backgroundColor: "background.default",
          minHeight: "100vh",
          paddingBottom: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Hero Section */}
        <DashboardHero onAddVehicle={() => setShowAddModal(true)} />

        {/* Dashboard Content */}
        <Box
          className="max-w-6xl mx-auto"
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            mx: { xs: 2, sm: 4, md: "auto" },
            mt: { xs: -3, sm: -4 }, // Overlap with hero
            position: "relative",
            zIndex: 10,
            paddingTop: "10px",
            marginTop: "10px",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              mb: 4,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Tab
              label="My Cars"
              icon={<Car size={16} />}
              iconPosition="start"
              sx={{ textTransform: "none", fontWeight: 500 }}
            />
            <Tab
              label="My Bids"
              icon={<AlertCircle size={16} />}
              iconPosition="start"
              sx={{ textTransform: "none", fontWeight: 500 }}
            />
            <Tab
              label="What am I looking for?"
              icon={<Search size={16} />}
              iconPosition="start"
              sx={{ textTransform: "none", fontWeight: 500 }}
            />
          </Tabs>

          {activeTab === 0 ? (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" component="h2">
                  Your Cars
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => setShowAddModal(true)}
                  size={isMobile ? "small" : "medium"}
                  disabled={userVehiclesLoading}
                >
                  Add Car
                </Button>
              </Box>

              {userVehiclesLoading ? (
                <SkeletonList count={3} type="vehicle" />
              ) : userVehicles?.length === 0 ? (
                <EmptyState type="vehicles" />
              ) : (
                <Grid container spacing={3}>
                  {userVehicles?.map((vehicle) => (
                    <Grid item xs={12} key={vehicle.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: "1px solid #eee",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={600} mb={1}>
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </Typography>
                            <Typography
                              variant="body1"
                              color="primary"
                              fontWeight={500}
                              mb={2}
                            >
                              ${Number(vehicle.proposed_price) || vehicle.price}
                            </Typography>
                            <Box
                              display="flex"
                              gap={1}
                              flexWrap="wrap"
                              mb={{ xs: 2, sm: 0 }}
                            >
                              <Chip
                                label={
                                  vehicle.verification_state === "physical"
                                    ? "Verified"
                                    : vehicle.verification_state
                                }
                                color={getStatusColor(
                                  vehicle.verification_state
                                )}
                                size="small"
                              />
                              <Chip
                                label={
                                  vehicle.listing_type === "marketplace"
                                    ? "Marketplace"
                                    : "Instant Sale"
                                }
                                variant="outlined"
                                size="small"
                              />
                              {vehicle.listing_type === "marketplace" &&
                                vehicle.verification_state === "physical" && (
                                  <Chip
                                    label={
                                      vehicle.is_visible ? "Visible" : "Hidden"
                                    }
                                    variant="outlined"
                                    size="small"
                                    color={
                                      vehicle.is_visible ? "success" : "default"
                                    }
                                  />
                                )}
                            </Box>
                          </Box>

                          <Box display="flex" gap={1} mt={{ xs: 2, sm: 0 }}>
                            {canEditDelete(vehicle) && (
                              <>
                                <IconButton
                                  onClick={() => handleEditClick(vehicle)}
                                  sx={{ color: "text.secondary" }}
                                >
                                  <Edit size={18} />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    dispatch(deleteVehicle(vehicle.id))
                                  }
                                  sx={{ color: "error.main" }}
                                >
                                  <Trash size={18} />
                                </IconButton>
                              </>
                            )}
                            <IconButton
                              onClick={() => setSelectedVehicle(vehicle)}
                              sx={{ color: "text.secondary" }}
                            >
                              <Eye size={18} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ) : activeTab === 1 ? (
            <Box>
              <Typography variant="h6" component="h2" mb={3}>
                Your Bids
              </Typography>

              {bidStatus === "loading" ? (
                <SkeletonList count={3} type="bid" />
              ) : bids?.length === 0 ? (
                <EmptyState type="bids" />
              ) : (
                <Grid container spacing={3}>
                  {bids.map((bid) => (
                    <BidItem key={bid.id} bid={bid} />
                  ))}
                </Grid>
              )}
            </Box>
          ) : (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" component="h2">
                  Saved Vehicle Searches
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => setShowSearchModal(true)}
                  size={isMobile ? "small" : "medium"}
                  disabled={searchStatus === "loading"}
                >
                  New Search
                </Button>
              </Box>

              {searchStatus === "loading" ? (
                <SkeletonList count={3} type="search" />
              ) : searches?.length === 0 ? (
                <EmptyState type="searches" />
              ) : (
                <Grid container spacing={3}>
                  {searches?.map((search) => (
                    <Grid item xs={12} key={search.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: "1px solid #eee",
                          position: "relative",
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={600} mb={1}>
                              {search.make} {search.model} ({search.min_year}-
                              {search.max_year})
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <Chip
                                label={`Max Price: $${search.max_price}`}
                                variant="outlined"
                                size="small"
                              />
                              <Chip
                                label={`Max Mileage: ${search.max_mileage}km`}
                                variant="outlined"
                                size="small"
                              />
                              <Chip
                                label={search.status}
                                color={
                                  search.status === "active"
                                    ? "success"
                                    : search.status === "paused"
                                    ? "warning"
                                    : "primary"
                                }
                                size="small"
                              />
                              {search.match_count > 0 && (
                                <Chip
                                  label={`${search.match_count} matches`}
                                  color="primary"
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>
                          <Box display="flex" gap={1}>
                            <IconButton
                              onClick={() => handleEditSearch(search)}
                            >
                              <Edit size={18} />
                            </IconButton>
                            <IconButton
                              onClick={() => dispatch(deleteSearch(search.id))}
                            >
                              <Trash size={18} color="error" />
                            </IconButton>
                          </Box>
                        </Box>
                        {search.last_matched && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            mt={1}
                          >
                            Last match:{" "}
                            {new Date(search.last_matched).toLocaleDateString()}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <VehicleDialog
        open={showAddModal}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        editVehicle={editVehicle}
        isSubmitting={loading}
        submitError={error}
        submitSuccess={submitSuccess}
      />

      <VehicleDetailsModal
        open={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        vehicle={selectedVehicle}
      />

      <SearchModal
        open={showSearchModal}
        onClose={handleSearchModalClose}
        editSearch={editSearch}
        createSearch={createSearch}
      />
    </ThemeProvider>
  );
}

