// src/pages/NewsPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Newspaper, Calendar, ArrowRight, Tag,
  TrendingUp, Award, Users, Zap
} from "lucide-react";

/**
 * News Page - Auto Eden Updates & Announcements
 * SEO-optimized news/blog page
 */
export default function NewsPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  // News articles
  const newsArticles = [
    {
      id: "free-listings-launch",
      category: "Announcement",
      date: "January 5, 2026",
      title: "Auto Eden Launches 100% Free Vehicle Listings",
      excerpt: "We're excited to announce that listing your vehicle on Auto Eden is now completely free. No hidden fees, no commissions, just results.",
      image: "/news/free-listings.jpg",
      featured: true,
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: "verification-upgrade",
      category: "Product Update",
      date: "December 15, 2025",
      title: "Enhanced Vehicle Verification Process",
      excerpt: "We've upgraded our verification system to include comprehensive 50-point inspections and detailed vehicle history reports.",
      image: "/news/verification.jpg",
      featured: true,
      icon: <Award className="w-5 h-5" />
    },
    {
      id: "milestone-1000",
      category: "Milestone",
      date: "November 28, 2025",
      title: "Celebrating 1,000 Happy Customers",
      excerpt: "We've reached an incredible milestone — over 1,000 satisfied buyers and sellers have trusted Auto Eden for their car transactions.",
      image: "/news/milestone.jpg",
      featured: false,
      icon: <Users className="w-5 h-5" />
    },
    {
      id: "market-insights-q4",
      category: "Market Insights",
      date: "October 10, 2025",
      title: "Zimbabwe Car Market Trends Q4 2025",
      excerpt: "Toyota Hilux remains the top seller, while electric vehicles see growing interest. Here's what's trending in the local market.",
      image: "/news/market-trends.jpg",
      featured: false,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  const featuredNews = newsArticles.filter(n => n.featured);
  const otherNews = newsArticles.filter(n => !n.featured);

  return (
    <main className="pacaembu-font min-h-screen bg-gray-50">
      {/* SEO Hidden Heading */}
      <h1 className="sr-only">
        Auto Eden News - Latest Updates, Announcements & Market Insights Zimbabwe
      </h1>

      {/* Hero with Blended Background */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/city.jpg" 
            alt="" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Gradient Overlay - left-aligned content so gradient from left */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/70" />
          {/* Accent glow */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <Newspaper className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">News & Updates</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Latest from Auto Eden
            </h2>
            <p className="text-lg text-gray-300">
              Stay informed with the latest product updates, company news, and market insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-12 lg:py-16" aria-labelledby="featured-news">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            {...fadeInUp}
            id="featured-news" 
            className="text-2xl font-bold text-gray-900 mb-8"
          >
            Featured
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredNews.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                      e.target.parentElement.innerHTML = `<div class="text-gray-400">${article.icon.type.render()}</div>`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                      {article.icon}
                      {article.category}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                  <Link
                    to={`/news/${article.id}`}
                    className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* More News */}
      <section className="py-12 lg:py-16 bg-white" aria-labelledby="more-news">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            {...fadeInUp}
            id="more-news" 
            className="text-2xl font-bold text-gray-900 mb-8"
          >
            More Updates
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherNews.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-600">
                    {article.icon}
                  </span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{article.date}</span>
                  <Link
                    to={`/news/${article.id}`}
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

      {/* Newsletter CTA */}
      <section className="py-12 lg:py-16 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Stay in the Loop
            </h2>
            <p className="text-gray-400 mb-6">
              Get the latest news, market insights, and exclusive offers delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Auto Eden News",
          "description": "Latest updates, announcements, and market insights from Zimbabwe's leading car marketplace",
          "url": "https://autoeden.co.zw/news",
          "publisher": {
            "@type": "Organization",
            "name": "Auto Eden",
            "logo": "https://autoeden.co.zw/logo.png"
          }
        })}
      </script>
    </main>
  );
}