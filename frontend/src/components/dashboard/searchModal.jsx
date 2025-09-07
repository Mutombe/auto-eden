// src/components/SearchModal.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createSearch, updateSearch } from '../../redux/slices/searchSlice';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

const SearchModal = ({ open, onClose, editSearch }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    make: editSearch?.make || '',
    model: editSearch?.model || '',
    min_year: editSearch?.min_year || new Date().getFullYear() - 5,
    max_year: editSearch?.max_year || new Date().getFullYear(),
    max_price: editSearch?.max_price || '',
  });

  const handleSubmit = () => {
    const payload = {
      ...formData,
      max_price: Number(formData.max_price),
    };

    if (editSearch) {
      dispatch(updateSearch({ id: editSearch.id, data: payload }));
    } else {
      dispatch(createSearch(payload));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editSearch ? 'Edit Search' : 'New Vehicle Search'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
          <TextField
            label="Make"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            fullWidth
          />
          <TextField
            label="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            fullWidth
          />
          <TextField
            label="Min Year"
            type="number"
            value={formData.min_year}
            onChange={(e) => setFormData({ ...formData, min_year: e.target.value })}
            InputProps={{
              inputProps: { min: 1900, max: new Date().getFullYear() }
            }}
          />
          <TextField
            label="Max Year"
            type="number"
            value={formData.max_year}
            onChange={(e) => setFormData({ ...formData, max_year: e.target.value })}
            InputProps={{
              inputProps: { min: formData.min_year, max: new Date().getFullYear() }
            }}
          />
          <TextField
            label="Max Price"
            type="number"
            value={formData.max_price}
            onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {editSearch ? 'Update Search' : 'Save Search'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchModal;