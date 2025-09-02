import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TrendingUp, Car, Users, Heart, Award } from 'lucide-react';

// Custom hook for animated counter
const useAnimatedCounter = (targetValue, duration = 2000, isInView = false) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric value from string (e.g., "16+" -> 16, "98%" -> 98)
    const numericTarget = parseInt(targetValue.replace(/[^0-9]/g, ''));
    const suffix = targetValue.replace(/[0-9]/g, '');
    
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Use easeOutExpo for smooth deceleration
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOutExpo * numericTarget);
      
      setCurrentValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, duration, isInView]);

  // Return the animated value with original suffix
  const suffix = targetValue.replace(/[0-9]/g, '');
  return currentValue + suffix;
};

const StatsSection = ({ containerVariants, itemVariants, statsVariants, statsControls }) => {
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const stats = [
    { 
      value: "62+", 
      label: "Premium Vehicles", 
      icon: <Car className="w-6 h-6" />, 
      color: "from-red-500 to-orange-500",
      image: "/stat1.jpg"
    },
    { 
      value: "500+", 
      label: "Happy Customers", 
      icon: <Users className="w-6 h-6" />, 
      color: "from-blue-500 to-cyan-500",
      image: "/stat2.jpg"
    },
    { 
      value: "98%", 
      label: "Satisfaction Rate", 
      icon: <Heart className="w-6 h-6" />, 
      color: "from-green-500 to-emerald-500",
      image: "/stat3.jpg"
    },
    { 
      value: "24/7", 
      label: "Expert Support", 
      icon: <Award className="w-6 h-6" />, 
      color: "from-purple-500 to-pink-500",
      image: "/stat4.jpg"
    }
  ];

  return (
    <div ref={statsRef} className="relative bg-white/80 backdrop-blur-xl py-16 lg:py-20 border-t border-gray-200/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-red-50/50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={statsControls}
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 text-sm font-bold border border-red-200/50 mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trusted by Thousands
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-3xl lg:text-4xl text-gray-900 mb-4">
            Numbers That Speak for Themselves
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Join the growing community of satisfied customers who trust Auto Eden
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => {
            // Use the animated counter hook for each stat
            const animatedValue = useAnimatedCounter(
              stat.value, 
              2000 + (index * 200), // Stagger the animations slightly
              statsInView
            );

            return (
              <motion.div
                key={index}
                variants={statsVariants}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="group relative p-6 lg:p-8 rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 overflow-hidden"
              >
                {/* Background image with gradient overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <img 
                    src={stat.image} 
                    alt="" 
                    className="w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                </div>
                
                {/* Icon */}
                <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                
                {/* Animated Value */}
                <div className="relative text-3xl lg:text-4xl font-black text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300">
                  {animatedValue}
                </div>
                
                {/* Label */}
                <p className="relative text-gray-600 font-semibold group-hover:text-gray-700 transition-colors duration-300">
                  {stat.label}
                </p>
                
                {/* Decorative element */}
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default StatsSection;