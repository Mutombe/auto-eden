import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInstantSaleVehicles, createVehicle } from '../../redux/slices/vehicleSlice';
import { Car, Clock, DollarSign, CheckCircle, Plus, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuyMyCarPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { userVehicles, status, error } = useSelector((state) => state.vehicles);
  const [showForm, setShowForm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    vin: '',
    price: ''
  });

  // Reset form data when closing the form
  const initialFormState = {
    make: '',
    model: '',
    year: '',
    mileage: '',
    vin: '',
    price: ''
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchInstantSaleVehicles());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
    
  const handleSubmit = () => {
    const vehicleFormData = new FormData();
    
    // Append vehicle data
    vehicleFormData.append('make', formData.make);
    vehicleFormData.append('model', formData.model);
    vehicleFormData.append('year', formData.year);
    vehicleFormData.append('mileage', formData.mileage);
    vehicleFormData.append('vin', formData.vin);
    vehicleFormData.append('proposed_price', formData.price);
    vehicleFormData.append('listing_type', 'instant_sale');
  
    // Append images
    selectedImages.forEach((image) => {
      vehicleFormData.append('image_files', image);
    });
  
    dispatch(createVehicle(vehicleFormData))
      .unwrap()
      .then(() => {
        setShowForm(false);
        setFormData(initialFormState);
        setSelectedImages([]);
      });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-b from-gray-900 to-red-800 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Instant Sale Dashboard</h1>
          <p className="text-gray-200 max-w-2xl">
            Manage your vehicle listings and track offers in real-time. Add your vehicle details to receive an instant evaluation.
          </p>
        </motion.div>
      </div>
    </div>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            
            {/* Hero Section */}
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-3xl">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
                  <Car size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Sell Your Car in Minutes</h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Get an instant offer from Auto Eden. No haggling, no paperwork - just a fair price 
                for your vehicle.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-xl transition-colors"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-gray-900 hover:bg-gray-100 text-gray-900 font-medium py-3 px-8 rounded-xl transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
              {[
                {
                  icon: <DollarSign size={24} />,
                  title: "Instant Offer",
                  description: "Receive a competitive offer for your vehicle within minutes of submission"
                },
                {
                  icon: <Clock size={24} />,
                  title: "Fast Payment",
                  description: "Get paid quickly and securely once your vehicle details are verified"
                },
                {
                  icon: <CheckCircle size={24} />,
                  title: "No Fees",
                  description: "Our service is completely free with no hidden costs or obligations"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <div className="text-red-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${scrolled ? "bg-gray-50" : "bg-transparent"} pb-20`}>

<div className="bg-gradient-to-b from-gray-900 to-red-800 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Instant Sale Dashboard</h1>
          <p className="text-gray-200 max-w-2xl">
            Manage your vehicle listings and track offers in real-time. Add your vehicle details to receive an instant evaluation.
          </p>
        </motion.div>
      </div>
    </div>
      <div className={`max-w-7xl mx-auto p-4 py-8 ${scrolled ? "pt-40" : "pt-48"}`}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Instant Sale Dashboard</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add Vehicle</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Vehicle Grid */}
        {userVehicles && userVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userVehicles?.map(vehicle => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Car size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-gray-600">Year: {vehicle.year}</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vehicle.status === 'verified' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Offer:</span>
                  <span className="font-semibold text-gray-900">${vehicle.price?.toLocaleString()}</span>
                </div>
                <button
                  className="mt-4 w-full py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded-full">
              <Car size={28} className="text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">No vehicles yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't added any vehicles for instant sale. Get started by adding your first vehicle.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add Your First Vehicle</span>
          </button>
        </motion.div>
      )}

        {/* Add Vehicle Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-90vh overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quick Sell Submission</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. Toyota"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. Camry"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. 2020"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                    <input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. 25000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VIN Number</label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. 1HGCM82633A123456"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. 15000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-red-600 hover:text-red-500">
                          <span>Upload files</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => setSelectedImages(Array.from(e.target.files))}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </div>
                  {selectedImages.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} selected
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium p-3 rounded-lg transition-colors mt-4 disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Submit for Instant Offer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}