// src/pages/VehicleDetailsModal.jsx
import React, { useState } from "react";
import { formatMediaUrl } from "../../utils/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Avatar,
  useMediaQuery,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Fade,
  Backdrop,
} from "@mui/material";
import {
  Gauge,
  Calendar,
  DollarSign,
  Car,
  Fuel,
  MapPin,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ImageIcon,
} from "lucide-react";

const VehicleDetailsModal = ({ open, onClose, vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  if (!vehicle) return null;

  // Extract image URLs from the vehicle.images array
  // vehicle.images is an array of objects with 'image' field containing the URL
  const vehicleImages = vehicle.images?.map((img) => img.image) || [];

  // Fallback demo images if no images exist (remove this in production)
  const fallbackImages = [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop",
  ];

  // Use actual images if available, otherwise use fallback for demo
  const displayImages =
    vehicleImages.length > 0 ? vehicleImages : fallbackImages;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const openImagePreview = () => {
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            overflow: "hidden",
          },
        }}
      >
        {/* Header with gradient background */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #e41c38 0%, #c4102a 100%)",
            color: "white",
            p: 0,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={3}
          >
            <Box>
              <Typography variant="h5" fontWeight={700} mb={0.5}>
                {vehicle.make} {vehicle.model}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {vehicle.year} • {vehicle.mileage?.toLocaleString()} km
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <X size={24} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Grid container>
            {/* Image Carousel Section */}
            <Grid item xs={12} md={7}>
              <Box sx={{ position: "relative", height: { xs: 300, md: 500 } }}>
                {displayImages.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <Box
                      component="img"
                      src={displayImages[currentImageIndex]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                      onClick={openImagePreview}
                      onError={(e) => {
                        // Handle broken image links
                        e.target.style.display = "none";
                      }}
                    />

                    {/* Navigation Arrows */}
                    {displayImages.length > 1 && (
                      <>
                        <IconButton
                          onClick={prevImage}
                          sx={{
                            position: "absolute",
                            left: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                            },
                          }}
                        >
                          <ChevronLeft />
                        </IconButton>
                        <IconButton
                          onClick={nextImage}
                          sx={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                            },
                          }}
                        >
                          <ChevronRight />
                        </IconButton>
                      </>
                    )}

                    {/* Image Counter */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ImageIcon size={16} />
                      <Typography variant="caption" fontWeight={500}>
                        {currentImageIndex + 1} / {displayImages.length}
                      </Typography>
                    </Box>

                    {/* Zoom Icon */}
                    <IconButton
                      onClick={openImagePreview}
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                        },
                      }}
                    >
                      <ZoomIn size={20} />
                    </IconButton>

                    {/* Thumbnail Strip */}
                    {displayImages.length > 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          display: "flex",
                          gap: 1,
                          p: 2,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          overflowX: "auto",
                        }}
                      >
                        {displayImages.map((image, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            onClick={() => setCurrentImageIndex(index)}
                            sx={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 1,
                              cursor: "pointer",
                              border:
                                index === currentImageIndex
                                  ? "2px solid #e41c38"
                                  : "2px solid transparent",
                              opacity: index === currentImageIndex ? 1 : 0.7,
                              transition: "all 0.3s ease",
                              flexShrink: 0,
                              "&:hover": {
                                opacity: 1,
                              },
                            }}
                            onError={(e) => {
                              // Hide broken thumbnail images
                              e.target.style.display = "none";
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </>
                ) : (
                  // No images placeholder
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      backgroundColor: "#f8f9fa",
                      color: "#6c757d",
                    }}
                  >
                    <Car size={64} />
                    <Typography variant="h6" mt={2} fontWeight={500}>
                      No Images Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vehicle images not provided
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Vehicle Details Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, height: { md: 500 }, overflowY: "auto" }}>
                {/* Price Card */}
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <DollarSign size={20} color="#e41c38" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {vehicle.listing_type === "marketplace"
                          ? "Listed Price"
                          : "Proposed Price"}
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="#e41c38" fontWeight={700}>
                      $
                      {Number(
                        vehicle.listing_type === "marketplace"
                          ? vehicle.price
                          : vehicle.proposed_price
                      ).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Status Chips */}
                <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                  <Chip
                    label={
                      vehicle.listing_type === "marketplace"
                        ? "Marketplace"
                        : "Instant Sale"
                    }
                    color="primary"
                    variant="filled"
                  />
                  <Chip
                    label={vehicle.verification_state}
                    color={
                      vehicle.verification_state === "physical"
                        ? "success"
                        : vehicle.verification_state === "rejected"
                        ? "error"
                        : "warning"
                    }
                    variant="filled"
                  />
                </Box>

                {/* Vehicle Specifications */}
                <Card elevation={0} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={2}
                      color="#333"
                    >
                      Vehicle Specifications
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Calendar size={16} color="#666" />
                          <Typography variant="body2" color="text.secondary">
                            Year
                          </Typography>
                        </Box>
                        <Typography fontWeight={600} color="#333">
                          {vehicle.year}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Gauge size={16} color="#666" />
                          <Typography variant="body2" color="text.secondary">
                            Mileage
                          </Typography>
                        </Box>
                        <Typography fontWeight={600} color="#333">
                          {vehicle.mileage?.toLocaleString()} km
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Fuel size={16} color="#666" />
                          <Typography variant="body2" color="text.secondary">
                            Fuel Type
                          </Typography>
                        </Box>
                        <Typography fontWeight={600} color="#333">
                          {vehicle.fuel_type || "Not specified"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <MapPin size={16} color="#666" />
                          <Typography variant="body2" color="text.secondary">
                            Location
                          </Typography>
                        </Box>
                        <Typography fontWeight={600} color="#333">
                          {vehicle.location || "Not specified"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* VIN Information */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      mb={2}
                      color="#333"
                    >
                      Vehicle Identification
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Shield size={16} color="#666" />
                      <Typography variant="body2" color="text.secondary">
                        VIN Number
                      </Typography>
                    </Box>
                    <Typography
                      fontWeight={600}
                      color="#333"
                      sx={{
                        fontFamily: "monospace",
                        backgroundColor: "#f8f9fa",
                        p: 1,
                        borderRadius: 1,
                        fontSize: "0.9rem",
                      }}
                    >
                      {vehicle.vin || "Not Available"}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, backgroundColor: "#f8f9fa" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Screen Image Preview */}
      <Dialog
        open={showImagePreview}
        onClose={closeImagePreview}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            boxShadow: "none",
            margin: 0,
            maxHeight: "100vh",
            maxWidth: "100vw",
            borderRadius: 0,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 2,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={closeImagePreview}
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              zIndex: 1000,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <X size={24} />
          </IconButton>

          {/* Navigation Arrows for Preview */}
          {vehicleImages.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 20,
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  zIndex: 1000,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                <ChevronLeft size={32} />
              </IconButton>
              <IconButton
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 20,
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  zIndex: 1000,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                <ChevronRight size={32} />
              </IconButton>
            </>
          )}

          {/* Full Size Image */}
          <Box
            component="img"
            src={formatMediaUrl(vehicleImages[currentImageIndex])}
            alt={`${vehicle.make} ${vehicle.model} - Image ${
              currentImageIndex + 1
            }`}
            sx={{
              maxWidth: "95%",
              maxHeight: "95%",
              objectFit: "contain",
              borderRadius: 1,
            }}
            onError={(e) => {
              e.target.src = "/placeholder-car.jpg";
            }}
          />
          {/* Image Counter for Preview */}
          <Box
            sx={{
              position: "absolute",
              bottom: 30,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ImageIcon size={18} />
            <Typography variant="body1" fontWeight={500}>
              {currentImageIndex + 1} of {vehicleImages.length}
            </Typography>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default VehicleDetailsModal;
