// src/pages/HomePage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Car, ShieldCheck, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@mui/material";

export default function HomePage() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Verified Listings",
      description: "Every vehicle undergoes rigorous digital and physical verification"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Competitive Pricing",
      description: "Get the best value whether you're buying or selling"
    },
  ];

  const listings = [
    { id: 1, make: "Toyota", model: "Camry", year: 2020, price: 23500, image: "camry.jpg" },
    { id: 2, make: "Honda", model: "Civic", year: 2021, price: 22500, image: "civic.jpg" },
    { id: 3, make: "Ford", model: "Mustang", year: 2022, price: 41500, image: "mustang.jpg" },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            Your Journey Begins at Auto Eden
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Discover verified pre-owned vehicles or sell your car with confidence
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center gap-4"
          >
            <Button
              variant="contained"
              size="large"
              className="!bg-white !text-blue-600 !rounded-xl !px-8 !py-3"
              endIcon={<ArrowRight />}
            >
              Browse Marketplace
            </Button>
            <Button
              variant="outlined"
              size="large"
              className="!text-white !border-white !rounded-xl !px-8 !py-3"
              endIcon={<DollarSign />}
            >
              Sell Your Car
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-2xl shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Listings</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {listings.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={`/images/${car.image}`}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {car.make} {car.model}
                      </h3>
                      <p className="text-gray-600">{car.year}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      ${car.price.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    fullWidth
                    variant="contained"
                    className="!rounded-lg !py-2.5"
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
    </div>
  );
}