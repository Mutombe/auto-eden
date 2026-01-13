import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Auto Eden Hero Carousel
 * A clean, Tesla-inspired full-screen hero section with background image carousel
 * SEO optimized with semantic HTML and proper heading hierarchy
 */
export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Carousel data - each slide represents a featured vehicle/offer
  // Desktop and mobile images are separate for optimal display
  const slides = [
    {
      id: 1,
      title: "Welcome to Autoeden",
      subtitle: "FIND YOUR PERFECT USED CAR",
      desktopImage: "/autoeden-buy-car-sell-car-zimbabwe.png",
      mobileImage: "/auto-eden-buy-car-harare.png",
      buyLink: "/marketplace",
      sellLink: "/sell",
      alt: "Premium Mercedes-Benz S-Class at Auto Eden dealership",
    },
    {
      id: 2,
      title: "Opportunity Awaits",
      subtitle: "DISCOVER PREMIUM VEHICLES",
      desktopImage: "/auto-eden-car-marketplace-homepage.png",
      mobileImage: "/auto-eden-car-marketplace.png",
      buyLink: "/marketplace",
      sellLink: "/sell",
      alt: "Luxury vehicle collection at Auto Eden",
    },
  ];

  // Auto-play carousel - 6 second intervals
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Navigation handlers
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    else if (isRightSwipe) prevSlide();

    setTouchStart(0);
    setTouchEnd(0);
    setIsAutoPlaying(true);
  };

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentData = slides[currentSlide];

  return (
    <section
      className="pacaembu-font relative h-screen w-full overflow-hidden bg-gray-900"
      aria-label="Featured vehicles carousel"
      role="region"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images - Smooth crossfade without white flash */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={false}
            animate={{
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.05,
            }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: 1.5, ease: "easeOut" },
            }}
            className="absolute inset-0"
            style={{ zIndex: index === currentSlide ? 1 : 0 }}
          >
            <picture>
              <source media="(min-width: 768px)" srcSet={slide.desktopImage} />
              <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
              <img
                src={slide.desktopImage}
                alt={slide.alt}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchpriority={index === 0 ? "high" : "auto"}
              />
            </picture>
          </motion.div>
        ))}

        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 z-10" />
      </div>

      {/* Main Content - Centered like Tesla */}
      <div className="pacaembu-font relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            {/* SEO-optimized heading structure */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-white mb-2 sm:mb-4 tracking-tight">
              {currentData.title}
            </h1>

            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 tracking-widest uppercase mb-6 sm:mb-10 md:mb-12">
              {currentData.subtitle}
            </p>

            {/* CTA Buttons - Side by side on ALL screen sizes */}
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <Link
                to={currentData.buyLink}
                className="px-4 sm:px-6 md:px-10 lg:px-12 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium uppercase tracking-wider rounded transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 text-center whitespace-nowrap"
                aria-label="View this vehicle in the inventory"
              >
                View Inventory
              </Link>

              <Link
                to={currentData.sellLink}
                className="px-4 sm:px-6 md:px-10 lg:px-12 py-2.5 sm:py-3 bg-white/95 hover:bg-white text-gray-900 text-xs sm:text-sm font-medium uppercase tracking-wider rounded transition-all duration-300 hover:shadow-lg text-center whitespace-nowrap"
                aria-label="Sell your car with Auto Eden"
              >
                Sell Your Car
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Desktop only */}
      <div className="hidden md:block">
        <button
          onClick={prevSlide}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Slide Indicators - Bottom center */}
      <div className="absolute bottom-6 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-30">
        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label="Slide indicators"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Decorative sparkle - Bottom right like in reference 
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 text-white/30 z-30"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>*/}

      {/* SEO: Structured data for the carousel */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: slides.map((slide, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: slide.title,
            description: slide.subtitle,
            url: `https://autoeden.co.zw${slide.buyLink}`,
          })),
        })}
      </script>
    </section>
  );
}