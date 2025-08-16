// Enhanced Quote Request Component with proper form handling and validation
import React, { useState } from "react";
import {
  Dialog,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Box
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { Close, CarRental, Email, Phone, LocationOn } from "@mui/icons-material";
import { requestQuote } from "../../redux/slices/quoteSlice";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
  "Denmark", "Egypt", "Finland", "France", "Germany", "Ghana", "Greece",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Japan", "Jordan", "Kenya", "Kuwait", "Lebanon", "Malaysia", "Mexico",
  "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
  "Philippines", "Poland", "Portugal", "Qatar", "Russia", "Saudi Arabia",
  "Singapore", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden",
  "Switzerland", "Thailand", "Turkey", "UAE", "UK", "USA", "Ukraine",
  "Vietnam", "Yemen", "Zimbabwe"
];

const QuoteRequestModal = ({ 
  open, 
  onClose, 
  vehicle, 
  vehicleId 
}) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.quotes);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    city: "",
    address: "",
    telephone: "",
    note: "",
    status: "pending",
  priority: "medium"
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.country) {
      errors.country = "Please select your country";
    }
    
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    
    if (!formData.telephone.trim()) {
      errors.telephone = "Phone number is required";
    } else if (!/^[\+]?[\d\s\-\(\)]{8,}$/.test(formData.telephone)) {
      errors.telephone = "Please enter a valid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please correct the errors in the form",
        severity: "error"
      });
      return;
    }

    try {
      const quoteData = {
        ...formData,
        vehicleId: vehicleId,
        // Remove vehicleId from the data that goes to the backend
        // as it's passed in the URL
      };
      
      const result = await dispatch(requestQuote(quoteData)).unwrap();
      console.log('Quote request result:', result);
      
      setSnackbar({
        open: true,
        message: "Quote request submitted successfully! Check your email for the detailed quotation.",
        severity: "success"
      });
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        country: "",
        city: "",
        address: "",
        telephone: "",
        note: ""
      });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Quote submission error:', error);
      setSnackbar({
        open: true,
        message: error.detail || "Failed to submit quote request. Please try again.",
        severity: "error"
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxWidth: "600px",
            margin: "20px"
          }
        }}
      >
        <Box sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
              p: 3,
              position: "relative"
            }}
          >
            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
              }}
            >
              <Close />
            </IconButton>
            
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CarRental sx={{ mr: 2, fontSize: 30 }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                Request Vehicle Quote
              </Typography>
            </Box>
            
            {vehicle && (
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {vehicle.make} {vehicle.model}
                {vehicle.year && ` (${vehicle.year})`}
              </Typography>
            )}
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fill out the form below and we'll send you a detailed quotation via email within minutes.
            </Typography>

            {/* Form Fields */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Full Name */}
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: <Box sx={{ mr: 1, color: "text.secondary" }}>👤</Box>
                }}
              />

              {/* Email */}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email || "We'll send your quotation to this email"}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />
                }}
              />

              {/* Country and City */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth error={!!formErrors.country}>
                  <InputLabel>Country *</InputLabel>
                  <Select
                    value={formData.country}
                    label="Country *"
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    disabled={loading}
                    startAdornment={<LocationOn sx={{ mr: 1, color: "text.secondary" }} />}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.country && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formErrors.country}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  error={!!formErrors.city}
                  helperText={formErrors.city}
                  disabled={loading}
                  required
                />
              </Box>

              {/* Phone */}
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleInputChange("telephone", e.target.value)}
                error={!!formErrors.telephone}
                helperText={formErrors.telephone || "Include country code (e.g., +263...)"}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: "text.secondary" }} />
                }}
              />

              {/* Address */}
              <TextField
                fullWidth
                label="Address (Optional)"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={loading}
                multiline
                rows={2}
                helperText="Street address or delivery location"
              />

              {/* Additional Notes */}
              <TextField
                fullWidth
                label="Additional Notes (Optional)"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                disabled={loading}
                multiline
                rows={3}
                placeholder="Any specific requirements, questions, or details about your purchase?"
                helperText="Tell us about any specific requirements or questions you have"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                  },
                  "&:disabled": {
                    background: "#9ca3af"
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                    Submitting Request...
                  </>
                ) : (
                  "Submit Quote Request"
                )}
              </Button>

              {/* Disclaimer */}
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
                🔒 Your information is secure and will only be used to process your quote request.
                You'll receive a detailed PDF quotation via email.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuoteRequestModal;