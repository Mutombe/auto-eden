import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInstantSaleVehicles, createVehicle } from '../../redux/slices/vehicleSlice';
import { Car, Clock, DollarSign, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button, TextField, Dialog, Alert, Avatar, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

export default function BuyMyCarPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { userVehicles, status, error } = useSelector((state) => state.vehicles);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    price: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchInstantSaleVehicles());
    }
  }, [dispatch, isAuthenticated]);

  const handleSubmit = () => {
    dispatch(createVehicle({ ...formData, listingType: 'instant_sale' }))
      .unwrap()
      .then(() => {
        setShowForm(false);
        setFormData({ make: '', model: '', year: '', mileage: '', price: '' });
      });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-2xl shadow-lg inline-block">
              <Car className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">Sell Your Car in Minutes</h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Get an instant offer from Auto Eden. No haggling, no paperwork - just a fair price 
                for your vehicle.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  className="!rounded-xl !px-8 !py-3"
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  className="!rounded-xl !px-8 !py-3"
                >
                  Sign In
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {['Instant Offer', 'Fast Payment', 'No Fees'].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    {index === 0 ? <DollarSign /> : index === 1 ? <Clock /> : <CheckCircle />}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                  <p className="text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Instant Sale Dashboard</h1>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setShowForm(true)}
        >
          Add Vehicle
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userVehicles?.map(vehicle => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="!bg-blue-100">
                <Car className="text-blue-600" />
              </Avatar>
              <div>
                <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                <p className="text-gray-600">Year: {vehicle.year}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Chip 
                  label={vehicle.status} 
                  color={
                    vehicle.status === 'verified' ? 'success' :
                    vehicle.status === 'rejected' ? 'error' : 'default'
                  }
                />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Offer:</span>
                <span className="font-semibold">${vehicle.price?.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <div className="p-6 w-[500px] space-y-4">
          <h2 className="text-2xl font-bold">Quick Sell Submission</h2>
          
          <TextField
            fullWidth
            label="Make"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Expected Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <CircularProgress size={24} />
            ) : (
              'Submit for Instant Offer'
            )}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}