import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Button,
  Avatar,
  Stack,
  Paper,
  Skeleton,
  Badge,
} from '@mui/material';
import {
  X,
  Car,
  Calendar,
  Gauge,
  MapPin,
  DollarSign,
  Shield,
  Eye,
  EyeOff,
  Fuel,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  User,
  Phone,
  Mail,
  Star,
  Award,
  ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from '../../utils/smartImage';
// Image Gallery Component
// --- Example 4: Advanced Image Gallery Component (Full Implementation) ---
const ImageGallery = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // These hooks are assumed to be imported from Material-UI
  // const theme = useTheme(); 
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = false; // Mock value for example

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          height: { xs: 250, sm: 300, md: 400 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          border: '2px dashed #ccc',
        }}
      >
        {/* <ImageIcon size={48} color="#999" /> */}
        <Typography variant="body1" color="text.secondary" mt={1}>
          No images available
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div // Wrap ImageWithFallback with motion.div to apply animations
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ImageWithFallback
            src={images[currentIndex]}
            alt={`Vehicle image ${currentIndex + 1}`}
            style={{
              width: '100%',
              height: isMobile ? '250px' : '400px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </motion.div>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <IconButton onClick={prevImage} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
              {/* <ChevronLeft /> */}
            </IconButton>
            <IconButton onClick={nextImage} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
              {/* <ChevronRight /> */}
            </IconButton>
          </>
        )}

        {/* Fullscreen Button */}
        <IconButton onClick={() => setIsFullscreen(true)} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
          {/* <Maximize2 size={20} /> */}
        </IconButton>

        {/* Image Counter */}
        {images.length > 1 && (
          <Box sx={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.875rem' }}>
            {currentIndex + 1} / {images.length}
          </Box>
        )}
      </Box>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {images.map((image, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{ minWidth: 80, height: 60, borderRadius: 1, overflow: 'hidden', cursor: 'pointer', border: index === currentIndex ? '2px solid #e41c38' : '2px solid transparent', transition: 'border-color 0.2s' }}
            >
              <ImageWithFallback
                src={image}
                alt={`Thumbnail ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onClose={() => setIsFullscreen(false)} maxWidth={false} fullScreen sx={{ '& .MuiDialog-paper': { backgroundColor: 'rgba(0, 0, 0, 0.9)' } }}>
        <Box sx={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={() => setIsFullscreen(false)} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 1 }}>
            {/* <X /> */}
          </IconButton>
          
          <motion.div // Wrap ImageWithFallback for animations
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: '90%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ImageWithFallback
              src={images[currentIndex]}
              alt={`Vehicle image ${currentIndex + 1}`}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </motion.div>
          
          {images.length > 1 && (
            <>
              <IconButton onClick={prevImage} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>
                {/* <ChevronLeft /> */}
              </IconButton>
              <IconButton onClick={nextImage} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>
                {/* <ChevronRight /> */}
              </IconButton>
            </>
          )}
        </Box>
      </Dialog>
    </>
  );
};


// Status Badge Component
const StatusBadge = ({ status, listingType }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'physical':
        return {
          icon: <CheckCircle size={16} />,
          label: 'Physically Verified',
          color: 'success',
          bgcolor: '#e8f5e8',
          textColor: '#2e7d32',
        };
      case 'digital':
        return {
          icon: <Shield size={16} />,
          label: 'Digitally Verified',
          color: 'info',
          bgcolor: '#e3f2fd',
          textColor: '#1976d2',
        };
      case 'rejected':
        return {
          icon: <XCircle size={16} />,
          label: 'Rejected',
          color: 'error',
          bgcolor: '#ffebee',
          textColor: '#d32f2f',
        };
      default:
        return {
          icon: <AlertCircle size={16} />,
          label: 'Pending Verification',
          color: 'warning',
          bgcolor: '#fff3e0',
          textColor: '#ed6c02',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: config.bgcolor,
          border: `1px solid ${config.textColor}20`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {config.icon}
        <Typography variant="body2" fontWeight={500} color={config.textColor}>
          {config.label}
        </Typography>
      </Paper>
      
      <Chip
        label={listingType === 'marketplace' ? 'Marketplace' : 'Instant Sale'}
        variant="outlined"
        size="small"
        sx={{ alignSelf: 'center' }}
      />
    </Box>
  );
};

// Vehicle Details Modal Component
const VehicleDetailsModal = ({ open, onClose, vehicle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!vehicle) return null;
  const getImageUrls = (images) => {
    if (!images || !Array.isArray(images)) {
      return [];
    }
    return images.map(imgObj => imgObj.image).filter(Boolean); // .filter(Boolean) removes any null/undefined entries
  };
  
  const vehicleImageUrls = getImageUrls(vehicle.images);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${Number(price).toLocaleString()}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid #eee',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {vehicle.make} {vehicle.model}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {vehicle.year} • VIN: {vehicle.vin || 'Not Available'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <X />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Status and Pricing Section */}
          <Box sx={{ mb: 3 }}>
            <StatusBadge status={vehicle.verification_state} listingType={vehicle.listing_type} />
            <Box sx={{ mt: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}>
              <Typography variant="h4" fontWeight={600} color="primary">
                {formatPrice(vehicle.proposed_price || vehicle.price)}
              </Typography>
              {vehicle.listing_type === 'marketplace' && vehicle.is_visible !== undefined && (
                <Chip
                  icon={vehicle.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  label={vehicle.is_visible ? 'Visible to Public' : 'Hidden from Public'}
                  color={vehicle.is_visible ? 'success' : 'default'}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Image Gallery */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Vehicle Images
            </Typography>
            <ImageGallery images={vehicleImageUrls} />
          </Box>

          {/* Vehicle Information Grid */}
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                    <Car size={20} />
                    Vehicle Details
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Make</Typography>
                      <Typography variant="body2" fontWeight={500}>{vehicle.make}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Model</Typography>
                      <Typography variant="body2" fontWeight={500}>{vehicle.model}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Year</Typography>
                      <Typography variant="body2" fontWeight={500}>{vehicle.year}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Mileage</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {vehicle.mileage?.toLocaleString() || 'N/A'} km
                      </Typography>
                    </Box>
                    {vehicle.fuel_type && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                        <Typography variant="body2" fontWeight={500}>{vehicle.fuel_type}</Typography>
                      </Box>
                    )}
                    {vehicle.location && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Location</Typography>
                        <Typography variant="body2" fontWeight={500}>{vehicle.location}</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Verification Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                    <Shield size={20} />
                    Verification Status
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Current Status</Typography>
                      <Chip
                        size="small"
                        label={vehicle.verification_state === 'physical' ? 'Verified' : vehicle.verification_state}
                        color={
                          vehicle.verification_state === 'physical' ? 'success' :
                          vehicle.verification_state === 'digital' ? 'info' :
                          vehicle.verification_state === 'rejected' ? 'error' : 'warning'
                        }
                      />
                    </Box>
                    
                    {vehicle.digitally_verified_at && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Digital Verification</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(vehicle.digitally_verified_at)}
                        </Typography>
                      </Box>
                    )}
                    
                    {vehicle.physically_verified_at && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Physical Verification</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(vehicle.physically_verified_at)}
                        </Typography>
                      </Box>
                    )}
                    
                    {vehicle.rejection_reason && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>Rejection Reason</Typography>
                        <Paper sx={{ p: 2, backgroundColor: '#ffebee', border: '1px solid #ffcdd2' }}>
                          <Typography variant="body2" color="error.main">
                            {vehicle.rejection_reason}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Listed On</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(vehicle.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Listing Information */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                    <DollarSign size={20} />
                    Listing Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Listing Type</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {vehicle.listing_type === 'marketplace' ? 'Marketplace' : 'Instant Sale'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Price</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatPrice(vehicle.proposed_price || vehicle.price)}
                        </Typography>
                      </Box>
                    </Grid>
                    {vehicle.listing_type === 'marketplace' && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Visibility</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {vehicle.is_visible ? 'Public' : 'Hidden'}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsModal;