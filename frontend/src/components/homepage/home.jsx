import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { 
  Car, ShieldCheck, DollarSign, ArrowRight, 
  Star, Clock, Shield, Check, ChevronRight 
} from "lucide-react";
import EnhancedHeroCarousel from "./hero";
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
    <div className="h-screen bg-gray-50">
      {/* Hero Section - Enhanced with parallax and floating elements */}
      <EnhancedHeroCarousel />

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
              { value: "0", label: "Vehicles Listed", prefix: "" },
              { value: "100+", label: "Happy Customers", prefix: "" },
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
                name: "Simbarashe Mutombe",
                role: "Buyer",
                image: "user.jpg",
                quote: "The mobile experience was seamless. I found my dream car while on my lunch break and completed the purchase the same day!"
              },
              {
                name: "Tenda Chabarwa",
                role: "Seller",
                image: "/user.jpg",
                quote: "Selling my car was incredibly easy. The valuation was fair, and I had offers within 24 hours. I'll never go back to traditional dealerships."
              },
              {
                name: "Takunda Tapfuma",
                role: "Buyer",
                image: "/user.jpg",
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