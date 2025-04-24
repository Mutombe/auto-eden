import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMarketplace } from '../../redux/slices/vehicleSlice';
import { placeBid } from '../../redux/slices/bidSlice';
import { 
  Car, Search, Sliders, DollarSign, Calendar, Gauge, ArrowUpDown, 
  Tag, Map, Shield, Award, TrendingUp, CheckCircle, Clock, Filter
} from 'lucide-react';
import { 
  Button, TextField, Select, MenuItem, Chip, Dialog, IconButton,
  InputAdornment, Slider, FormControl, InputLabel, Snackbar, Alert,
  CircularProgress, Tooltip, Backdrop, Divider, Badge
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketplacePage() {
  const dispatch = useDispatch();
  const { items: vehicles, status } = useSelector((state) => state.vehicles);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    make: '',
    year: '',
    sortBy: 'newest',
    bodyType: '',
    fuelType: ''
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Popular makes for quick filtering
  const popularMakes = ['Toyota', 'BMW', 'Mercedes', 'Honda', 'Ford'];
  
  // Popular body types
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Truck', 'Van'];
  
  // Fuel types
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchMarketplace())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleQuickFilterMake = (make) => {
    setFilters({ ...filters, make });
  };

  const handleQuickFilterBodyType = (bodyType) => {
    setFilters({ ...filters, bodyType });
  };

  const handleClearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      make: '',
      year: '',
      sortBy: 'newest',
      bodyType: '',
      fuelType: ''
    });
  };

  const handlePlaceBid = () => {
    if (selectedVehicle && bidAmount) {
      dispatch(placeBid({
        vehicleId: selectedVehicle.id,
        amount: parseFloat(bidAmount)
      })).then(() => {
        setSelectedVehicle(null);
        setBidAmount('');
        setSnackbar({
          open: true,
          message: 'Your bid has been placed successfully!',
          severity: 'success'
        });
      }).catch((error) => {
        setSnackbar({
          open: true,
          message: error?.message || 'Failed to place bid. Please try again.',
          severity: 'error'
        });
      });
    }
  };

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      if (filters.minPrice && vehicle.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && vehicle.price > parseFloat(filters.maxPrice)) return false;
      if (filters.make && !vehicle.make.toLowerCase().includes(filters.make.toLowerCase())) return false;
      if (filters.year && vehicle.year.toString() !== filters.year.toString()) return false;
      if (filters.bodyType && vehicle.body_type !== filters.bodyType) return false;
      if (filters.fuelType && vehicle.fuel_type !== filters.fuelType) return false;
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'priceLowHigh':
          return a.price - b.price;
        case 'priceHighLow':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [vehicles, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Parallax Effect */}
      <motion.section 
        className="relative h-72 md:h-96 bg-gradient-to-r from-red-700 to-red-900 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full"
              initial={{ scale: 0.1, x: Math.random() * 1000 - 500, y: Math.random() * 500 - 250, opacity: 0.1 }}
              animate={{ 
                scale: [0.1, 0.5 + Math.random() * 0.5],
                x: [Math.random() * 1000 - 500, Math.random() * 1000 - 500],
                y: [Math.random() * 500 - 250, Math.random() * 500 - 250],
                opacity: [0.1, 0.2 + Math.random() * 0.1]
              }}
              transition={{ 
                duration: 15 + Math.random() * 10, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Find Your Perfect Ride
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-white/80 max-w-2xl mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Browse our extensive collection of premium vehicles from trusted sellers
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg flex overflow-hidden w-full max-w-3xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex-grow p-2">
              <TextField
                fullWidth
                placeholder="Search by make, model, or keyword..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="text-gray-400" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '0.75rem' }
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' }
                  }
                }}
              />
            </div>
            <Button
              variant="contained"
              className="!rounded-r-xl !h-full !px-6"
              sx={{
                backgroundColor: "#dc2626",
                '&:hover': {
                  backgroundColor: "#b91c1c",
                },
                borderRadius: '0',
                height: '100%'
              }}
            >
              Search
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-10">
        {/* Quick Filters - Makes */}
        <motion.div 
          className="bg-white shadow-md rounded-xl p-4 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <h3 className="text-gray-700 font-medium">Popular Makes:</h3>
            {popularMakes.map(make => (
              <Chip
                key={make}
                label={make}
                onClick={() => handleQuickFilterMake(make)}
                sx={{
                  backgroundColor: filters.make === make ? '#dc2626' : '#f3f4f6',
                  color: filters.make === make ? 'white' : '#1f2937',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: filters.make === make ? '#b91c1c' : '#e5e7eb',
                  }
                }}
              />
            ))}
            <Tooltip title="Clear make filter">
              <IconButton 
                size="small" 
                onClick={() => setFilters({...filters, make: ''})}
                sx={{ ml: 1 }}
              >
                <CheckCircle 
                  className={`w-5 h-5 ${filters.make ? 'text-red-600' : 'text-gray-300'}`} 
                />
              </IconButton>
            </Tooltip>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div 
          className="bg-white shadow-md rounded-xl mb-6 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Filter className="text-gray-600" />
              <h2 className="text-lg font-semibold">Filters & Sorting</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleClearFilters}
                sx={{
                  color: '#6b7280',
                  borderColor: '#d1d5db',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: 'rgba(156, 163, 175, 0.04)',
                  }
                }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                endIcon={showFilters ? <ArrowUpDown /> : <ArrowUpDown />}
                sx={{
                  backgroundColor: "#dc2626",
                  '&:hover': {
                    backgroundColor: "#b91c1c",
                  }
                }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4 border-t border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {/* Price Range */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <InputLabel className="text-gray-600 text-sm">Price Range</InputLabel>
                      <span className="text-xs text-gray-500">
                        ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <TextField
                        name="minPrice"
                        label="Min"
                        type="number"
                        size="small"
                        InputProps={{ 
                          startAdornment: <DollarSign className="w-4 h-4 mr-1 text-gray-400" /> 
                        }}
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#dc2626',
                            },
                          },
                          '& .MuiFormLabel-root.Mui-focused': {
                            color: '#dc2626',
                          },
                        }}
                      />
                      <TextField
                        name="maxPrice"
                        label="Max"
                        type="number"
                        size="small"
                        InputProps={{ 
                          startAdornment: <DollarSign className="w-4 h-4 mr-1 text-gray-400" /> 
                        }}
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#dc2626',
                            },
                          },
                          '& .MuiFormLabel-root.Mui-focused': {
                            color: '#dc2626',
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Make & Year */}
                  <div className="flex gap-4">
                    <TextField
                      name="make"
                      label="Make"
                      size="small"
                      value={filters.make}
                      onChange={handleFilterChange}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#dc2626',
                          },
                        },
                        '& .MuiFormLabel-root.Mui-focused': {
                          color: '#dc2626',
                        },
                      }}
                    />
                    <TextField
                      name="year"
                      label="Year"
                      type="number"
                      size="small"
                      InputProps={{ 
                        startAdornment: <Calendar className="w-4 h-4 mr-1 text-gray-400" /> 
                      }}
                      value={filters.year}
                      onChange={handleFilterChange}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#dc2626',
                          },
                        },
                        '& .MuiFormLabel-root.Mui-focused': {
                          color: '#dc2626',
                        },
                      }}
                    />
                  </div>

                  {/* Body Type & Fuel Type */}
                  <div className="flex gap-4">
                    <FormControl fullWidth size="small">
                      <InputLabel id="body-type-label">Body Type</InputLabel>
                      <Select
                        labelId="body-type-label"
                        name="bodyType"
                        value={filters.bodyType}
                        onChange={handleFilterChange}
                        label="Body Type"
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc2626',
                          },
                          '&.Mui-focused .MuiSelect-icon': {
                            color: '#dc2626',
                          }
                        }}
                      >
                        <MenuItem value="">Any</MenuItem>
                        {bodyTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel id="fuel-type-label">Fuel Type</InputLabel>
                      <Select
                        labelId="fuel-type-label"
                        name="fuelType"
                        value={filters.fuelType}
                        onChange={handleFilterChange}
                        label="Fuel Type"
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc2626',
                          },
                          '&.Mui-focused .MuiSelect-icon': {
                            color: '#dc2626',
                          }
                        }}
                      >
                        <MenuItem value="">Any</MenuItem>
                        {fuelTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>

                  {/* Sort Order */}
                  <FormControl fullWidth size="small">
                    <InputLabel id="sort-label">Sort By</InputLabel>
                    <Select
                      labelId="sort-label"
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                      label="Sort By"
                      IconComponent={ArrowUpDown}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#dc2626',
                        },
                        '&.Mui-focused .MuiSelect-icon': {
                          color: '#dc2626',
                        }
                      }}
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="priceLowHigh">Price: Low to High</MenuItem>
                      <MenuItem value="priceHighLow">Price: High to Low</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                {/* Body Type Quick Filters */}
                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <h3 className="text-gray-700 font-medium">Body Type:</h3>
                    {bodyTypes.map(type => (
                      <Chip
                        key={type}
                        label={type}
                        onClick={() => handleQuickFilterBodyType(type)}
                        sx={{
                          backgroundColor: filters.bodyType === type ? '#dc2626' : '#f3f4f6',
                          color: filters.bodyType === type ? 'white' : '#1f2937',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: filters.bodyType === type ? '#b91c1c' : '#e5e7eb',
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count & View Mode */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-600">
            Showing <span className="font-semibold">{filteredVehicles.length}</span> vehicles
            {filters.make && <span> in <span className="font-semibold">{filters.make}</span></span>}
          </div>
          <div className="flex gap-2">
            <Tooltip title="Grid View">
              <IconButton 
                onClick={() => setViewMode('grid')} 
                className={viewMode === 'grid' ? '!bg-red-50' : ''}
                sx={{ color: viewMode === 'grid' ? '#dc2626' : '#6b7280' }}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton 
                onClick={() => setViewMode('list')} 
                className={viewMode === 'list' ? '!bg-red-50' : ''}
                sx={{ color: viewMode === 'list' ? '#dc2626' : '#6b7280' }}
              >
                <div className="flex flex-col gap-0.5 items-center">
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                </div>
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <CircularProgress sx={{ color: '#dc2626' }} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredVehicles.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <Car className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any vehicles matching your criteria. Try adjusting your filters.
            </p>
            <Button 
              variant="outlined" 
              onClick={handleClearFilters}
              sx={{
                color: '#dc2626',
                borderColor: '#dc2626',
                '&:hover': {
                  borderColor: '#b91c1c',
                  backgroundColor: 'rgba(220, 38, 38, 0.04)',
                }
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Vehicle Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }>
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (index % 6) }}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
                  <img
                    src={vehicle.images?.[0].image || '/api/placeholder/400/250'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className={`w-full object-cover ${viewMode === 'list' ? 'h-56 md:h-full md:rounded-l-xl' : 'h-52 rounded-t-xl'}`}
                  />
                  
                  {/* Featured Badge */}
                  {vehicle.featured && (
                    <div className="absolute top-4 left-0 bg-yellow-500 text-white px-3 py-1 rounded-r-full shadow-md flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span className="text-xs font-medium">Featured</span>
                    </div>
                  )}
                  
                  {/* Chips and badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Chip
                      label={vehicle.listing_type === 'instant_sale' ? 'Buy Now' : 'Auction'}
                      color={vehicle.listing_type === 'instant_sale' ? 'success' : 'primary'}
                      size="small"
                      sx={{
                        backgroundColor: vehicle.listing_type === 'instant_sale' ? '#059669' : '#1d4ed8',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    
                    {vehicle.is_verified && (
                      <Chip
                        icon={<Shield className="w-3 h-3 text-green-700" />}
                        label="Verified"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(240, 253, 244, 0.9)',
                          color: '#15803d',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          '& .MuiChip-icon': {
                            color: '#15803d',
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'md:w-2/3' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-gray-600">{vehicle.year} • {vehicle.mileage?.toLocaleString() || '0'} km</p>
                    </div>
                    <Badge 
                      badgeContent={vehicle.bid_count || 0} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#dc2626',
                          color: 'white',
                        }
                      }}
                    >
                      <TrendingUp className="text-gray-400 w-5 h-5" />
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-1.5 text-gray-500" />
                      <span>{vehicle.body_type || 'Sedan'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Map className="w-4 h-4 mr-1.5 text-gray-500" />
                      <span>{vehicle.location || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Gauge className="w-4 h-4 mr-1.5 text-gray-500" />
                      <span>{vehicle.transmission || 'Automatic'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1.5 text-gray-500" />
                      <span>{vehicle.fuel_type || 'Petrol'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-2 flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-red-600">
                        ${vehicle.price?.toLocaleString()}
                      </span>
                      {vehicle.discount_price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${vehicle.discount_price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    {vehicle.listing_type === 'auction' ? (
                      <Button
                        variant="contained"
                        size={viewMode === 'grid' ? 'medium' : 'large'}
                        onClick={() => setSelectedVehicle(vehicle)}
                        sx={{
                          backgroundColor: "#dc2626",
                          '&:hover': {
                            backgroundColor: "#b91c1c",
                          }
                        }}
                        className="!rounded-lg !font-medium"
                      >
                        Place Bid
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size={viewMode === 'grid' ? 'medium' : 'large'}
                        sx={{
                          color: "#dc2626",
                          borderColor: "#dc2626",
                          '&:hover': {
                            borderColor: "#b91c1c",
                            backgroundColor: "rgba(220, 38, 38, 0.04)",
                          }
                        }}
                        className="!rounded-lg !font-medium"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Posted {new Date(vehicle.created_at).toLocaleDateString()}</span>
                  </div>
                  {vehicle.ending_soon && (
                    <div className="flex items-center text-red-500">
                      <span className="animate-pulse mr-1">●</span>
                      <span>Ending soon</span>
                    </div>
                  )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="mt-10 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                size="small"
                sx={{
                  color: "#6b7280",
                  borderColor: "#d1d5db",
                  '&:hover': {
                    borderColor: "#9ca3af",
                    backgroundColor: "rgba(156, 163, 175, 0.04)",
                  }
                }}
              >
                Previous
              </Button>
              {[1, 2, 3, 4, 5].map(page => (
                <Button
                  key={page}
                  variant={page === 1 ? "contained" : "outlined"}
                  size="small"
                  sx={page === 1 ? {
                    backgroundColor: "#dc2626",
                    '&:hover': {
                      backgroundColor: "#b91c1c",
                    }
                  } : {
                    color: "#6b7280",
                    borderColor: "#d1d5db",
                    '&:hover': {
                      borderColor: "#9ca3af",
                      backgroundColor: "rgba(156, 163, 175, 0.04)",
                    }
                  }}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outlined"
                size="small"
                sx={{
                  color: "#6b7280",
                  borderColor: "#d1d5db",
                  '&:hover': {
                    borderColor: "#9ca3af",
                    backgroundColor: "rgba(156, 163, 175, 0.04)",
                  }
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bid Dialog */}
      <Dialog 
        open={!!selectedVehicle} 
        onClose={() => setSelectedVehicle(null)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            maxWidth: '450px',
            width: '100%'
          }
        }}
      >
        {selectedVehicle && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Place Bid on {selectedVehicle.make} {selectedVehicle.model}
              </h3>
              <IconButton 
                size="small" 
                onClick={() => setSelectedVehicle(null)}
                sx={{ color: '#6b7280' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </IconButton>
            </div>
            
            <div className="flex items-center mb-6">
              <img
                src={selectedVehicle.images?.[0] || '/api/placeholder/100/100'}
                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                className="w-20 h-20 object-cover rounded-md mr-4"
              />
              <div>
                <h4 className="text-gray-900 font-medium">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h4>
                <p className="text-gray-600 text-sm">{selectedVehicle.mileage?.toLocaleString() || '0'} km • {selectedVehicle.location || 'Unknown location'}</p>
              </div>
            </div>
            
            <Divider className="mb-6" />
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Current Highest Bid:</span>
                <span className="text-gray-900 font-bold">${selectedVehicle.price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Minimum Bid Increment:</span>
                <span className="text-gray-900 font-medium">$100</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <span className="font-medium">Note:</span> Your bid must be at least ${(selectedVehicle.price + 100).toLocaleString()}
              </div>
            </div>
            
            <TextField
              fullWidth
              type="number"
              label="Your Bid Amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              InputProps={{
                startAdornment: <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              }}
              sx={{
                marginBottom: '24px',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                  },
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#dc2626',
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handlePlaceBid}
              disabled={!bidAmount || parseFloat(bidAmount) <= selectedVehicle.price}
              sx={{
                backgroundColor: "#dc2626",
                '&:hover': {
                  backgroundColor: "#b91c1c",
                },
                '&.Mui-disabled': {
                  backgroundColor: '#f3f4f6',
                  color: '#9ca3af'
                },
                padding: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              }}
            >
              Place Bid
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By placing a bid, you agree to our Terms of Service and Auction Rules
            </p>
          </div>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}