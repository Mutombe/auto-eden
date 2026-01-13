// src/pages/ReviewsPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Star, Quote, User, CheckCircle, Calendar,
  ThumbsUp, MessageSquare, Send, AlertCircle,
  Car, Shield, DollarSign
} from "lucide-react";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdStarPurple500 } from "react-icons/md";
import { IoCheckmarkDone } from "react-icons/io5";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { SlLike } from "react-icons/sl";
import { SiFsecure } from "react-icons/si";
import { BiUserCircle } from "react-icons/bi";


/**
 * Reviews Page - Customer Testimonials & Ratings
 * SEO-optimized page showcasing customer experiences
 */
export default function ReviewsPage() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    transactionType: "",
    review: ""
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setStatus("success");
      setLoading(false);
      setFormData({ name: "", email: "", rating: 5, transactionType: "", review: "" });
      setShowReviewForm(false);
    }, 1500);
  };

  // Sample reviews
  const reviews = [
    {
      id: 1,
      name: "Tendai M.",
      location: "Harare",
      rating: 5,
      date: "December 2025",
      type: "Bought a car",
      vehicle: "2019 Toyota Hilux",
      review: "Absolutely amazing experience! The verification process gave me complete confidence in my purchase. The team was professional and the whole transaction was smooth. Highly recommend Auto Eden to anyone looking for a quality vehicle.",
      verified: true
    },
    {
      id: 2,
      name: "Grace C.",
      location: "Bulawayo",
      rating: 5,
      date: "November 2025",
      type: "Sold a car",
      vehicle: "2020 Honda Fit",
      review: "I was skeptical about selling online, but Auto Eden made it so easy. No listing fees was the best part! Found a buyer within two weeks and the secure payment process was seamless. Thank you!",
      verified: true
    },
    {
      id: 3,
      name: "Patrick N.",
      location: "Harare",
      rating: 5,
      date: "November 2025",
      type: "Bought a car",
      vehicle: "2018 Mercedes C-Class",
      review: "The physical verification was thorough and gave me peace of mind. Every detail was checked and documented. This is how buying cars should be done. Professional service from start to finish.",
      verified: true
    },
    {
      id: 4,
      name: "Rumbidzai T.",
      location: "Mutare",
      rating: 4,
      date: "October 2025",
      type: "Sold a car",
      vehicle: "2017 Nissan X-Trail",
      review: "Great platform for selling vehicles. The listing process was straightforward and I appreciated the free verification. Sold my car at a fair price. Only wish there were more buyers in my area.",
      verified: true
    },
    {
      id: 5,
      name: "David K.",
      location: "Harare",
      rating: 5,
      date: "October 2025",
      type: "Bought a car",
      vehicle: "2021 Toyota Aqua",
      review: "First time buying a car in Zimbabwe and Auto Eden made it stress-free. The team helped me understand every step. Got exactly what I was looking for at a great price. 100% recommend!",
      verified: true
    }
  ];

  // Stats
  const stats = [
    { label: "Average Rating", value: "4.9", icon: <MdStarPurple500 className="w-5 h-5" /> },
    { label: "Happy Customers", value: "1000+", icon: <SlLike className="w-5 h-5" /> },
    { label: "Verified Reviews", value: "500+", icon: <IoCheckmarkDoneCircleOutline className="w-5 h-5" /> }
  ];

  // Star rating component
  const StarRating = ({ rating, size = "w-4 h-4" }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <MdStarPurple500
          key={star}
          className={`${size} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <main className="pacaembu-font min-h-screen bg-gray-50">
      {/* SEO Hidden Heading */}
      <h1 className="sr-only">
        Customer Reviews & Testimonials - Auto Eden Zimbabwe Car Marketplace
      </h1>

      {/* Hero with Blended Background */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/city.jpg" 
            alt=""
            loading='eager' 
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Gradient Overlay - warm tones for reviews */}
          <div className="absolute inset-0 bg-gradient-to-b from-red via-white/90 to-gray-50" />
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-red-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <MdStarPurple500 key={star} className="w-8 h-8 fill-yellow-400 drop-shadow-sm" />
              ))}
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Real experiences from real people who've bought and sold cars on Auto Eden.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
                  {stat.icon}
                  <span className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-12 lg:py-16" aria-labelledby="reviews-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 id="reviews-section" className="text-2xl font-bold text-gray-900">
              Recent Reviews
            </h2>
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Write a Review
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <BiUserCircle className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.name}</span>
                        {review.verified && (
                          <IoCheckmarkDone className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{review.location}</span>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                {/* Transaction Type */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    <Car className="w-3 h-3 mr-1" />
                    {review.type}
                  </span>
                  <span className="text-xs text-gray-400">{review.vehicle}</span>
                </div>

                {/* Review Text */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  "{review.review}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {review.date}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Customers Trust Us</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gray-50">
              <GiTakeMyMoney className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Zero Listing Fees</h3>
              <p className="text-sm text-gray-600">Sellers list for free, buyers browse for free</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <SiFsecure className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Verified Vehicles</h3>
              <p className="text-sm text-gray-600">Every car is thoroughly inspected</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <IoCheckmarkDone className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure Transactions</h3>
              <p className="text-sm text-gray-600">We handle payments safely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {status === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <IoCheckmarkDone className="w-5 h-5 text-green-600" />
                  <p className="text-green-700">Thank you for your review!</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="John D."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1"
                      >
                        <MdStarPurple500
                          className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    required
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select...</option>
                    <option value="bought">I bought a car</option>
                    <option value="sold">I sold a car</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Auto Eden",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "500",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": reviews.slice(0, 3).map(r => ({
            "@type": "Review",
            "author": { "@type": "Person", "name": r.name },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": r.rating,
              "bestRating": "5"
            },
            "reviewBody": r.review
          }))
        })}
      </script>
    </main>
  );
}