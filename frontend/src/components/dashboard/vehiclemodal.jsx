import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { X, Upload, Trash } from "lucide-react";

const VehicleDialog = ({
  open,
  onClose,
  onSubmit,
  editVehicle = null,
  isSubmitting = false,
  submitError = null,
  submitSuccess = null,
}) => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    mileage: "",
    fuel_type: "petrol",
    vin: "",
    description: "", 
    listingType: "marketplace",
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [formError, setFormError] = useState(null);

  // Initialize form with editVehicle data when it changes
  useEffect(() => {
    if (open) setFormError(null);
  }, [open]);

  useEffect(() => {
    if (editVehicle) {
      setFormData({
        make: editVehicle.make || "",
        model: editVehicle.model || "",
        year: editVehicle.year || new Date().getFullYear(),
        price: editVehicle.price || editVehicle.proposed_price || "",
        mileage: editVehicle.mileage || "",
        fuel_type: editVehicle.fuel_type || "petrol",
        vin: editVehicle.vin || "",
        description: editVehicle.description || "", 
        listingType: editVehicle.listing_type || "marketplace",
        images: editVehicle.images || [],
      });

      // If editVehicle has images, set them as preview URLs
      if (editVehicle.images && editVehicle.images.length > 0) {
        const urls = editVehicle.images
          .map((image) => {
            if (typeof image === "string") {
              return image; // It's already a URL
            } else if (image instanceof File) {
              return URL.createObjectURL(image);
            }
            return null;
          })
          .filter(Boolean);
        setPreviewUrls(urls);
      }
    } else {
      // Reset form for new vehicle
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        price: "",
        mileage: "",
        fuel_type: "petrol",
        vin: "",
        description: "", 
        listingType: "marketplace",
        images: [],
      });
      setPreviewUrls([]);
      setImageFiles([]);
    }
  }, [editVehicle]);

  const validateForm = () => {
    const errors = {};
    if (!formData.make) errors.make = "Make is required";
    if (!formData.model) errors.model = "Model is required";
    if (!formData.year) errors.year = "Year is required";
    if (!formData.mileage) errors.mileage = "Mileage is required";
    if (!formData.fuel_type) errors.fuel_type = "Fuel type is required";
    if (!formData.vin) errors.vin = "VIN is required";
    if (!formData.price) errors.price = "Price is required";
    if (imageFiles.length === 0 && formData.images.length === 0)
      errors.images = "At least one image is required";
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...files]);

      // Create preview URLs for display - only for File objects
      const newPreviewUrls = files
        .map((file) => {
          if (file instanceof File) {
            return URL.createObjectURL(file);
          }
          return null;
        })
        .filter(Boolean);

      setPreviewUrls([...previewUrls, ...newPreviewUrls]);

      // Update form data with file objects
      setFormData({
        ...formData,
        images: [...formData.images, ...files],
      });
    }
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      // Remove existing image
      const updatedImages = [...formData.images];
      updatedImages.splice(index, 1);
      setFormData({
        ...formData,
        images: updatedImages,
      });

      // Also remove from preview URLs if it's there
      const updatedPreviews = [...previewUrls];
      if (updatedPreviews[index]) {
        URL.revokeObjectURL(updatedPreviews[index]);
      }
      updatedPreviews.splice(index, 1);
      setPreviewUrls(updatedPreviews);
    } else {
      // Remove new image file
      const updatedFiles = [...imageFiles];
      updatedFiles.splice(index, 1);
      setImageFiles(updatedFiles);

      const updatedPreviews = [...previewUrls];
      // Find the index in previewUrls (after existing images)
      const newImageIndex = formData.images.length - imageFiles.length + index;
      if (updatedPreviews[newImageIndex]) {
        URL.revokeObjectURL(updatedPreviews[newImageIndex]);
      }
      updatedPreviews.splice(newImageIndex, 1);
      setPreviewUrls(updatedPreviews);

      // Also remove from formData.images
      const updatedImages = [...formData.images];
      const imageIndex = formData.images.length - imageFiles.length + index;
      updatedImages.splice(imageIndex, 1);
      setFormData({
        ...formData,
        images: updatedImages,
      });
    }
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormError("Please fill all required fields"); // Set form-level error
      return;
    }

    const formDataObj = new FormData();

    // Append all required fields
    formDataObj.append("make", formData.make);
    formDataObj.append("model", formData.model);
    formDataObj.append("year", formData.year);
    formDataObj.append("mileage", formData.mileage);
    formDataObj.append("fuel_type", formData.fuel_type);
    formDataObj.append("vin", formData.vin);
    formDataObj.append("description", formData.description); 
    formDataObj.append("listing_type", formData.listingType);

    // Append price based on listing type
    if (formData.listingType === "marketplace") {
      formDataObj.append("price", formData.price);
    } else {
      formDataObj.append("proposed_price", formData.price);
    }

    // Append new image files only
    imageFiles.forEach((file) => {
      formDataObj.append(`image_files`, file);
    });

    // If editing, include the remaining existing images
    if (editVehicle) {
      formData.images.forEach((image, index) => {
        if (typeof image === "string") {
          // It's an existing image URL
          formDataObj.append(`existing_images[${index}]`, image);
        }
      });
    }

    onSubmit(formDataObj);
  };

    const handleClose = () => {
    // Clean up preview URLs to prevent memory leaks
    previewUrls.forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });

    // Reset form state
    setPreviewUrls([]);
    setImageFiles([]);
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      mileage: "",
      fuel_type: "petrol",
      vin: "",
      listingType: "marketplace",
      images: [],
    });
    setFormError(null);

    // Close the dialog
    onClose();
  };
  // Inside VehicleDialog component
  useEffect(() => {
    if (submitSuccess) {
      setSnackbarMessage(
        editVehicle
          ? "Vehicle updated successfully!"
          : "Vehicle added successfully!"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Close dialog after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  }, [submitSuccess, editVehicle, handleClose]);

  useEffect(() => {
    if (submitError) {
      setFormError(submitError);
    }
  }, [submitError]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Helper function to get image source URL

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            {editVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box
            component="form"
            sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              fullWidth
              label="Make"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{
                inputProps: { min: 1900, max: new Date().getFullYear() + 1 },
              }}
            />

            <TextField
              fullWidth
              label="VIN (Vehicle Identification Number)"
              name="vin"
              value={formData.vin}
              onChange={handleInputChange}
              required
              variant="outlined"
              sx={{ mt: 2 }}
            />

            <TextField
              fullWidth
              label="Mileage"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
            />
            <Select
              fullWidth
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleInputChange}
              variant="outlined"
              displayEmpty
            >
              <MenuItem value="petrol">Petrol</MenuItem>
              <MenuItem value="diesel">Diesel</MenuItem>
              <MenuItem value="electric">Electric</MenuItem>
            </Select>

            <TextField
              fullWidth
              label="Price ($)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
            />
          <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={4}
          variant="outlined"
        />

            <Select
              fullWidth
              name="listingType"
              value={formData.listingType}
              onChange={handleInputChange}
              variant="outlined"
              displayEmpty
            >
              <MenuItem value="marketplace">Marketplace Listing</MenuItem>
              <MenuItem value="instant_sale">Instant Sale</MenuItem>
            </Select>

            {/* Image Upload Section */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight={500} mb={1}>
                Vehicle Images
              </Typography>

              <Box
                sx={{
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                  p: 2,
                  textAlign: "center",
                  mb: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.02)",
                  },
                }}
                onClick={() =>
                  document.getElementById("vehicle-images").click()
                }
              >
                <Upload size={24} color="#666" />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Click to upload images (JPG, PNG)
                </Typography>
                <input
                  id="vehicle-images"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp,image/svg+xml"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </Box>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {previewUrls.map((url, index) => (
                    <Grid item xs={4} sm={3} key={`image-${index}`}>
                      <Box
                        sx={{
                          position: "relative",
                          height: 80,
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={url}
                          alt={`Vehicle image ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            console.error("Failed to load image:", url);
                            e.target.style.display = "none";
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            removeImage(
                              index,
                              typeof formData.images[index] === "string"
                            )
                          }
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            color: "white",
                            padding: "2px",
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.7)",
                            },
                          }}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <Button variant="outlined" fullWidth onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.make ||
                  !formData.model ||
                  !formData.year ||
                  !formData.price ||
                  !formData.mileage ||
                  !formData.fuel_type ||
                  !formData.vin ||
                  (imageFiles.length === 0 && formData.images.length === 0)
                }
              >
                {isSubmitting
                  ? "Submitting..."
                  : editVehicle
                  ? "Update Vehicle"
                  : "Add Vehicle"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VehicleDialog;
