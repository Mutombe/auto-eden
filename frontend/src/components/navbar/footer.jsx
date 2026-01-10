// src/components/Footer.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Facebook, Twitter, Instagram, Linkedin, 
  X, ExternalLink 
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";


// Privacy & Legal Modal Component
export const PrivacyLegalModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("privacy");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("privacy")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "privacy" 
                    ? "bg-red-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setActiveTab("terms")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "terms" 
                    ? "bg-red-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Terms of Service
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === "privacy" ? (
              <div className="prose prose-sm max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
                <p className="text-gray-600 mb-4">Last updated: January 2026</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">1. Information We Collect</h3>
                <p className="text-gray-600 mb-4">
                  Auto Eden collects information you provide directly, including your name, email address, 
                  phone number, and vehicle information when you create listings or make inquiries.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">2. How We Use Your Information</h3>
                <p className="text-gray-600 mb-4">
                  We use your information to facilitate vehicle listings, connect buyers and sellers, 
                  process transactions, and improve our services. We never sell your personal data.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">3. Data Security</h3>
                <p className="text-gray-600 mb-4">
                  We implement industry-standard security measures to protect your personal information. 
                  All data is encrypted in transit and at rest.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">4. Your Rights</h3>
                <p className="text-gray-600 mb-4">
                  You have the right to access, correct, or delete your personal data at any time. 
                  Contact us at privacy@autoeden.co.zw for any privacy-related requests.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">5. Contact Us</h3>
                <p className="text-gray-600">
                  For questions about this Privacy Policy, please contact us at admin@autoeden.co.zw 
                  or call +263 78 222 2032.
                </p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Terms of Service</h2>
                <p className="text-gray-600 mb-4">Last updated: January 2026</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">1. Acceptance of Terms</h3>
                <p className="text-gray-600 mb-4">
                  By accessing and using Auto Eden, you agree to be bound by these Terms of Service. 
                  If you do not agree, please do not use our platform.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">2. User Responsibilities</h3>
                <p className="text-gray-600 mb-4">
                  Users must provide accurate information when creating listings. Sellers are responsible 
                  for the accuracy of vehicle descriptions and images. Misrepresentation may result in 
                  account suspension.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">3. Listing Policy</h3>
                <p className="text-gray-600 mb-4">
                  Listings are free for all users. Auto Eden reserves the right to remove listings 
                  that violate our policies or contain fraudulent information.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">4. Transaction Handling</h3>
                <p className="text-gray-600 mb-4">
                  Auto Eden facilitates secure transactions between buyers and sellers. We act as an 
                  intermediary to ensure both parties fulfill their obligations.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">5. Limitation of Liability</h3>
                <p className="text-gray-600">
                  Auto Eden is not liable for disputes between buyers and sellers beyond our role as 
                  a marketplace facilitator. We encourage all parties to conduct due diligence.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Slim Footer Component
 * Minimal, single-row footer with essential links
 */
export default function Footer() {
  const [showLegalModal, setShowLegalModal] = useState(false);
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/autoedenzw", icon: Facebook },
    { name: "Twitter", href: "https://twitter.com/autoedenzw", icon: FaXTwitter },
    { name: "Instagram", href: "https://instagram.com/autoedenzw", icon: Instagram },
    { name: "LinkedIn", href: "https://linkedin.com/company/autoeden", icon: Linkedin },
  ];

  return (
    <>
      <footer className="pacaembu-font bg-gray-900 text-gray-400 py-4" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-white">Auto Eden</span>
              <span className="hidden sm:inline">•</span>
              <span>© {currentYear}</span>
            </div>

            {/* Center: Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm" aria-label="Footer navigation">
              <Link to="/learn" className="hover:text-white transition-colors">
                Learn
              </Link>
              <Link to="/hiring" className="hover:text-white transition-colors">
                Hiring
              </Link>
              <button 
                onClick={() => setShowLegalModal(true)}
                className="hover:text-white transition-colors"
              >
                Privacy & Legal
              </button>
              <Link to="/news" className="hover:text-white transition-colors">
                News
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/suggestions" className="hover:text-white transition-colors">
                Suggestions
              </Link>
              <Link to="/reviews" className="hover:text-white transition-colors">
                Reviews
              </Link>
            </nav>

            {/* Right: Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy & Legal Modal */}
      <PrivacyLegalModal isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} />
    </>
  );
}