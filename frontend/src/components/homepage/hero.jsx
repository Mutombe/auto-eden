import React, { useEffect, useState, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Car, ShieldCheck, DollarSign, ArrowRight, 
  Star, Clock, Shield, Check, ChevronRight,
  ChevronLeft, Play, Pause
} from "lucide-react";

export default function EnhancedHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
    const navigate = useNavigate();
  
  const heroControls = useAnimation();
  
  // Carousel data
  const carouselData = [
    {
      id: 1,
      title: "Your Journey Begins at Auto Eden",
      subtitle: "Premium Auto Marketplace",
      description: "Discover verified new and pre-owned vehicles or sell your car with confidence and ease. Experience the premium car marketplace designed for the modern driver.",
      image: "/3.png",
      badge: "Premium Selection",
      rating: 4.9,
      reviews: 247,
      primaryCTA: "Browse Marketplace",
      secondaryCTA: "Sell Your Car",
      features: ["No Hidden Fees", "100% Secure", "Instant Valuation"]
    },
    {
      id: 2,
      title: "Sell Your Car Instantly",
      subtitle: "Quick & Easy Process",
      description: "Get instant valuation, professional photography, and reach thousands of verified buyers. Our streamlined process makes selling your car effortless.",
      image: "/2.png",
      badge: "Fast & Reliable",
      rating: 4.8,
      reviews: 189,
      primaryCTA: "Get Instant Quote",
      secondaryCTA: "Learn More",
      features: ["Free Valuation", "Professional Photos", "Verified Buyers"]
    },
    {
      id: 3,
      title: "Verified Premium Vehicles",
      subtitle: "Quality Guaranteed",
      description: "Every vehicle undergoes rigorous inspection and verification. Buy with confidence knowing you're getting the best quality and value.",
      image: "/1.png",
      badge: "Quality Assured",
      rating: 4.9,
      reviews: 312,
      primaryCTA: "View Inventory",
      secondaryCTA: "Book Test Drive",
      features: ["Verified Listings", "Warranty Included", "24/7 Support"]
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselData.length]);

  // Navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
  }, [carouselData.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  }, [carouselData.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const currentData = carouselData[currentSlide];

  return (
    <div className="relative bg-gradient-to-br from-black via-gray-900 to-red-900 text-white overflow-hidden pt-10">
      {/* Background with parallax effect */}
      <div className="absolute inset-0">
        <motion.div
          key={currentSlide}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 5, ease: "linear" }}
          className="w-full h-full opacity-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-red-900/80" />
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        </motion.div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [-20, 20, -20],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-1/4 right-1/4 w-32 h-32 border border-red-500/20 rounded-full"
        />
        <motion.div
          animate={{ 
            y: [20, -20, 20],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-white/10 rounded-lg"
        />
      </div>

      {/* Main carousel content */}
      <div className="relative min-h-screen flex items-center py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div 
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={currentSlide}>
              <motion.div
                key={currentSlide}
                custom={currentSlide}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16"
              >
                {/* Content Section */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="lg:w-1/2 space-y-6 z-10"
                >
                  {/* Badge */}
                  <motion.div variants={itemVariants}>
                    <span className="inline-flex items-center py-2 px-4 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium backdrop-blur-sm">
                      <Car className="w-4 h-4 mr-2" />
                      {currentData.subtitle}
                    </span>
                  </motion.div>

                  {/* Main Title */}
                  <motion.div variants={itemVariants}>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                      {currentData.title.split(' ').map((word, index) => (
                        <span key={index} className={word === 'Auto' || word === 'Eden' ? 'text-red-500' : ''}>
                          {word}{' '}
                        </span>
                      ))}
                    </h1>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed"
                  >
                    {currentData.description}
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/marketplace')}
                      className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      {currentData.primaryCTA}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/marketplace')}
                      className="group border-2 border-white/30 hover:border-white/60 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center"
                    >
                      {currentData.secondaryCTA}
                      <DollarSign className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                    </motion.button>
                  </motion.div>

                  {/* Features */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-4 pt-6"
                  >
                    {currentData.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm sm:text-base">
                        <Check className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Image Section */}
                <motion.div 
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  className="lg:w-1/2 relative"
                >
                  <div className="relative group">
                    {/* Blended image container with full view */}
                    <div className="relative h-80 sm:h-96 lg:h-[600px] w-full overflow-hidden">
                      {/* Background blend overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-red-900/30 to-transparent z-10 mix-blend-overlay" />
                      
                      {/* Radial gradient blend */}
                      <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-900/20 to-black/60 z-10" />
                      
                      {/* Soft edge fade for seamless blending */}
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/80 z-20" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />
                      
                      {/* Main image - displayed in full with object-contain */}
                      <motion.img
                        key={currentSlide}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        src={currentData.image}
                        alt="Premium vehicle"
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 mix-blend-screen opacity-90"
                        style={{
                          filter: 'brightness(1.1) contrast(1.2) saturate(1.1)',
                        }}
                      />
                      
                      {/* Floating rating badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="absolute bottom-6 left-6 z-30 bg-black/40 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-white text-sm font-medium">
                          {currentData.rating} ({currentData.reviews} reviews)
                        </p>
                      </motion.div>
                      
                      {/* Premium badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute top-6 right-6 z-30 bg-red-600 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg"
                      >
                        {currentData.badge}
                      </motion.div>
                    </div>

                    {/* Enhanced decorative elements for better blending */}
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-red-500/15 rounded-full blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 -right-4 w-24 h-24 bg-red-600/10 rounded-full blur-xl" />
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
          {/* Previous button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Dots */}
          <div className="flex gap-2">
            {carouselData.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-red-500 scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* Auto-play toggle */}
          <div className="w-px h-6 bg-white/20 mx-2" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <motion.div
          key={currentSlide}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: isAutoPlaying ? 5 : 0, ease: "linear" }}
          className="h-full bg-red-500"
        />
      </div>

      {/* Wave separator 
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-20">
          <path 
            d="M0 120L48 105C96 90 192 60 288 50C384 40 480 50 576 55C672 60 768 60 864 65C960 70 1056 80 1152 75C1248 70 1344 50 1392 40L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="rgb(249, 250, 251)"
          />
        </svg>
      </div>*/}
    </div>
  );
}