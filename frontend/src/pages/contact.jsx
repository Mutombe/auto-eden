// src/pages/ContactPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, Clock, Send, 
  MessageCircle, CheckCircle, AlertCircle
} from "lucide-react";

/**
 * Contact Page - Auto Eden
 * SEO-optimized contact page with form and contact information
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setStatus("success");
      setLoading(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+263 78 222 2032",
      href: "tel:+263782222032"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "admin@autoeden.co.zw",
      href: "mailto:admin@autoeden.co.zw"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Location",
      value: "Harare, Zimbabwe",
      href: null
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Hours",
      value: "Mon - Sat: 8AM - 6PM",
      href: null
    }
  ];

  return (
    <main className="pacaembu-font min-h-screen bg-gray-50">
      {/* SEO Hidden Heading */}
      <h1 className="sr-only">Contact Auto Eden - Get in Touch | Customer Support Zimbabwe</h1>

      {/* Hero */}
      <section className="bg-gray-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 text-red-400 text-sm font-medium mb-4">
              <MessageCircle className="w-4 h-4" />
              Get in Touch
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              We'd Love to Hear From You
            </h2>
            <p className="text-gray-400 text-lg">
              Have questions about buying or selling? Need help with your listing? 
              Our team is here to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      {item.href ? (
                        <a 
                          href={item.href} 
                          className="text-gray-900 font-medium hover:text-red-600 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-900 font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/learn" className="text-gray-600 hover:text-red-600 transition-colors">
                      → Help Center & FAQs
                    </a>
                  </li>
                  <li>
                    <a href="/suggestions" className="text-gray-600 hover:text-red-600 transition-colors">
                      → Submit a Suggestion
                    </a>
                  </li>
                  <li>
                    <a href="/reviews" className="text-gray-600 hover:text-red-600 transition-colors">
                      → Leave a Review
                    </a>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Send Us a Message</h3>

                {status === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700">Thank you! We'll get back to you soon.</p>
                  </div>
                )}

                {status === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">Something went wrong. Please try again.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="+263 78 000 0000"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      >
                        <option value="">Select a topic</option>
                        <option value="buying">Buying a Car</option>
                        <option value="selling">Selling a Car</option>
                        <option value="verification">Verification Process</option>
                        <option value="account">Account Issues</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Auto Eden",
          "description": "Get in touch with Auto Eden for help with buying or selling cars in Zimbabwe",
          "url": "https://autoeden.co.zw/contact",
          "mainEntity": {
            "@type": "Organization",
            "name": "Auto Eden",
            "telephone": "+263782222032",
            "email": "admin@autoeden.co.zw",
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