// src/pages/NewsPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Newspaper, Calendar, ArrowRight, Tag,
  TrendingUp, Award, Users, Zap, Loader2
} from "lucide-react";
import api from "../utils/api";

/**
 * News Page - Auto Eden Updates & Announcements
 * SEO-optimized news/blog page
 */
// Map category to icon
const getCategoryIcon = (category) => {
  const icons = {
    announcement: <Zap className="w-5 h-5" />,
    "product update": <Award className="w-5 h-5" />,
    milestone: <Users className="w-5 h-5" />,
    "market insights": <TrendingUp className="w-5 h-5" />,
  };
  return icons[category?.toLowerCase()] || <Newspaper className="w-5 h-5" />;
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await api.get("/core/articles/");
        setArticles(data.results || data);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const featuredNews = articles.filter(a => a.is_featured);
  const otherNews = articles.filter(a => !a.is_featured);

  return (
    <main className="pacaembu-font bg-gray-50">
      {/* SEO Hidden Heading */}
      <h1 className="sr-only">
        Auto Eden News - Latest Updates, Announcements & Market Insights Zimbabwe
      </h1>

      {/* Hero with Blended Background */}
      <section className="relative min-h-[80vh] overflow-hidden">
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
          {/* Gradient Overlay - left-aligned content so gradient from left */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/70" />
          {/* Accent glow */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl pt-15"
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : featuredNews.length > 0 ? (
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
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden flex items-center justify-center">
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400">{getCategoryIcon(article.category)}</div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                        {getCategoryIcon(article.category)}
                        {article.category}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(article.published_at)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                    <Link
                      to={`/news/${article.slug || article.id}`}
                      className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No featured articles yet. Check back soon!
            </div>
          )}
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

          {!loading && otherNews.length > 0 ? (
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
                      {getCategoryIcon(article.category)}
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
                    <span className="text-xs text-gray-500">{formatDate(article.published_at)}</span>
                    <Link
                      to={`/news/${article.slug || article.id}`}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Read →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : !loading && (
            <div className="text-center py-12 text-gray-500">
              No additional articles yet.
            </div>
          )}
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