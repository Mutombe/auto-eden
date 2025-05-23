// src/pages/AboutPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Award, Users, Clock, Globe, Check, ChevronRight, Car } from "lucide-react";
import { Button } from "@mui/material";

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const milestones = [
    {
      year: "2018",
      title: "Foundation",
      description: "Auto Eden was established with a vision to transform the pre-owned automotive marketplace.",
    },
    {
      year: "2019",
      title: "Digital Innovation",
      description: "Launched our proprietary verification technology and online platform.",
    },
    {
      year: "2021",
      title: "National Expansion",
      description: "Expanded operations to cover all major metropolitan areas across the country.",
    },
    {
      year: "2023",
      title: "Industry Recognition",
      description: "Received multiple awards for customer satisfaction and service excellence.",
    },
    {
      year: "2024",
      title: "Global Vision",
      description: "Initiated international expansion with a focus on premium markets.",
    },
  ];

  const teamMembers = [
    {
      name: "Alexandra Mutimutema",
      position: "Chief Executive Officer",
      image: "/user1.jpg",
      description: "With over 15 years of experience in automotive retail and technology, Alexandra leads Auto Eden's strategic vision and operations.",
    },
    {
      name: "Marcus Mutimutema",
      position: "Chief Technology Officer",
      image: "/user1.jpg",
      description: "A pioneer in automotive tech, Marcus oversees our digital platform and innovative verification systems.",
    },
    {
      name: "Samantha Mutimutema",
      position: "Customer Experience Director",
      image: "/user1.jpg",
      description: "Dedicated to creating seamless experiences, Samantha ensures client satisfaction at every touchpoint.",
    },
  ];

  const values = [
    {
      icon: <Check className="w-6 h-6 text-red-600" />,
      title: "Integrity",
      description: "We believe in complete transparency and honesty in every transaction and interaction."
    },
    {
      icon: <Award className="w-6 h-6 text-red-600" />,
      title: "Excellence",
      description: "We strive for excellence in our service, our platform, and our customer relationships."
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
      title: "Community",
      description: "We build lasting relationships with our customers and within the communities we serve."
    },
    {
      icon: <Globe className="w-6 h-6 text-red-600" />,
      title: "Sustainability",
      description: "We are committed to environmentally responsible practices in all aspects of our business."
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-black to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Auto Eden</h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10">
              Redefining the experience of buying and selling brand-new and premium pre-owned vehicles through transparency, 
              innovation, and exceptional service.
            </p>
            {/*<div className="flex justify-center">
              <Button
                variant="contained"
                size="large"
                className="!bg-red-600 !text-white !hover:bg-red-700 !rounded-lg !px-8 !py-3 !font-medium"
                endIcon={<ChevronRight />}
              >
                Our Story
              </Button>
            </div>*/}
          </motion.div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div 
              className="md:w-1/2"
              {...fadeIn}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Journey</h2>
              <p className="text-lg text-gray-700 mb-6">
                Founded in 2019, Auto Eden began with a simple yet powerful vision: to create a marketplace where buying and selling cars would be a pleasant, transparent, and rewarding experience. Our founders, having experienced the frustrations of traditional car dealerships and private sales, saw an opportunity to combine technology, expertise, and customer service to transform the industry.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                What started as a small team with big dreams has evolved into a national platform trusted by thousands of customers. Our commitment to verification, fair pricing, and exceptional service has made us a leader in the premium pre-owned vehicle market.
              </p>
              <p className="text-lg text-gray-700">
                Today, Auto Eden continues to innovate and expand, guided by our founding principles and driven by our passion for connecting people with their perfect vehicles.
              </p>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="/about.png" 
                  alt="Auto Eden headquarters" 
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <p className="text-white font-medium">Our headquarters</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              These principles guide every decision we make and define who we are as a company.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-700">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Timeline</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              A journey of growth, innovation, and dedication to excellence.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-red-600"></div>
            
            <motion.div
              className="space-y-16"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className={`flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                >
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'} mb-6 md:mb-0`}>
                    <div className="bg-red-600 text-white inline-block px-4 py-1 rounded-full mb-3">
                      {milestone.year}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-lg text-gray-700">{milestone.description}</p>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-red-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Meet the experts driving Auto Eden's vision and success.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-70 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-red-600 font-medium mb-4">{member.position}</p>
                  <p className="text-gray-700">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-black to-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="max-w-3xl mx-auto"
            {...fadeIn}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Experience Auto Eden?</h2>
            <p className="text-xl text-gray-200 mb-8">
              Join us in redefining the car buying and selling experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="contained"
                size="large"
                className="!bg-white !text-red-600 !hover:bg-gray-100 !rounded-lg !px-8 !py-3 !font-medium"
                startIcon={<Car className="w-5 h-5" />}
              >
                Browse Marketplace
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="!text-white !border-white !rounded-lg !px-8 !py-3 !hover:bg-white/10 !font-medium"
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}