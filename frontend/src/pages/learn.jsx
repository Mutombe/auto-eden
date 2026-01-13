// src/pages/LearnPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BookOpen, Car, Shield, DollarSign, Camera, 
  FileCheck, Search, Key, ArrowRight, Clock,
  CheckCircle, HelpCircle, Lightbulb
} from "lucide-react";

/**
 * Learn Page - Educational content about Auto Eden
 * SEO-optimized articles to help users navigate the platform
 */
export default function LearnPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  // Featured guides
  const guides = [
    {
      id: "selling-guide",
      icon: <Car className="w-6 h-6" />,
      category: "Sellers",
      title: "Complete Guide to Selling Your Car on Auto Eden",
      description: "Learn how to create a compelling listing, take great photos, and get the best price for your vehicle.",
      readTime: "8 min read",
      featured: true
    },
    {
      id: "buying-guide",
      icon: <Search className="w-6 h-6" />,
      category: "Buyers",
      title: "How to Find Your Perfect Car on Auto Eden",
      description: "Master our search filters, understand verification badges, and make informed buying decisions.",
      readTime: "6 min read",
      featured: true
    },
    {
      id: "selling-cars-zimbabwe",
      icon: <Car className="w-6 h-6" />,
      category: "Market Guide",
      title: "The Complete Guide to Selling Cars in Zimbabwe",
      description: "Everything you need to know about selling cars in Zimbabwe. Market insights, legal requirements, and tips.",
      readTime: "10 min read",
      featured: true
    },
    {
      id: "buying-cars-zimbabwe",
      icon: <Search className="w-6 h-6" />,
      category: "Market Guide",
      title: "Buying Cars in Zimbabwe: What You Need to Know",
      description: "Market overview, import vs local, financing options, legal requirements, and tips for finding deals.",
      readTime: "12 min read",
      featured: true
    },
    {
      id: "verification-explained",
      icon: <Shield className="w-6 h-6" />,
      category: "Trust & Safety",
      title: "Understanding Our Verification Process",
      description: "Learn what happens when we verify a vehicle and why it matters for your peace of mind.",
      readTime: "5 min read",
      featured: false
    },
    {
      id: "pricing-tips",
      icon: <DollarSign className="w-6 h-6" />,
      category: "Sellers",
      title: "How to Price Your Car Competitively",
      description: "Get tips on researching market value and setting a price that attracts serious buyers.",
      readTime: "4 min read",
      featured: false
    },
    {
      id: "photo-tips",
      icon: <Camera className="w-6 h-6" />,
      category: "Sellers",
      title: "Taking Photos That Sell",
      description: "Professional tips for capturing your vehicle in the best light — literally.",
      readTime: "5 min read",
      featured: false
    },
    {
      id: "test-drive",
      icon: <Key className="w-6 h-6" />,
      category: "Buyers",
      title: "Scheduling and Conducting Test Drives",
      description: "What to look for during a test drive and how to arrange one through Auto Eden.",
      readTime: "4 min read",
      featured: false
    },
    {
      id: "selling-cars-harare",
      icon: <Car className="w-6 h-6" />,
      category: "Market Guide",
      title: "Selling Cars in Harare: The Local Guide",
      description: "Harare-specific strategies, best viewing locations, and tips for selling in the capital.",
      readTime: "7 min read",
      featured: false
    },
    {
      id: "buying-cars-harare",
      icon: <Search className="w-6 h-6" />,
      category: "Market Guide",
      title: "Buying Cars in Harare: Your Local Guide",
      description: "Best places to find cars in Harare, safe meeting spots, and local buying tips.",
      readTime: "7 min read",
      featured: false
    },
    {
      id: "buying-cars-online",
      icon: <Search className="w-6 h-6" />,
      category: "Buyers",
      title: "Buying Cars Online in Zimbabwe: A Complete Guide",
      description: "How to safely buy cars online. Platform comparison, scam prevention, and secure transactions.",
      readTime: "8 min read",
      featured: false
    }
  ];

  // FAQ items
  const faqs = [
    {
      question: "Is it really free to list my car?",
      answer: "Yes, 100% free. Auto Eden charges no listing fees, no commissions, and no hidden charges to sellers. We believe everyone should have access to a fair marketplace."
    },
    {
      question: "How long does verification take?",
      answer: "Digital verification typically takes 24-48 hours. Physical verification is scheduled at your convenience and usually takes about an hour."
    },
    {
      question: "What happens if I'm not satisfied with a purchase?",
      answer: "Contact us immediately if there are issues with your purchase. We work with both parties to resolve disputes and ensure fair outcomes."
    },
    {
      question: "Can I edit my listing after posting?",
      answer: "Yes, you can edit your listing anytime from your dashboard. Major changes may require re-verification."
    },
    {
      question: "How do payments work?",
      answer: "Auto Eden facilitates secure payments. Buyers pay through our platform, and we release funds to sellers once the transaction is complete."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* SEO Hidden Heading */}
      <h1 className="sr-only">
        Learn About Auto Eden - Guides, Tips & FAQs for Buying and Selling Cars in Zimbabwe
      </h1>

      {/* Hero Section with Blended Background */}
      <section className="relative min-h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/autoeden-marketplace.png" 
            alt="" 
            loading='eager' 
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-400 via-white/95 to-white/80" />
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div {...fadeInUp} className="max-w-3xl pt-15">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Learning Center</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Know About Auto Eden
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Whether you're buying your first car or selling your tenth, our guides and resources 
              will help you navigate the Auto Eden marketplace with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-12 lg:py-16" aria-labelledby="featured-guides">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="mb-8">
            <h2 id="featured-guides" className="text-2xl font-bold text-gray-900">Featured Guides</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {guides.filter(g => g.featured).map((guide, index) => (
              <motion.article
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0 group-hover:bg-red-100 transition-colors">
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-red-600 uppercase tracking-wider">
                        {guide.category}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {guide.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                    <Link 
                      to={`/learn/${guide.id}`}
                      className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Read Guide
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* All Guides */}
      <section className="py-12 lg:py-16 bg-white" aria-labelledby="all-guides">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="mb-8">
            <h2 id="all-guides" className="text-2xl font-bold text-gray-900">All Guides & Resources</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <motion.article
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 group-hover:text-red-600 transition-colors">
                    {guide.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {guide.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{guide.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{guide.readTime}</span>
                  <Link 
                    to={`/learn/${guide.id}`}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Read →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 lg:py-16 bg-gray-50" aria-labelledby="faq-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <HelpCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <h2 id="faq-section" className="text-2xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <Lightbulb className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-red-100 mb-6">Our team is here to help you navigate Auto Eden.</p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })}
      </script>
    </main>
  );
}