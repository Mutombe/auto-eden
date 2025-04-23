// src/pages/DashboardPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserVehicles, deleteVehicle, createVehicle, updateVehicle, toggleVisibility } from '../../redux/slices/vehicleSlice';
import { fetchUserBids } from '../../redux/slices/bidSlice';
import { 
  Tab, Tabs, Button, TextField, Dialog, DialogContent, DialogTitle,
  IconButton, Select, MenuItem, Chip, CircularProgress,
  Typography, Box, Grid, Paper, useMediaQuery, useTheme
} from '@mui/material';
import { Car, Plus, Edit, Trash, Eye, EyeOff, AlertCircle, Upload } from 'lucide-react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Import Footer component
import Footer from '../components/Footer';

// Create theme with brand colors
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#e41c38', // Red
    },
    secondary: {
      main: '#333333', // Black
    },
    background: {
      default: '#f7f7f7', // Light gray
      paper: '#ffffff', // White
    },
    text: {
      primary: '#333333', // Black
      secondary: '#666666', // Dark gray
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
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
          backgroundColor: '#e41c38',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#c4102a',
          },
        },
        outlined: {
          borderColor: '#e41c38',
          color: '#e41c38',
          '&:hover': {
            borderColor: '#c4102a',
            backgroundColor: 'rgba(228, 28, 56, 0.04)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#e41c38',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#e41c38',
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
        background: 'linear-gradient(to bottom, #1a1a1a, #e41c38)',
        color: 'white',
        pt: { xs: 6, sm: 8, md: 10 },
        pb: { xs: 4, sm: 5, md: 6 },
        mb: 4
      }}
    >
      <Box 
        className="max-w-7xl mx-auto" 
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
              fontWeight: 'bold', 
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
            }}
          >
            Instant Sale Dashboard
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '700px',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              mb: 2
            }}
          >
            Manage your vehicle listings and track offers in real-time. Add your vehicle details to receive an instant evaluation.
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
                  bgcolor: 'white', 
                  color: '#e41c38',
                  borderRadius: '8px',
                  px: 3,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
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

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { userVehicles, status } = useSelector((state) => state.vehicles);
  const { items: bids, status: bidStatus } = useSelector((state) => state.bids);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    listingType: 'marketplace'
  });

  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    dispatch(fetchUserVehicles());
    dispatch(fetchUserBids());
  }, [dispatch]);

  const handleSubmit = () => {
    if (editVehicle) {
      dispatch(updateVehicle({ id: editVehicle.id, data: formData }));
    } else {
      dispatch(createVehicle(formData));
    }
    setShowAddModal(false);
    setEditVehicle(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      listingType: 'marketplace'
    });
  };

  const canEditDelete = (vehicle) => 
    vehicle.status === 'pending' || vehicle.status === 'rejected';

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const handleEditClick = (vehicle) => {
    setEditVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      listingType: vehicle.listingType
    });
    setShowAddModal(true);
  };

  const handleAddVehicle = () => {
    setShowAddModal(true);
  };

  const handleDialogClose = () => {
    setShowAddModal(false);
    setEditVehicle(null);
    resetForm();
  };

  const EmptyState = ({ type }) => (
    <Paper elevation={0} sx={{ 
      p: 4, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderRadius: 2, 
      backgroundColor: '#f9f9f9',
      border: '1px dashed #ccc',
      minHeight: '300px'
    }}>
      <Upload size={64} color="#999" />
      <Typography variant="h6" mt={2} color="text.secondary">
        You haven't {type === 'vehicles' ? 'uploaded any vehicles' : 'placed any bids'} yet
      </Typography>
      {type === 'vehicles' && (
        <Button 
          variant="contained" 
          startIcon={<Plus />} 
          sx={{ mt: 2 }}
          onClick={() => setShowAddModal(true)}
        >
          Add Your First Car
        </Button>
      )}
    </Paper>
  );

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ 
        backgroundColor: 'background.default', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Hero Section */}
        <DashboardHero onAddVehicle={handleAddVehicle} />
        
        {/* Dashboard Content */}
        <Box 
          className="max-w-6xl mx-auto" 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            boxShadow: 1,
            mx: { xs: 2, sm: 4, md: 'auto' },
            mt: { xs: -3, sm: -4 }, // Overlap with hero
            position: 'relative',
            zIndex: 10,
            width: { xs: 'auto', md: '100%' },
            flex: '1 0 auto' // This allows the content to grow but not shrink
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ 
              mb: 4,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tab 
              label="My Cars" 
              icon={<Car size={16} />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              label="My Bids" 
              icon={<AlertCircle size={16} />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>

          {activeTab === 0 ? (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" component="h2">
                  Your Cars
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Plus size={16} />}
                  onClick={() => setShowAddModal(true)}
                  size={isMobile ? "small" : "medium"}
                >
                  Add Car
                </Button>
              </Box>

              {status === 'loading' ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress color="primary" />
                </Box>
              ) : userVehicles?.length === 0 ? (
                <EmptyState type="vehicles" />
              ) : (
                <Grid container spacing={3}>
                  {userVehicles?.map(vehicle => (
                    <Grid item xs={12} key={vehicle.id}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 2, 
                          border: '1px solid #eee',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Box>
                            <Typography variant="h6" fontWeight={600} mb={1}>
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </Typography>
                            <Typography variant="body1" color="primary" fontWeight={500} mb={2}>
                              ${Number(vehicle.price).toLocaleString()}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap" mb={{ xs: 2, sm: 0 }}>
                              <Chip 
                                label={vehicle.status} 
                                color={getStatusColor(vehicle.status)}
                                size="small"
                              />
                              <Chip 
                                label={vehicle.listingType === 'marketplace' ? 'Marketplace' : 'Instant Sale'} 
                                variant="outlined" 
                                size="small"
                              />
                              {vehicle.listingType === 'marketplace' && vehicle.status === 'verified' && (
                                <Chip 
                                  label={vehicle.is_visible ? "Visible" : "Hidden"} 
                                  variant="outlined" 
                                  size="small"
                                  color={vehicle.is_visible ? "success" : "default"}
                                />
                              )}
                            </Box>
                          </Box>

                          <Box display="flex" gap={1} mt={{ xs: 2, sm: 0 }}>
                            {canEditDelete(vehicle) && (
                              <>
                                <IconButton 
                                  onClick={() => handleEditClick(vehicle)}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <Edit size={18} />
                                </IconButton>
                                <IconButton 
                                  onClick={() => dispatch(deleteVehicle(vehicle.id))}
                                  sx={{ color: 'error.main' }}
                                >
                                  <Trash size={18} />
                                </IconButton>
                              </>
                            )}
                            {vehicle.listingType === 'marketplace' && vehicle.status === 'verified' && (
                              <IconButton 
                                onClick={() => dispatch(toggleVisibility(vehicle.id))}
                                sx={{ color: vehicle.is_visible ? 'text.secondary' : 'text.disabled' }}
                              >
                                {vehicle.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" component="h2" mb={3}>
                Your Bids
              </Typography>

              {bidStatus === 'loading' ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress color="primary" />
                </Box>
              ) : bids?.length === 0 ? (
                <EmptyState type="bids" />
              ) : (
                <Grid container spacing={3}>
                  {bids.map(bid => (
                    <Grid item xs={12} key={bid.id}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 2, 
                          border: '1px solid #eee',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Box>
                            <Typography variant="h6" fontWeight={600} mb={1}>
                              {bid.vehicle.make} {bid.vehicle.model} ({bid.vehicle.year})
                            </Typography>
                            <Typography variant="body1" color="primary" fontWeight={500} mb={1}>
                              Your Bid: ${Number(bid.amount).toLocaleString()}
                            </Typography>
                            <Box display="flex" gap={1}>
                              <Chip 
                                label={bid.status} 
                                color={bid.status === 'accepted' ? 'success' : bid.status === 'rejected' ? 'error' : 'default'}
                                size="small"
                              />
                              <Chip 
                                label={new Date(bid.createdAt).toLocaleDateString()}
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
        
        {/* Footer */}
        <Footer />
      </Box>

      <Dialog 
        open={showAddModal} 
        onClose={handleDialogClose}
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
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              required
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
              variant="outlined"
              InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() + 1 } }}
            />
            
            <TextField
              fullWidth
              label="Price ($)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
            />
            
            <Select
              fullWidth
              value={formData.listingType}
              onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
              variant="outlined"
              displayEmpty
            >
              <MenuItem value="marketplace">Marketplace Listing</MenuItem>
              <MenuItem value="instant_sale">Instant Sale</MenuItem>
            </Select>

            <Box display="flex" gap={2} mt={2}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleSubmit}
                disabled={status === 'loading' || !formData.make || !formData.model || !formData.year || !formData.price}
              >
                {editVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}