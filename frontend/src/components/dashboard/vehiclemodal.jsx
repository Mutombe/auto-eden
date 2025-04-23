// src/components/VehicleDialog.jsx
import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogTitle, Box, TextField, Select, MenuItem, 
  Button, Typography, IconButton, Grid
} from '@mui/material';
import { X, Upload, Trash } from 'lucide-react';

const VehicleDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  editVehicle = null,
  isSubmitting = false 
}) => {
    const [formData, setFormData] = useState({
        make: editVehicle?.make || '',
        model: editVehicle?.model || '',
        year: editVehicle?.year || new Date().getFullYear(),
        price: editVehicle?.price || '',
        mileage: editVehicle?.mileage || '',
        vin: editVehicle?.vin || '',
        listingType: editVehicle?.listingType || 'marketplace',
        images: editVehicle?.images || []
      });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const validateForm = () => {
    const errors = {};
    if (!formData.make) errors.make = 'Make is required';
    if (!formData.model) errors.model = 'Model is required';
    if (!formData.year) errors.year = 'Year is required';
    if (!formData.mileage) errors.mileage = 'Mileage is required';
    if (!formData.vin) errors.vin = 'VIN is required';
    if (!formData.price) errors.price = 'Price is required';
    if (imageFiles.length === 0) errors.images = 'At least one image is required';
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...files]);
      
      // Create preview URLs for display
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
      
      // Update form data with file objects
      setFormData({
        ...formData,
        images: [...formData.images, ...files]
      });
    }
  };

  const removeImage = (index) => {
    // Remove image from the arrays
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);

    const updatedPreviews = [...previewUrls];
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);

    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const handleSubmit1 = () => {
    onSubmit({
      ...formData,
      images: imageFiles // Pass the actual File objects
    });
  };
  
  const handleSubmit = () => {
    const errors = validateForm();
    const formDataObj = new FormData();
    
    // Append all required fields
    formDataObj.append('make', formData.make);
    formDataObj.append('model', formData.model);
    formDataObj.append('year', formData.year);
    formDataObj.append('mileage', formData.mileage);
    formDataObj.append('vin', formData.vin);
    formDataObj.append('listing_type', formData.listingType);
    
    // Append price based on listing type
    if (formData.listingType === 'marketplace') {
      formDataObj.append('price', formData.price);
    } else {
      formDataObj.append('proposed_price', formData.price);
    }
    
    // Append images
    imageFiles.forEach((file, index) => {
      formDataObj.append(`image_files`, file);
    });
  
    onSubmit(formDataObj);
  };



  const handleClose = () => {
    // Clean up preview URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setImageFiles([]);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          {editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
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
                border: '1px dashed #ccc',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }
              }}
              onClick={() => document.getElementById('vehicle-images').click()}
            >
              <Upload size={24} color="#666" />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Click to upload images (JPG, PNG)
              </Typography>
              <input
                id="vehicle-images"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {previewUrls.map((url, index) => (
                  <Grid item xs={4} sm={3} key={index}>
                    <Box 
                      sx={{ 
                        position: 'relative', 
                        height: 80, 
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <img 
                        src={url} 
                        alt={`Vehicle image ${index + 1}`} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          padding: '2px',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)'
                          }
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
            <Button 
              variant="outlined" 
              fullWidth
              onClick={handleClose}
            >
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
    !formData.vin ||
    imageFiles.length === 0
  }
>
  {isSubmitting ? 'Submitting...' : editVehicle ? 'Update Vehicle' : 'Add Vehicle'}
</Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDialog;