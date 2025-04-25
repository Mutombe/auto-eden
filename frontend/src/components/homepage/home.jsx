import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { 
  Car, ShieldCheck, DollarSign, ArrowRight, 
  Star, Clock, Shield, Check, ChevronRight 
} from "lucide-react";
import { Button, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";

export default function HomePage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Animation controls
  const heroControls = useAnimation();
  const statsControls = useAnimation();
  const featuresControls = useAnimation();
  const listingsControls = useAnimation();
  const ctaControls = useAnimation();
  
  // Intersection observers
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [listingsRef, listingsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  // Trigger animations when sections come into view
  useEffect(() => {
    if (heroInView) heroControls.start("visible");
    if (statsInView) statsControls.start("visible");
    if (featuresInView) featuresControls.start("visible");
    if (listingsInView) listingsControls.start("visible");
    if (ctaInView) ctaControls.start("visible");
  }, [heroInView, statsInView, featuresInView, listingsInView, ctaInView]);
  
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
    { id: 1, make: "Toyota", model: "Camry", year: 2020, price: 23500, image: "/note.jpg", rating: 4.9, reviews: 24, features: ["Hybrid", "Leather Interior", "Navigation"] },
    { id: 2, make: "Honda", model: "Civic", year: 2021, price: 22500, image: "/note.jpg", rating: 4.7, reviews: 18, features: ["Turbo", "Sunroof", "Apple CarPlay"] },
    { id: 3, make: "Ford", model: "Mustang", year: 2022, price: 41500, image: "/hondafit.png", rating: 4.8, reviews: 32, features: ["V8 Engine", "Premium Sound", "Track Mode"] },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const carAnimation = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.3
      }
    }
  };
  
  // Parallax effect for hero image
  const parallaxVariants = {
    initial: { scale: 1.1 },
    animate: { 
      scale: 1,
      transition: { duration: 1.5, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section - Enhanced with parallax and floating elements */}
      <div className="relative bg-gradient-to-r from-black to-red-800 text-white overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={parallaxVariants}
            className="w-full h-full"
          >
            <div className="absolute inset-0 bg-[url('/road-background.jpg')] bg-cover bg-center" />
          </motion.div>
        </div>
        
        <div ref={heroRef} className="relative py-16 md:py-32 min-h-[90vh] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={heroControls}
              className="flex flex-col md:flex-row md:items-center"
            >
              <div className="md:w-1/2 mb-16 md:mb-0 z-10">
                <motion.div variants={itemVariants} className="relative mb-6">
                  <span className="inline-block py-1 px-3 rounded-full bg-red-500/20 text-red-300 text-sm font-medium mb-2">
                    Premium Auto Marketplace
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold">
                    Your Journey Begins at{" "}
                    <span className="inline-block relative">
                      <span className="relative z-10 text-red-500">Auto Eden</span>
                      <motion.span 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="absolute bottom-0 left-0 h-3 bg-red-500/20 z-0"
                      />
                    </span>
                  </h1>
                </motion.div>
                
                <motion.p
                  variants={itemVariants}
                  className="text-lg md:text-xl mb-8 text-gray-200 max-w-xl"
                >
                  Discover verified pre-owned vehicles or sell your car with confidence and ease.
                  Experience the premium car marketplace designed for the modern driver.
                </motion.p>
                
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/marketplace")}
                    className="!bg-red-600 !text-white !hover:bg-red-700 !rounded-lg !px-6 !py-3 !font-medium !shadow-lg"
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
                
                <motion.div 
                  variants={itemVariants}
                  className="flex items-center gap-6 mt-10 text-sm sm:text-base"
                >
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-red-500 mr-2" />
                    <span>No Hidden Fees</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-red-500 mr-2" />
                    <span>100% Secure</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="md:w-1/2 relative z-10">
                <motion.div
                  variants={carAnimation}
                  className="relative h-72 sm:h-80 md:h-96 rounded-lg overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  <img 
                    src="/hondafit.png" 
                    alt="Luxury car" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Floating elements */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-4 left-4 z-20 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    </div>
                    <p className="text-white text-sm mt-1">Rated 4.9 by our customers</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="absolute top-4 right-4 z-20 bg-red-600 px-3 py-1 rounded-full text-white text-sm font-medium"
                  >
                    Premium Selection
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L48 105C96 90 192 60 288 50C384 40 480 50 576 55C672 60 768 60 864 65C960 70 1056 80 1152 75C1248 70 1344 50 1392 40L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Stats Section - Enhanced with counters */}
      <div ref={statsRef} className="bg-white py-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={statsControls}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { value: "5,000+", label: "Vehicles Listed", prefix: "" },
              { value: "10,000+", label: "Happy Customers", prefix: "" },
              { value: "98", label: "Satisfaction Rate", prefix: "", suffix: "%" },
              { value: "24/7", label: "Customer Support", prefix: "" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-4 rounded-xl bg-white shadow-sm border border-gray-100"
              >
                <div className="text-3xl md:text-4xl font-bold text-red-600">
                  {stat.prefix}{stat.value}{stat.suffix}
                </div>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section - Enhanced with icons and visual elements */}
      <div ref={featuresRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresControls}
            className="text-center mb-12"
          >
            <motion.div variants={itemVariants} className="inline-block mb-2">
              <span className="px-4 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                Premium Experience
              </span>
            </motion.div>
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900"
            >
              Why Choose Auto Eden
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"
            >
              We provide an exceptional car buying and selling experience with premium services and guarantees.
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-bl-full opacity-50" />
                
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                
                <div className="mt-4 flex items-center text-red-600 font-medium">
                  <span className="text-sm">Learn more</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Featured Listings - Enhanced with card design */}
      <div ref={listingsRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={listingsControls}
            className="flex flex-col md:flex-row justify-between items-center mb-10"
          >
            <motion.div variants={itemVariants} className="mb-4 md:mb-0">
              <span className="px-4 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium mb-2 inline-block">
                Top Selections
              </span>
              <h2 className="text-3xl font-bold text-gray-900">Featured Listings</h2>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button
                variant="text"
                onClick={() => navigate("/marketplace")}
                className="!text-red-600 !font-medium"
                endIcon={<ArrowRight className="w-5 h-5" />}
              >
                View All Listings
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {listings.map((car, index) => (
              <motion.div
                key={car.id}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100"
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
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20" />
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
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center text-yellow-500 mr-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{car.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({car.reviews} reviews)</span>
                  </div>
                  
                  <div className="mb-5 flex flex-wrap gap-2">
                    {car.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <Button
                    fullWidth
                    onClick={() => navigate(`/marketplace`)}
                    variant="contained"
                    className="!bg-red-600 !text-white !hover:bg-red-700 !rounded-lg !py-2.5 !font-medium !shadow-md"
                    startIcon={<Car className="w-5 h-5" />}
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mobile App Promotion - New Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-gray-900 to-red-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="md:w-1/2 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="px-4 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-4 inline-block">
                  Mobile Experience
                </span>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Auto Eden in Your Pocket
                </h2>
                <p className="text-gray-200 mb-6">
                  Download our mobile app for a seamless car buying and selling experience on the go. 
                  Browse listings, get notifications, and manage your account anywhere, anytime.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="contained"
                    className="!bg-white !text-red-900 !hover:bg-gray-100 !rounded-lg !px-6 !py-3 !font-medium !shadow-lg"
                  >
                    App Store
                  </Button>
                  <Button
                    variant="outlined"
                    className="!border-white !text-white !hover:bg-white/10 !rounded-lg !px-6 !py-3 !font-medium"
                  >
                    Google Play
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, type: "spring" }}
                className="h-full"
              >
                <img 
                  src="/mobile-app-preview.png" 
                  alt="Auto Eden Mobile App"
                  className="w-full h-full object-cover" 
                />
              </motion.div>
              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute top-1/4 -left-12 bg-white p-3 rounded-lg shadow-lg max-w-xs hidden md:block"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New match found!</p>
                    <p className="text-sm text-gray-600">We found a car matching your criteria</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section - New Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="px-4 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium mb-2 inline-block">
              Customer Stories
            </span>
            <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Jane Cooper",
                role: "Buyer",
                image: "/testimonial-1.jpg",
                quote: "The mobile experience was seamless. I found my dream car while on my lunch break and completed the purchase the same day!"
              },
              {
                name: "Robert Johnson",
                role: "Seller",
                image: "/testimonial-2.jpg",
                quote: "Selling my car was incredibly easy. The valuation was fair, and I had offers within 24 hours. I'll never go back to traditional dealerships."
              },
              {
                name: "Sarah Thompson",
                role: "Buyer",
                image: "/testimonial-3.jpg",
                quote: "The verification process gave me peace of mind. Knowing every vehicle is thoroughly checked made the entire experience stress-free."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Enhanced with animation */}
      <div ref={ctaRef} className="bg-gradient-to-r from-black to-red-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={ctaControls}
            className="text-center relative"
          >
            {/* Decorative elements */}
            <motion.div 
              variants={itemVariants}
              className="absolute top-0 right-1/4 w-20 h-20 rounded-full bg-red-500/10 blur-2xl"
            />
            <motion.div 
              variants={itemVariants}
              className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-red-500/10 blur-3xl"
            />
            
            <motion.div variants={itemVariants}>
              <span className="px-4 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-4 inline-block">
                Get Started Today
              </span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Ready to Find Your Dream Car?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of satisfied customers who found their perfect vehicle through Auto Eden.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button
                variant="contained"
                onClick={() => navigate("/marketplace")}
                size="large"
                className="!bg-red-600 !text-white !hover:bg-red-700 !rounded-lg !px-8 !py-3 !font-medium !shadow-xl"
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
            
            <motion.div 
              variants={itemVariants}
              className="mt-8 flex items-center justify-center text-white/80 text-sm"
            >
              <Check className="w-4 h-4 mr-2" /> 
              No obligation. Cancel anytime.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}