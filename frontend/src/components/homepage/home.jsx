import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, ChevronLeft, ChevronRight,
  Shield, Check, Zap, DollarSign, Users,
  Car, BadgeCheck, Handshake, Eye
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMarketplace } from "../../redux/slices/vehicleSlice";
import { SiFsecure } from "react-icons/si";
import { IoCarSportOutline } from "react-icons/io5";
import { TbCarSuv } from "react-icons/tb";
import { PiArrowsOutCardinalLight } from "react-icons/pi";
import { PiHandshake } from "react-icons/pi";
import { MdEmojiPeople } from "react-icons/md";
import { TiThListOutline } from "react-icons/ti";

// Import the hero component
import HeroCarousel from "./hero";

/**
 * Vehicle Card Skeleton - Shows while loading
 */
const VehicleCardSkeleton = () => (
  <div className="flex-shrink-0 w-[320px] sm:w-[380px] lg:w-[420px] bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
    <div className="aspect-[16/10] bg-gray-200" />
    <div className="p-6">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded-lg flex-1" />
        <div className="h-10 bg-gray-200 rounded-lg flex-1" />
      </div>
    </div>
  </div>
);

/**
 * Vehicle Card Component - Tesla-inspired design
 */
const VehicleCard = ({ vehicle }) => {
  // Use main_image like marketplace page does, fallback to images array
  const mainImage = vehicle.main_image || vehicle.images?.[0]?.image || "/placeholder-car.jpg";
  const price = vehicle.price || vehicle.proposed_price;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-shrink-0 w-[320px] sm:w-[380px] lg:w-[420px] group"
    >
      <div className="pacaembu-font relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Vehicle Category Tag */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
            {vehicle.body_type || "Vehicle"}
          </span>
        </div>

        {/* Verification Badge */}
        {vehicle.is_physically_verified && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Vehicle Image */}
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={mainImage}
            alt={`${vehicle.make} ${vehicle.model} - Buy at Auto Eden Zimbabwe`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/placeholder-car.jpg";
            }}
          />
        </div>

        {/* Card Content - Bottom aligned like Tesla */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          {/* Vehicle Name */}
          <h3 className="text-2xl font-medium text-white mb-1">
            {vehicle.make} {vehicle.model}
          </h3>
          
          {/* Year & Price */}
          <p className="text-white/80 text-sm mb-4">
            {vehicle.year} • From ${price?.toLocaleString() || "TBA"}
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
            >
              View Details
            </Link>
            <Link
              to={`/vehicles/${vehicle.id}`}
              className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium rounded-lg text-center transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Featured Vehicles Section - Horizontal scroll like Tesla
 */
const FeaturedVehicles = () => {
  const dispatch = useDispatch();
  const { marketplace, loading } = useSelector((state) => state.vehicles);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = React.useRef(null);

  useEffect(() => {
    setIsLoading(true);
    // Fetch with default filters to get marketplace vehicles
    const defaultFilters = {
      page: 1,
      page_size: 12,
    };
    dispatch(fetchMarketplace(defaultFilters))
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  // Get 5 random vehicles from marketplace.results
  const featuredVehicles = React.useMemo(() => {
    const vehicles = marketplace?.results || [];
    if (!vehicles.length) return [];
    const shuffled = [...vehicles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, [marketplace]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 400;
    const newPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <section className="pacaembu-font py-12 lg:py-16 bg-white" aria-labelledby="featured-vehicles-heading">
      <div className="max-w-[1600px] mx-auto">
        {/* Section Header */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8 flex items-center justify-between">
          <div>
            <h2 id="featured-vehicles-heading" className="text-2xl lg:text-3xl font-medium text-gray-900">
              Featured Vehicles
            </h2>
            <p className="text-gray-500 mt-1">Verified and ready for you</p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            // Show skeletons while loading
            <>
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
              <VehicleCardSkeleton />
            </>
          ) : featuredVehicles.length > 0 ? (
            // Show actual vehicles
            featuredVehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          ) : (
            // Fallback if no vehicles
            <div className="w-full text-center py-12 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No vehicles available at the moment</p>
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="px-4 sm:px-6 lg:px-8 mt-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all vehicles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/**
 * Brand Logos Marquee - Auto-scrolling brand logos
 */
const BrandLogosMarquee = () => {
  const brands = [
    { name: "Toyota", logo: "/logos/autoeden-toyota-logo.png" },
    { name: "Honda", logo: "/logos/autoeden-honda-logo.png" },
    { name: "Mercedes-Benz", logo: "/logos/autoeden-mercedes-logo.png" },
    { name: "Nissan", logo: "/logos/autoeden-nissan-logo.png" },
    { name: "Isuzu", logo: "/logos/autoeden-isuzu-logo.png" },
    { name: "Haval", logo: "/logos/autoeden-haval-logo.png" },
    { name: "BMW", logo: "/logos/autoeden-bmw-logo.png" },
    { name: "Mazda", logo: "/logos/autoeden-mazda-logo.png" },
    { name: "Volkswagen", logo: "/logos/autoeden-vw-logo.png" },
    { name: "Ford", logo: "/logos/autoeden-ford-logo.png" },
  ];

  // Double the brands array for seamless loop
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="pacaembu-font py-10 bg-gray-50 overflow-hidden" aria-label="Popular car brands in Zimbabwe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-medium">
          Popular Brands in Zimbabwe
        </p>
      </div>
      
      {/* Marquee Container */}
      <div className="relative">
        <motion.div
          className="flex gap-12 items-center"
          animate={{ x: [0, -1920] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <Link
              key={`${brand.name}-${index}`}
              to={`/marketplace?make=${brand.name}`}
              className="flex-shrink-0 flex items-center justify-center w-32 h-16 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo}
                alt={`${brand.name} vehicles for sale in Zimbabwe`}
                className="max-h-10 max-w-full object-contain"
                loading="lazy"
                onError={(e) => {
                  // Fallback to text if logo doesn't load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="text-gray-600 font-medium text-lg hidden">{brand.name}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/**
 * Value Proposition / Narrative Section
 * SEO-optimized content explaining Auto Eden's unique selling points
 */
const NarrativeSection = () => {
  const steps = [
    {
      icon: <IoCarSportOutline className="w-8 h-8" />,
      title: "List for Free",
      description: "Sellers upload vehicles at zero cost. No listing fees, no hidden charges.",
      forWho: "For Sellers"
    },
    {
      icon: <SiFsecure className="w-8 h-8" />,
      title: "Free Verification",
      description: "We verify every vehicle digitally and physically at no cost to you.",
      forWho: "Our Promise"
    },
    {
      icon: <PiArrowsOutCardinalLight className="w-8 h-8" />,
      title: "Browse Freely",
      description: "Buyers explore our entire marketplace without any viewing fees.",
      forWho: "For Buyers"
    },
    {
      icon: <PiHandshake className="w-8 h-8" />,
      title: "Secure Transaction",
      description: "We handle the payment. Seller gets paid, buyer gets their car safely.",
      forWho: "The Deal"
    }
  ];

  return (
    <section className="pacaembu-font py-16 lg:py-24 bg-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SEO-rich header */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Why We're Different
          </span>
          
          <h2 id="how-it-works-heading" className="text-3xl lg:text-4xl font-medium text-gray-900 mb-6">
            Zimbabwe's First Truly Free Car Marketplace
          </h2>
          
          {/* SEO narrative paragraph */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Unlike other platforms that charge sellers to list vehicles, 
            <strong className="text-gray-900"> Auto Eden is 100% free for sellers</strong>. 
            We verify every car at no cost, and buyers can browse without restrictions. 
            When you find your perfect car, we handle the secure transaction — 
            sellers get paid, buyers drive away happy.
          </p>
        </header>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              
              {/* For Who Badge */}
              <span className="text-xs font-medium text-red-600 uppercase tracking-wider">
                {step.forWho}
              </span>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-700 my-4 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/sell"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors inline-flex items-center"
            >
              Sell Your Car Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Top Sellers Section - Shows popular makes/models in Zimbabwe
 */
const TopSellersSection = () => {
  const topSellers = [
    { make: "Toyota", model: "Hilux", image: "/top-sellers/autoeden-hilux.avif", count: 45 },
    { make: "Honda", model: "Fit", image: "/top-sellers/autoeden-c-class.jpg", count: 38 },
    { make: "Nissan", model: "X-Trail", image: "/top-sellers/autoeden-xtrail.webp", count: 32 },
    { make: "Toyota", model: "Aqua", image: "/top-sellers/2023-toyota-aqua-gr-sport.jpg", count: 28 },
    { make: "Mercedes", model: "C-Class", image: "/top-sellers/autoeden-c-class.jpg", count: 24 },
    { make: "Toyota", model: "Fortuner", image: "/top-sellers/Autoeden-Toyota-Fortuner.avif", count: 21 },
  ];

  return (
    <section className="pacaembu-font py-16 lg:py-20 bg-gray-50" aria-labelledby="top-sellers-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 id="top-sellers-heading" className="text-2xl lg:text-3xl font-medium text-gray-900">
              Top Sellers in Zimbabwe
            </h2>
            <p className="text-gray-500 mt-1">Most popular vehicles on our platform</p>
          </div>
          <Link
            to="/marketplace"
            className="hidden sm:inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topSellers.map((car, index) => (
            <Link
              key={index}
              to={`/marketplace?make=${car.make}&model=${car.model}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-200"
            >
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 z-10 w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Image */}
              <img
                src={car.image}
                alt={`${car.make} ${car.model} for sale in Zimbabwe`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/placeholder-car.jpg";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold">{car.make}</p>
                <p className="text-white/80 text-sm">{car.model}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden text-center mt-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            View all vehicles
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

/**
 * Simple CTA Section
 */
const SimpleCTA = () => (
  <section className="pacaembu-font py-16 lg:py-20 bg-gray-900 text-white">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl lg:text-4xl font-medium mb-4">
        Ready to Find Your Next Car?
      </h2>
      <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
        Join thousands of Zimbabweans who trust Auto Eden for buying and selling vehicles. 
        Zero fees, verified cars, secure transactions.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/marketplace"
          className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center"
        >
          Browse Cars
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
        <Link
          to="/sell"
          className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-white/20"
        >
          Sell Your Car
        </Link>
      </div>
      
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-400">
        <div className="flex items-center">
          <TiThListOutline className="w-5 h-5 mr-2 text-green-400" />
          100% Free Listing
        </div>
        <div className="flex items-center">
          <SiFsecure className="w-5 h-5 mr-2 text-blue-400" />
          Verified Vehicles
        </div>
        <div className="flex items-center">
          <MdEmojiPeople className="w-5 h-5 mr-2 text-purple-400" />
          1000+ Happy Customers
        </div>
      </div>
    </div>
  </section>
);

/**
 * Main Homepage Component
 */
export default function HomePage() {
  return (
    <main className="pacaembu-font min-h-screen bg-white">
      {/* SEO Meta Content - Hidden but crawlable */}
      <h1 className="sr-only">
        Auto Eden - Zimbabwe's Free Car Marketplace | Buy & Sell Vehicles Online
      </h1>
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Featured Vehicles - Tesla-style horizontal scroll */}
      <FeaturedVehicles />

      {/* Brand Logos Marquee */}
      <BrandLogosMarquee />

      {/* Value Proposition / How It Works */}
      <NarrativeSection />

      {/* Top Sellers in Zimbabwe */}
      <TopSellersSection />

      {/* Simple CTA */}
      <SimpleCTA />

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          "name": "Auto Eden",
          "description": "Zimbabwe's first truly free car marketplace. List vehicles for free, browse for free, verified cars, secure transactions.",
          "url": "https://autoeden.co.zw",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Harare",
            "addressCountry": "ZW"
          },
          "priceRange": "Free to list",
          "openingHours": "Mo-Su 00:00-24:00",
          "sameAs": [
            "https://facebook.com/autoedenzw",
            "https://instagram.com/autoedenzw",
            "https://twitter.com/autoedenzw"
          ]
        })}
      </script>
    </main>
  );
}