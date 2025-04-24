// src/pages/HomePage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Car, ShieldCheck, DollarSign, ArrowRight, Star, Clock, Shield } from "lucide-react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-red-600" />,
      title: "Verified Listings",
      description: "Every vehicle undergoes rigorous digital and physical verification"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-red-600" />,
      title: "Competitive Pricing",
      description: "Get the best value whether you're buying or selling"
    },
    {
      icon: <Clock className="w-8 h-8 text-red-600" />,
      title: "Fast Process",
      description: "Quick transactions with minimal paperwork and hassle"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Buyer Protection",
      description: "Comprehensive coverage and satisfaction guarantee"
    }
  ];

  const listings = [
    { id: 1, make: "Toyota", model: "Camry", year: 2020, price: 23500, image: "/note.jpg", rating: 4.9, reviews: 24 },
    { id: 2, make: "Honda", model: "Civic", year: 2021, price: 22500, image: "/note.jpg", rating: 4.7, reviews: 18 },
    { id: 3, make: "Ford", model: "Mustang", year: 2022, price: 41500, image: "/hondafit.png", rating: 4.8, reviews: 32 },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-black to-red-800 text-white py-16 md:py-24 py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Your Journey Begins at <span className="text-red-500">Auto Eden</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg md:text-xl mb-8 text-gray-200"
              >
                Discover verified pre-owned vehicles or sell your car with confidence and ease.
                Experience the premium car marketplace.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/marketplace")}
                  className="!bg-red-600 !text-white !hover:bg-red-700 !rounded-lg !px-6 !py-3 !font-medium"
                  endIcon={<ArrowRight />}
                >
                  Browse Marketplace
                </Button>
                <Button
                  onClick={() => navigate("/sell")}
                  variant="outlined"
                  size="large"
                  className="!text-white !border-white !rounded-lg !px-6 !py-3 !hover:bg-white/10 !font-medium"
                  endIcon={<DollarSign />}
                >
                  Sell Your Car
                </Button>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl"
              >
                <img 
                  src="/hondafit.png" 
                  alt="Luxury car" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-red-600">5,000+</p>
              <p className="text-gray-600">Vehicles Listed</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-red-600">10,000+</p>
              <p className="text-gray-600">Happy Customers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-red-600">98%</p>
              <p className="text-gray-600">Satisfaction Rate</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-3xl md:text-4xl font-bold text-red-600">24/7</p>
              <p className="text-gray-600">Customer Support</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Auto Eden</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              We provide an exceptional car buying and selling experience with premium services and guarantees.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900">Featured Listings</h2>
        
            <Button
              variant="text"
              onClick={() => navigate("/marketplace")}
              className="!text-red-600 !font-medium"
              endIcon={<ArrowRight className="w-5 h-5" />}
            >
              View All Listings
            </Button>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                    Featured
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {car.make} {car.model}
                      </h3>
                      <p className="text-gray-600">{car.year}</p>
                    </div>
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-lg text-lg font-semibold">
                      ${car.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-5">
                    <div className="flex items-center text-yellow-500 mr-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{car.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({car.reviews} reviews)</span>
                  </div>
                  
                  <Button
                    fullWidth
                    onClick={() => navigate(`/marketplace`)}
                    variant="contained"
                    className="!bg-red-600 !text-white !hover:bg-red-700 !rounded-lg !py-2.5 !font-medium"
                    startIcon={<Car className="w-5 h-5" />}
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-6"
          >
            Ready to Find Your Dream Car?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of satisfied customers who found their perfect vehicle through Auto Eden.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button
              variant="contained"
              onClick={() => navigate("/marketplace")}
              size="large"
              className="!bg-red-600 !text-white !hover:bg-red-700 !rounded-lg !px-8 !py-3 !font-medium"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/about")}
              className="!text-white !border-white !rounded-lg !px-8 !py-3 !hover:bg-white/10 !font-medium"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}