import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { 
  Car, ShieldCheck, DollarSign, ArrowRight, 
  Star, Clock, Shield, Check, ChevronRight,
  Users, Award, Zap, Heart, Quote, TrendingUp,
  MessageCircle, Phone, Mail
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import StatsSection from "./stats";

// Import the enhanced hero component
import EnhancedHeroCarousel from "./hero";

export default function EnhancedHomePage() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation controls
  const statsControls = useAnimation();
  const featuresControls = useAnimation();
  const testimonialsControls = useAnimation();
  const ctaControls = useAnimation();
  
  // Intersection observers
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [testimonialsRef, testimonialsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  // Trigger animations when sections come into view
  useEffect(() => {
    if (statsInView) statsControls.start("visible");
    if (featuresInView) featuresControls.start("visible");
    if (testimonialsInView) testimonialsControls.start("visible");
    if (ctaInView) ctaControls.start("visible");
  }, [statsInView, featuresInView, testimonialsInView, ctaInView]);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-red-500" />,
      title: "Verified Listings",
      description: "Every vehicle undergoes rigorous digital and physical verification with detailed inspection reports.",
      color: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      hoverColor: "hover:border-blue-500/40"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
      title: "Best Pricing",
      description: "AI-powered market analysis ensures you get the most competitive prices in the market.",
      color: "from-emerald-500/10 to-green-500/10",
      borderColor: "border-emerald-500/20",
      hoverColor: "hover:border-emerald-500/40"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Complete your transaction in minutes with our streamlined digital process.",
      color: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/20",
      hoverColor: "hover:border-yellow-500/40"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Full Protection",
      description: "Comprehensive buyer protection with money-back guarantee and extended warranties.",
      color: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      hoverColor: "hover:border-purple-500/40"
    }
  ];

  const testimonials = [
    {
      name: "Simbarashe Mutombe",
      role: "Software Engineer",
      company: "TechCorp",
      image: "/user.jpg",
      quote: "The mobile experience was seamless. I found my dream car while on my lunch break and completed the purchase the same day! The entire process was incredibly smooth.",
      rating: 5,
      verified: true
    },
    {
      name: "Tenda Chabarwa", 
      role: "Marketing Director",
      company: "Creative Agency",
      image: "/user.jpg",
      quote: "Selling my car was incredibly easy. The valuation was fair, and I had multiple offers within 24 hours. I'll never go back to traditional dealerships again.",
      rating: 5,
      verified: true
    },
    {
      name: "Takunda Tapfuma",
      role: "Business Owner",
      company: "Tapfuma Enterprises",
      image: "/user.jpg", 
      quote: "The verification process gave me complete peace of mind. Knowing every vehicle is thoroughly checked made the entire experience stress-free and trustworthy.",
      rating: 5,
      verified: true
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Enhanced Hero Section */}
      <EnhancedHeroCarousel />

      <StatsSection/> 

      {/* Features Section - Enhanced with modern cards */}
      <div ref={featuresRef} className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresControls}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-bold border border-blue-200/50 mb-4">
                <Star className="w-4 h-4 mr-2" />
                Premium Experience
              </span>
            </motion.div>
            <motion.h2 
              variants={itemVariants}
              className="text-3xl lg:text-5xl text-gray-900 mb-6 leading-tight"
            >
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Auto Eden</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              We provide an exceptional car buying and selling experience with premium services, 
              cutting-edge technology, and unmatched customer support.
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -10, 
                  transition: { duration: 0.3, ease: "backOut" }
                }}
                className={`group relative p-8 rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border ${feature.borderColor} ${feature.hoverColor} overflow-hidden`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100/50 to-transparent rounded-bl-3xl opacity-50" />
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-tl from-gray-50 to-transparent rounded-full opacity-30" />
                
                <div className="relative z-10">
                  {/* Icon container */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-white/80 transition-all duration-300 mb-6 group-hover:scale-110 group-hover:rotate-3">
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Learn more link */}<a href="/marketplace">
                  <div className="flex items-center text-red-600 group-hover:text-red-700 font-bold text-sm transition-all duration-300 cursor-pointer">
                    
                    <span className="group-hover:mr-3 transition-all duration-300">Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div></a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section - Enhanced design */}
      <div ref={testimonialsRef} className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={testimonialsControls}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold border border-white/20 mb-4">
                <MessageCircle className="w-4 h-4 mr-2" />
                Customer Stories
              </span>
            </motion.div>
            <motion.h2 
              variants={itemVariants}
              className="text-3xl lg:text-5xl mb-6 leading-tight"
            >
              What Our Customers <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Say</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Don't just take our word for it. Here's what real customers have to say about their Auto Eden experience.
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="group relative p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 shadow-2xl hover:shadow-white/5 transition-all duration-500 overflow-hidden"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Quote icon */}
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <Quote className="w-8 h-8 text-red-400" />
                </div>
                
                <div className="relative z-10">
                  {/* User info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 overflow-hidden shadow-lg">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                        {testimonial.verified && (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{testimonial.role}</p>
                      <p className="text-xs text-gray-400">{testimonial.company}</p>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-gray-200 leading-relaxed text-lg italic group-hover:text-white transition-colors duration-300">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section - Enhanced with modern design */}
      <div ref={ctaRef} className="relative bg-gradient-to-r from-black via-gray-900 to-red-900 py-16 lg:py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={ctaControls}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}
            onClick={() => window.location.href = '/marketplace'}>
              <span className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold border border-white/20 mb-8 shadow-2xl">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                Get Started Today
              </span>
            </motion.div>
            
            {/* Main title */}
            <motion.h2
              variants={itemVariants}
              className="text-4xl lg:text-6xl text-white mb-6 leading-tight"
            >
              Ready to Find Your 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Dream Car?
              </span>
            </motion.h2>
            
            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of satisfied customers who found their perfect vehicle through Auto Eden. 
              Your dream car is just a click away.
            </motion.p>
            
            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center gap-6 mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/marketplace'}
                className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-red-500/25 flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10">Get Started Now</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform relative z-10" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = 'tel:+263782222032'}
                className="group relative border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 backdrop-blur-md flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10">Learn More</span>
                <Phone className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform relative z-10" />
              </motion.button>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80 text-sm"
            >
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-400" /> 
                No obligation, cancel anytime
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-400" /> 
                100% secure & verified
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" /> 
                4.9/5 customer rating
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}