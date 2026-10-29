// src/pages/ReviewsPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, CheckCircle, MessageSquare, Send, AlertCircle, HandCoins, Checks, ShieldCheck, ThumbsUp, X } from "../components/ui/icons";
import api from "../utils/api";
import Pattern from "../components/ui/Pattern";
import { PageHero, SectionHead, CTABand, reveal } from "../components/site/PageKit";

const input = "w-full h-11 px-3.5 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] bg-white";


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
    
    setStatus(null);
    // Saved as a feedback inquiry for the team to moderate.
    try {
      await api.post("/core/contact/", {
        type: "feedback",
        name: formData.name,
        email: formData.email,
        subject: `Review: ${formData.rating}/5${formData.transactionType ? ` (${formData.transactionType})` : ""}`,
        message: formData.review,
      });
      setStatus("success");
      setFormData({ name: "", email: "", rating: 5, transactionType: "", review: "" });
      setShowReviewForm(false);
    } catch (err) {
      console.error("Review error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
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
    { label: "Average Rating", value: "4.9", icon: <Star className="w-5 h-5" /> },
    { label: "Happy Customers", value: "1000+", icon: <ThumbsUp className="w-5 h-5" /> },
    { label: "Verified Reviews", value: "500+", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  // Star rating component
  const StarRating = ({ rating, size = "w-4 h-4" }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          weight={star <= rating ? "fill" : "duotone"} className={`${size} ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <PageHero
        eyebrow="Reviews"
        icon={Star}
        title="What our customers say"
        subtitle="Experiences from people who've bought and sold cars with Auto Eden."
        aside={
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/[0.06] ring-1 ring-white/10 p-4">
                <p className="text-2xl sm:text-3xl font-semibold tabular-nums">{stat.value}</p>
                <p className="mt-1 text-[12px] sm:text-[13px] text-white/55 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        }
      >
        <button
          onClick={() => setShowReviewForm(true)}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-red-600 hover:bg-red-700 font-semibold transition-colors"
        >
          <MessageSquare className="w-4 h-4" /> Write a review
        </button>
      </PageHero>

      {status === "success" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 bg-emerald-50 ring-1 ring-emerald-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-900">Thanks for your review. We'll publish it once we've checked it.</p>
          </div>
        </div>
      )}

      {/* Reviews */}
      <section className="py-12 lg:py-16" aria-labelledby="reviews-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead
            id="reviews-section"
            eyebrow="From our customers"
            title="Recent reviews"
            action={<StarRating rating={5} size="w-5 h-5" />}
          />
          <div className="columns-1 md:columns-2 lg:columns-3 gap-3 sm:gap-4 [&>*]:mb-3 sm:[&>*]:mb-4">
            {reviews.map((review, index) => (
              <motion.article
                key={review.id}
                {...reveal}
                transition={{ duration: 0.45, delay: (index % 3) * 0.05 }}
                className={`break-inside-avoid relative isolate overflow-hidden rounded-xl p-6 ${
                  index === 0 ? "bg-gray-950 text-white" : "bg-white ring-1 ring-gray-200"
                }`}
              >
                {index === 0 && <Pattern variant="grid" fade="corner" className="-z-10 text-white/[0.07]" />}
                <div className="flex items-center justify-between gap-3">
                  <StarRating rating={review.rating} />
                  <Quote weight="fill" className={`w-7 h-7 ${index === 0 ? "text-red-500" : "text-red-100"}`} />
                </div>
                <p className={`mt-4 leading-relaxed ${index === 0 ? "text-[17px] text-white/85" : "text-gray-700"}`}>{review.review}</p>
                <div className={`mt-5 pt-4 border-t flex items-center gap-3 ${index === 0 ? "border-white/10" : "border-gray-100"}`}>
                  <span className={`grid place-items-center w-10 h-10 rounded-full font-semibold shrink-0 ${index === 0 ? "bg-white/10 text-white" : "bg-gray-100 text-gray-700"}`}>
                    {review.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{review.name} <span className={`font-normal ${index === 0 ? "text-white/50" : "text-gray-500"}`}>· {review.location}</span></p>
                    <p className={`text-[13px] truncate ${index === 0 ? "text-white/50" : "text-gray-500"}`}>{review.type} · {review.vehicle} · {review.date}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 lg:py-16 bg-white border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead center eyebrow="Why it works" title="Why customers trust us" />
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              [HandCoins, "Zero listing fees", "Sellers list for free, buyers browse for free"],
              [ShieldCheck, "Verified vehicles", "Every car is checked before it goes live"],
              [Checks, "Secure transactions", "We handle payments safely"],
            ].map(([Icon, t, d]) => (
              <motion.div key={t} {...reveal} className="rounded-xl bg-[#f6f7f9] ring-1 ring-gray-200/70 p-6">
                <span className="grid place-items-center w-11 h-11 rounded-lg bg-white ring-1 ring-gray-200 text-red-600"><Icon size={22} /></span>
                <h3 className="mt-4 font-semibold text-gray-900">{t}</h3>
                <p className="mt-1 text-sm text-gray-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Bought or sold with us?"
        subtitle="Tell other drivers how it went. It takes a minute."
        primary={{ label: "Browse cars", to: "/marketplace" }}
        secondary={{ label: "Sell your car", to: "/sell" }}
      />

      {/* Review form */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Write a review">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReviewForm(false)} />
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative w-full sm:max-w-lg max-h-[92svh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-xl shadow-xl"
            >
              <div className="relative isolate overflow-hidden px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
                <Pattern variant="grid" fade="right" scale={0.75} className="-z-10 text-gray-200" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>
                  <p className="text-sm text-gray-500">Reviews are checked before they're published.</p>
                </div>
                <button type="button" aria-label="Close" onClick={() => setShowReviewForm(false)} className="p-2 -mr-2 rounded-lg hover:bg-gray-100"><X size={20} className="text-gray-500" /></button>
              </div>
              <div className="px-5 sm:px-6 py-5 space-y-4">
                {status === "error" && (
                  <div className="p-3 bg-red-50 ring-1 ring-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Couldn't send your review. Please try again.
                  </div>
                )}
                <div>
                  <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Your rating</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setFormData({ ...formData, rating: n })} className="p-1">
                        <Star weight={n <= formData.rating ? "fill" : "regular"} className={`w-8 h-8 ${n <= formData.rating ? "text-amber-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-[13px] font-medium text-gray-700 mb-1.5">You…</span>
                  <div className="flex gap-2">
                    {["Bought a car", "Sold a car"].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFormData({ ...formData, transactionType: t })}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium ${formData.transactionType === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Name</span>
                    <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={input} autoComplete="name" />
                  </label>
                  <label className="block">
                    <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</span>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={input} autoComplete="email" />
                  </label>
                </div>
                <label className="block">
                  <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Your review</span>
                  <textarea
                    required
                    rows={4}
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] resize-none"
                    placeholder="How was buying or selling with Auto Eden?"
                  />
                </label>
              </div>
              <div className="px-5 sm:px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex gap-2">
                <button type="button" onClick={() => setShowReviewForm(false)} className="h-11 px-5 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 font-medium">Cancel</button>
                <button disabled={loading} className="flex-1 h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Submit review</>}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

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