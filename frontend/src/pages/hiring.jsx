// src/pages/HiringPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Briefcase, Users, Heart, Zap, 
  MapPin, Clock, ArrowRight, Mail,
  Coffee, Laptop, Globe
} from "lucide-react";
import { IoIosLaptop } from "react-icons/io";
import { TbHealthRecognition } from "react-icons/tb";
import { SiCoffeescript } from "react-icons/si";
import { PiCoffeeLight } from "react-icons/pi";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { GiEarthAfricaEurope } from "react-icons/gi";
import { GiWorld } from "react-icons/gi";


/**
 * Hiring Page - Auto Eden Careers
 * SEO-optimized careers page (currently no open positions)
 */
export default function HiringPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  // Company benefits/perks
  const perks = [
    {
      icon: <IoIosLaptop className="w-6 h-6" />,
      title: "Flexible Work",
      description: "Remote-friendly with flexible hours"
    },
    {
      icon: <TbHealthRecognition className="w-6 h-6" />,
      title: "Health Benefits",
      description: "Comprehensive medical coverage"
    },
    {
      icon: <SiCoffeescript className="w-6 h-6" />,
      title: "Great Culture",
      description: "Collaborative, fun environment"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Growth",
      description: "Learning & development support"
    },
    {
      icon: <GiEarthAfricaEurope className="w-6 h-6" />,
      title: "Impact",
      description: "Shape Zimbabwe's car industry"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Events",
      description: "Regular team building activities"
    }
  ];

  // Empty jobs array - will be populated when positions open
  const openPositions = [];

  return (
    <main className="pacaembu-font min-h-screen bg-gray-50">
      {/* SEO Hidden Heading */}
      <h1 className="sr-only">
        Careers at Auto Eden - Join Zimbabwe's Leading Car Marketplace Team
      </h1>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-[80vh] text-white py-20 lg:py-28 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl pt-15"
          >
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <Briefcase className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Careers</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Build the Future of Car Trading in Zimbabwe
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              We're on a mission to make buying and selling cars simple, transparent, 
              and accessible to everyone. Join us in reshaping the automotive industry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 lg:py-20 bg-white" aria-labelledby="why-join">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="why-join" className="text-3xl font-bold text-gray-900 mb-4">
              Why Join Auto Eden?
            </h2>
            <p className="text-lg text-gray-600">
              We offer more than just a job. We offer a chance to make a real impact.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                  {perk.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{perk.title}</h3>
                  <p className="text-gray-600 text-sm">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 lg:py-20 bg-gray-50" aria-labelledby="open-positions">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 id="open-positions" className="text-3xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-gray-600">
              Current opportunities to join our growing team
            </p>
          </motion.div>

          {openPositions.length > 0 ? (
            <div className="space-y-4">
              {openPositions.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/hiring/${job.id}`}
                      className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 text-center border border-gray-200"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No Open Positions Right Now
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                We don't have any open roles at the moment, but we're always looking 
                for talented people. Send us your CV and we'll keep you in mind!
              </p>
              <a
                href="mailto:careers@autoeden.co.zw"
                className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Your CV
              </a>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Don't See a Fit? Let's Stay Connected
            </h2>
            <p className="text-red-100 mb-6">
              Follow us on social media for updates on new positions and company news.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://linkedin.com/company/autoeden"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-red-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Follow on LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Auto Eden",
            "sameAs": "https://autoeden.co.zw",
            "logo": "https://autoeden.co.zw/logo.png"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Harare",
              "addressCountry": "ZW"
            }
          }
        })}
      </script>
    </main>
  );
}