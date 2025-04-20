import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMarketplace } from '../../redux/slices/vehicleSlice';
import { placeBid } from '../../redux/slices/bidSlice';
import { Car, Search, Sliders, DollarSign, Calendar, Gauge, ArrowUpDown } from 'lucide-react';
import { Button, TextField, Select, MenuItem, Chip, Dialog, IconButton } from '@mui/material';
import { motion } from 'framer-motion';

export default function MarketplacePage() {
  const dispatch = useDispatch();
  const { items: vehicles, status } = useSelector((state) => state.vehicles);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    make: '',
    year: '',
    sortBy: 'newest'
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    dispatch(fetchMarketplace());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handlePlaceBid = () => {
    if (selectedVehicle && bidAmount) {
      dispatch(placeBid({
        vehicleId: selectedVehicle.id,
        amount: parseFloat(bidAmount)
      })).then(() => {
        setSelectedVehicle(null);
        setBidAmount('');
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Sliders className="text-gray-600" />
          <h2 className="text-xl font-semibold">Filter & Sort</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <TextField
            name="minPrice"
            label="Min Price"
            type="number"
            InputProps={{ startAdornment: <DollarSign className="w-4 h-4 mr-2" /> }}
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <TextField
            name="maxPrice"
            label="Max Price"
            type="number"
            InputProps={{ startAdornment: <DollarSign className="w-4 h-4 mr-2" /> }}
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
          <TextField
            name="make"
            label="Make"
            value={filters.make}
            onChange={handleFilterChange}
          />
          <TextField
            name="year"
            label="Year"
            type="number"
            InputProps={{ startAdornment: <Calendar className="w-4 h-4 mr-2" /> }}
            value={filters.year}
            onChange={handleFilterChange}
          />
          <Select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            IconComponent={ArrowUpDown}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="priceLowHigh">Price: Low to High</MenuItem>
            <MenuItem value="priceHighLow">Price: High to Low</MenuItem>
          </Select>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={vehicle.images[0] || '/car-placeholder.jpg'}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Chip
                  label={vehicle.listing_type === 'instant_sale' ? 'Buy Now' : 'Auction'}
                  color={vehicle.listing_type === 'instant_sale' ? 'success' : 'primary'}
                  size="small"
                />
                <Chip
                  label={`${vehicle.mileage.toLocaleString()} km`}
                  icon={<Gauge className="w-4 h-4" />}
                  size="small"
                />
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-semibold">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-gray-600 mb-2">{vehicle.year}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  ${vehicle.price?.toLocaleString()}
                </span>
                {vehicle.listing_type === 'marketplace' && (
                  <Button
                    variant="contained"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    Place Bid
                  </Button>
                )}
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Posted {new Date(vehicle.created_at).toLocaleDateString()}</span>
                <span>{vehicle.bid_count} bids</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bid Dialog */}
      <Dialog open={!!selectedVehicle} onClose={() => setSelectedVehicle(null)}>
        <div className="p-6 w-96">
          <h3 className="text-xl font-semibold mb-4">
            Place Bid on {selectedVehicle?.make} {selectedVehicle?.model}
          </h3>
          
          <div className="mb-4">
            <p className="text-gray-600">Current Price: ${selectedVehicle?.price?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Minimum bid: ${(selectedVehicle?.price * 1.05).toLocaleString()}</p>
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
            className="mb-4"
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handlePlaceBid}
            disabled={!bidAmount || parseFloat(bidAmount) <= selectedVehicle?.price}
          >
            Submit Bid
          </Button>
        </div>
      </Dialog>
    </div>
  );
}