// src/pages/NewsPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Newspaper, Calendar, ArrowRight, TrendingUp, Award, Users, Zap, Lightbulb } from "../components/ui/icons";
import api from "../utils/api";
import Pattern, { HeroPattern } from "../components/ui/Pattern";
import { PageHero, SectionHead, CTABand, reveal } from "../components/site/PageKit";

/**
 * News Page - Auto Eden Updates & Announcements
 * SEO-optimized news/blog page
 */
// Labels for the Article.category choices.
export const NEWS_CATEGORIES = {
  news: "News",
  tips: "Tips & guides",
  industry: "Industry",
  company: "Company",
  market: "Market analysis",
};

// Map category to icon
export const getCategoryIcon = (category, className = "w-5 h-5") => {
  const icons = {
    news: <Newspaper className={className} />,
    tips: <Lightbulb className={className} />,
    industry: <Zap className={className} />,
    company: <Users className={className} />,
    market: <TrendingUp className={className} />,
  };
  return icons[category?.toLowerCase()] || <Award className={className} />;
};

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
};

const Cover = ({ article, className = "" }) => (
  <div className={`relative isolate overflow-hidden bg-gray-950 ${className}`}>
    {article.featured_image ? (
      <img
        src={article.featured_image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        loading="lazy"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    ) : (
      <>
        <HeroPattern />
        <div className="absolute inset-0 grid place-items-center text-white/80">{getCategoryIcon(article.category, "w-9 h-9")}</div>
      </>
    )}
  </div>
);

function NewsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-gray-200" />
          <div className="p-6 space-y-3"><div className="h-3 w-32 bg-gray-200 rounded" /><div className="h-5 w-3/4 bg-gray-200 rounded" /><div className="h-3 w-full bg-gray-100 rounded" /></div>
        </div>
      ))}
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

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

  const filtered = category === "all" ? articles : articles.filter((a) => a.category === category);
  const lead = filtered.find((a) => a.is_featured) || filtered[0];
  const rest = filtered.filter((a) => a !== lead);
  const present = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <PageHero
        eyebrow="News & updates"
        icon={Newspaper}
        title="Latest from Auto Eden"
        subtitle="Product updates, company news and what's moving in Zimbabwe's car market."
        compact
      />

      <section className="py-12 lg:py-16" aria-labelledby="news-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="news-list" className="sr-only">Articles</h2>
          {present.length > 1 && (
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar mb-6">
              {["all", ...present].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${category === c ? "bg-gray-900 text-white" : "bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {c === "all" ? "All" : NEWS_CATEGORIES[c] || c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <NewsSkeleton />
          ) : !lead ? (
            <motion.div {...reveal} className="relative isolate overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 p-10 sm:p-14 text-center">
              <Pattern variant="grid" fade="radial" className="-z-10 text-gray-100" />
              <span className="grid place-items-center w-14 h-14 mx-auto rounded-xl bg-gray-950 text-white"><Newspaper size={26} /></span>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">No stories yet</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">We're working on our first updates. In the meantime, our guides cover everything about buying and selling.</p>
              <Link to="/learn" className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium">
                Read the guides <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Lead story */}
              <motion.div {...reveal}>
                <Link to={`/news/${lead.id}`} className="group grid lg:grid-cols-[1.25fr_1fr] rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden hover:shadow-lg hover:shadow-gray-900/5 transition-shadow">
                  <Cover article={lead} className="aspect-[16/9] lg:aspect-auto lg:min-h-[340px]" />
                  <div className="p-6 sm:p-8 flex flex-col">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 text-red-700 px-2 py-1 text-[12px] font-medium">
                        {getCategoryIcon(lead.category, "w-3.5 h-3.5")} {NEWS_CATEGORIES[lead.category] || lead.category}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(lead.published_at)}</span>
                    </div>
                    <h3 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 group-hover:text-red-600 transition-colors">{lead.title}</h3>
                    <p className="mt-3 text-gray-600 line-clamp-4">{lead.excerpt}</p>
                    <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 group-hover:text-red-600">
                      Read story <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              {rest.length > 0 && (
                <div className="mt-10">
                  <SectionHead eyebrow="More" title="More updates" />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {rest.map((article) => (
                      <motion.div key={article.id} {...reveal}>
                        <Link to={`/news/${article.id}`} className="group flex flex-col h-full rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden hover:shadow-lg hover:shadow-gray-900/5 transition-shadow">
                          <Cover article={article} className="aspect-[16/9]" />
                          <div className="p-5 flex flex-col flex-1">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-red-600">{NEWS_CATEGORIES[article.category] || article.category}</p>
                            <h3 className="mt-1.5 font-semibold text-gray-900 group-hover:text-red-600 transition-colors">{article.title}</h3>
                            <p className="mt-1.5 text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                            <span className="mt-auto pt-4 text-[13px] text-gray-500">{formatDate(article.published_at)}</span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <CTABand
        title="Want new cars as they're listed?"
        subtitle="Create a free account and save a search. We'll tell you the moment a match goes live."
        primary={{ label: "Browse cars", to: "/marketplace" }}
        secondary={{ label: "Read our guides", to: "/learn" }}
      />

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
