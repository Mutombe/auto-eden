import React, { useEffect, useState, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { 
  Car, ShieldCheck, DollarSign, ArrowRight, 
  Star, Clock, Shield, Check, ChevronRight,
  ChevronLeft, Play, Pause, Sparkles
} from "lucide-react";

export default function EnhancedHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  const heroControls = useAnimation();
  
  // Mount animation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Carousel data
  const carouselData = [
    {
      id: 1,
      title: "Your Journey Begins at Auto Eden",
      subtitle: "Premium Auto Marketplace",
      description: "Discover verified new and pre-owned vehicles or sell your car with confidence and ease.",
      image: "/3.png",
      badge: "Premium Selection",
      rating: 4.9,
      reviews: 247,
      primaryCTA: "Browse Marketplace",
      link: "/marketplace",
      secondaryCTA: "Sell Your Car",
      features: ["No Hidden Fees", "100% Secure", "Instant Valuation"],
      gradient: "from-purple-900 via-red-900 to-orange-900"
    },
    {
      id: 2,
      title: "Sell Your Car Instantly",
      subtitle: "Quick & Easy Process",
      description: "Get instant valuation, professional photography, and reach thousands of verified buyers.",
      image: "/2.png",
      badge: "Fast & Reliable",
      rating: 4.8,
      reviews: 189,
      primaryCTA: "Get Instant Quote",
      link: "/sell",
      secondaryCTA: "Learn More",
      features: ["Free Valuation", "Professional Photos", "Verified Buyers"],
      gradient: "from-blue-900 via-indigo-900 to-red-900"
    },
    {
      id: 3,
      title: "Verified Premium Vehicles",
      subtitle: "Quality Guaranteed",
      description: "Every vehicle undergoes rigorous inspection and verification. Buy with confidence.",
      image: "/1.png",
      badge: "Quality Assured",
      rating: 4.9,
      reviews: 312,
      primaryCTA: "View Inventory",
      link: "/marketplace",
      secondaryCTA: "Book Test Drive",
      features: ["Verified Listings", "Warranty Included", "24/7 Support"],
      gradient: "from-green-900 via-teal-900 to-red-900"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !isMounted) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselData.length, isMounted]);

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
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 250, damping: 25 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 250, damping: 25 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const currentData = carouselData[currentSlide];

  return (
    <div className={`relative bg-gradient-to-br ${currentData.gradient} text-white overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0 ">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 "
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </div>

      {/* Floating Elements - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8 + i * 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 2
            }}
            className={`absolute w-48 h-48 rounded-full blur-3xl ${
              i === 0 ? 'bg-red-500/10 top-1/4 right-1/4' :
              'bg-blue-500/10 bottom-1/4 left-1/3'
            }`}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative min-h-screen flex flex-col pt-22 lg:pt-32">
        {/* Header Space for mobile breathing room */}
        <div className="h-4 sm:h-8 lg:h-16 flex-shrink-0" />

        {/* Main Carousel Content */}
        <div 
          className="flex-1 flex items-center px-4 sm:px-6 lg:px-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait" custom={currentSlide}>
              <motion.div
                key={currentSlide}
                custom={currentSlide}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center min-h-0"
              >
                {/* Image Section - First on mobile */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-full order-1 lg:order-2"
                >
                  <div className="relative group">
                    {/* Main image container with proper aspect ratio */}
                    <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] xl:aspect-[3/2] w-full max-h-[300px] sm:max-h-[400px] lg:max-h-none overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl">
                      <motion.img
                        key={currentSlide}
                        initial={{ scale: 1.05, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        src={currentData.image}
                        alt="Premium vehicle"
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
                        style={{
                          filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
                        }}
                      />
                      
                      {/* Rating badge - Positioned carefully to avoid overlap */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-black/70 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl shadow-xl"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-white text-xs sm:text-sm font-semibold">
                          {currentData.rating} • {currentData.reviews} reviews
                        </p>
                      </motion.div>
                      
                      {/* Premium badge - Top right, properly spaced */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-red-600 to-red-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-bold shadow-xl"
                      >
                        {currentData.badge}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Content Section - Second on mobile */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-full space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1 text-center lg:text-left"
                >
                  {/* Badge */}
                  <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
                    <div className="inline-flex items-center py-2 px-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium shadow-lg">
                      <Sparkles className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0" />
                      <span className="truncate">{currentData.subtitle}</span>
                    </div>
                  </motion.div>

                  {/* Main Title */}
                  <motion.div variants={itemVariants}>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight">
                      {currentData.title.split(' ').map((word, index) => (
                        <span key={index} className={`${word === 'Auto' || word === 'Eden' ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500' : ''} inline-block ${index > 0 ? 'ml-2 sm:ml-3' : ''}`}>
                          {word}
                        </span>
                      ))}
                    </h1>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    variants={itemVariants}
                    className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-2xl leading-relaxed font-light mx-auto lg:mx-0"
                  >
                    {currentData.description}
                  </motion.p>

                  {/* Features Pills - Stack on mobile for no overlap */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start max-w-md mx-auto lg:mx-0"
                  >
                    {currentData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-center sm:justify-start px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-center">
                        <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-white whitespace-nowrap">{feature}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Buttons - Always stacked on mobile */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-3 sm:gap-4 pt-4 max-w-sm mx-auto lg:mx-0 lg:max-w-none lg:flex-row"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-red-500/25 flex items-center justify-center overflow-hidden"
                      onClick={() => window.location.href = currentData.link}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative z-10 truncate">{currentData.primaryCTA}</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10 flex-shrink-0" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center overflow-hidden"
                      onClick={() => window.location.href = currentData.link}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative z-10 truncate">{currentData.secondaryCTA}</span>
                      <DollarSign className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform relative z-10 flex-shrink-0" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Controls - Fixed bottom with proper spacing */}
        <div className="flex-shrink-0 pb-4 sm:pb-6 lg:pb-8">
          <div className="flex justify-center">
            <div className="flex items-center gap-3 sm:gap-4 bg-black/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 shadow-xl mx-4">
              {/* Previous button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevSlide}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 group"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
              </motion.button>

              {/* Dots */}
              <div className="flex gap-2 sm:gap-3">
                {carouselData.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => goToSlide(index)}
                    className={`relative transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-6 sm:w-8 h-2.5 sm:h-3 bg-red-500 rounded-full' 
                        : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/40 hover:bg-white/60 rounded-full'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    {index === currentSlide && (
                      <motion.div
                        layoutId="activeSlide"
                        className="absolute inset-0 bg-red-500 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextSlide}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 group"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              {/* Auto-play toggle - Hidden on very small screens */}
              <div className="hidden sm:flex items-center">
                <div className="w-px h-4 sm:h-6 bg-white/30 mx-2" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/20 transition-all duration-200 ${
                    isAutoPlaying ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  aria-label={isAutoPlaying ? 'Pause autoplay' : 'Start autoplay'}
                >
                  {isAutoPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <motion.div
          key={currentSlide}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: isAutoPlaying ? 6 : 0, ease: "linear" }}
          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
        />
      </div>
    </div>
  );
}