// src/pages/AboutPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { 
  Car, Upload, Search, Shield, CheckCircle, 
  CreditCard, Key, Camera, FileCheck, Users,
  ArrowRight, BadgeCheck, Handshake, Eye,
  Clock, Zap, DollarSign, Heart
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * About Page - Auto Eden
 * SEO-optimized, user-friendly page explaining our story and processes
 */
export default function AboutPage() {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  // Step-by-step process for sellers
  const sellerSteps = [
    {
      step: 1,
      icon: <Camera className="w-6 h-6" />,
      title: "Upload Your Vehicle",
      description: "Take clear photos of your car and fill in the details. It's completely free — no listing fees ever."
    },
    {
      step: 2,
      icon: <FileCheck className="w-6 h-6" />,
      title: "We Verify Your Car",
      description: "Our team reviews your listing digitally, then schedules a physical inspection at no cost to you."
    },
    {
      step: 3,
      icon: <Eye className="w-6 h-6" />,
      title: "Buyers Find You",
      description: "Your verified listing goes live. Thousands of buyers browse and express interest in your vehicle."
    },
    {
      step: 4,
      icon: <Handshake className="w-6 h-6" />,
      title: "Secure Sale",
      description: "We facilitate the transaction. You get paid securely, and the buyer gets their dream car."
    }
  ];

  // Step-by-step process for buyers
  const buyerSteps = [
    {
      step: 1,
      icon: <Search className="w-6 h-6" />,
      title: "Browse Freely",
      description: "Explore our entire marketplace at no cost. Filter by make, model, price, and more."
    },
    {
      step: 2,
      icon: <BadgeCheck className="w-6 h-6" />,
      title: "Trust Our Verification",
      description: "Every vehicle is digitally and physically verified. View detailed inspection reports."
    },
    {
      step: 3,
      icon: <Car className="w-6 h-6" />,
      title: "Schedule a Test Drive",
      description: "Found the one? Book a test drive to experience the vehicle firsthand."
    },
    {
      step: 4,
      icon: <Key className="w-6 h-6" />,
      title: "Drive Away Happy",
      description: "Complete the secure transaction through Auto Eden and get the keys to your new car."
    }
  ];

  // Why choose us points
  const whyChooseUs = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Zero Fees for Sellers",
      description: "List your vehicle completely free. No hidden charges, no listing fees, no commissions on your sale."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Vehicles Only",
      description: "Every car undergoes rigorous digital and physical verification before appearing on our platform."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast & Simple",
      description: "Our streamlined process means less waiting, less paperwork, and more time enjoying your car."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer First",
      description: "We're here to help at every step. Real people, real support, real results."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* SEO-optimized hidden heading */}
      <h1 className="sr-only">
        About Auto Eden - Zimbabwe's Free Car Marketplace | How to Buy & Sell Cars
      </h1>

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm font-medium mb-6">
              Est. 2019 • Harare, Zimbabwe
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              We're Making Car Trading 
              <span className="text-red-500"> Simple & Free</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-8">
              Auto Eden is Zimbabwe's first truly free car marketplace. We connect buyers 
              and sellers without the traditional fees, paperwork hassles, or trust issues 
              that plague the industry.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/sell"
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Sell Your Car
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-white/20"
              >
                Browse Cars
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24 bg-white" aria-labelledby="our-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...fadeInUp}>
              <h2 id="our-story" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2019, Auto Eden was born from a simple frustration: buying and 
                  selling cars in Zimbabwe was expensive, complicated, and often risky. 
                  Traditional platforms charged sellers hefty fees, and buyers had no way 
                  to verify vehicle conditions.
                </p>
                <p>
                  We asked ourselves: <strong className="text-gray-900">what if car trading could be free, 
                  transparent, and trustworthy?</strong>
                </p>
                <p>
                  Today, Auto Eden is Zimbabwe's leading car marketplace where sellers list 
                  for free, every vehicle is verified, and secure transactions are guaranteed. 
                  We've helped thousands of Zimbabweans find their perfect cars and get fair 
                  value for their vehicles.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-red-600">1000+</div>
                  <div className="text-sm text-gray-500">Happy Customers</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-red-600">100%</div>
                  <div className="text-sm text-gray-500">Verified Cars</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-red-600">$0</div>
                  <div className="text-sm text-gray-500">Listing Fee</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              {...fadeInUp}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <img 
                  src="/city2.jpg" 
                  alt="Auto Eden team helping customers find their perfect car in Harare"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/placeholder-about.jpg";
                  }}
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Trusted Platform</div>
                    <div className="text-sm text-gray-500">Since 2019</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-gray-50" aria-labelledby="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="why-choose-us" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Auto Eden?
            </h2>
            <p className="text-lg text-gray-600">
              We're not just another marketplace. We're changing how Zimbabwe buys and sells cars.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How to Sell - Step by Step */}
      <section className="py-16 lg:py-24 bg-white" aria-labelledby="how-to-sell">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
              For Sellers
            </span>
            <h2 id="how-to-sell" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How to Sell Your Car
            </h2>
            <p className="text-lg text-gray-600">
              List your vehicle in minutes. No fees, no hassle, just results.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {sellerSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < sellerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2 z-0" />
                )}
                
                <div className="relative bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-green-200 transition-colors z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4 mt-2">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="text-center mt-10">
            <Link
              to="/sell"
              className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Selling — It's Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How to Buy - Step by Step */}
      <section className="py-16 lg:py-24 bg-gray-900 text-white" aria-labelledby="how-to-buy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              For Buyers
            </span>
            <h2 id="how-to-buy" className="text-3xl lg:text-4xl font-bold mb-4">
              How to Buy Your Dream Car
            </h2>
            <p className="text-lg text-gray-400">
              Find verified vehicles from trusted sellers. Browse free, buy with confidence.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {buyerSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < buyerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-700 -translate-x-1/2 z-0" />
                )}
                
                <div className="relative bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4 mt-2">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="text-center mt-10">
            <Link
              to="/marketplace"
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
              Join thousands of Zimbabweans who trust Auto Eden for buying and selling vehicles. 
              It's free, it's simple, and it works.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Find Your Car
              </Link>
              <Link
                to="/sell"
                className="w-full sm:w-auto px-8 py-4 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors border border-red-500"
              >
                Sell Your Car
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Auto Eden",
          "description": "Zimbabwe's first truly free car marketplace. List vehicles for free, browse for free, verified cars, secure transactions.",
          "url": "https://autoeden.co.zw",
          "logo": "https://autoeden.co.zw/logo.png",
          "foundingDate": "2019",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Harare",
            "addressCountry": "ZW"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+263782222032",
            "contactType": "customer service"
          }
        })}
      </script>
    </main>
  );
}