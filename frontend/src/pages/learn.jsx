// src/pages/LearnPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BookOpen, Car, Shield, DollarSign, Camera, 
  FileCheck, Search, Key, ArrowRight, Clock,
} from "../components/ui/icons";
import Pattern, { HeroPattern } from "../components/ui/Pattern";
import { PageHero, SectionHead, FAQList, CTABand, reveal } from "../components/site/PageKit";

/**
 * Learn Page - Educational content about Auto Eden
 * SEO-optimized articles to help users navigate the platform
 */
export default function LearnPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

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

  const categories = ["All", ...Array.from(new Set(guides.map((g) => g.category)))];
  const q = query.trim().toLowerCase();
  const shown = guides.filter(
    (g) => (category === "All" || g.category === category) && (!q || `${g.title} ${g.description} ${g.category}`.toLowerCase().includes(q))
  );
  const featured = guides.filter((g) => g.featured);

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <PageHero
        eyebrow="Learning centre"
        icon={BookOpen}
        title="Everything you need to buy or sell a car with confidence"
        subtitle="Plain-English guides on pricing, photos, paperwork and verification, written for drivers in Zimbabwe."
      >
        <label className="relative block max-w-xl">
          <span className="sr-only">Search guides</span>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && document.getElementById("all-guides")?.scrollIntoView({ behavior: "smooth" })}
            placeholder="Search guides, e.g. pricing, photos, Harare"
            className="w-full py-3.5 pl-11 pr-4 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 outline-none ring-2 ring-transparent focus:ring-red-500 text-[16px]"
          />
        </label>
        <p className="mt-4 text-sm text-white/50">{guides.length} guides · {categories.length - 1} topics</p>
      </PageHero>

      {/* Featured */}
      <section className="py-14 lg:py-20" aria-labelledby="featured-guides">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead id="featured-guides" eyebrow="Start here" title="Featured guides" />
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {featured.map((guide, index) => (
              <motion.div key={guide.id} {...reveal} transition={{ duration: 0.45, delay: index * 0.06 }}>
                <Link
                  to={`/learn/${guide.id}`}
                  className={`group relative isolate overflow-hidden flex flex-col h-full rounded-xl p-6 sm:p-7 transition-all ${
                    index === 0 ? "bg-gray-950 text-white" : "bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:shadow-gray-900/5"
                  }`}
                >
                  {index === 0 ? <HeroPattern /> : <Pattern variant="grid" fade="corner" className="-z-10 text-gray-100" />}
                  <div className="flex items-center justify-between">
                    <span className={`grid place-items-center w-11 h-11 rounded-lg ${index === 0 ? "bg-red-600 text-white" : "bg-red-50 text-red-600"}`}>{guide.icon}</span>
                    <span className={`text-[12px] flex items-center gap-1 ${index === 0 ? "text-white/55" : "text-gray-500"}`}><Clock className="w-3.5 h-3.5" />{guide.readTime}</span>
                  </div>
                  <p className={`mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] ${index === 0 ? "text-red-400" : "text-red-600"}`}>{guide.category}</p>
                  <h3 className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight">{guide.title}</h3>
                  <p className={`mt-2 ${index === 0 ? "text-white/65" : "text-gray-600"}`}>{guide.description}</p>
                  <span className={`mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium ${index === 0 ? "text-white" : "text-gray-900 group-hover:text-red-600"}`}>
                    Read guide <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All guides */}
      <section className="py-14 lg:py-20 bg-white border-y border-gray-200/70 scroll-mt-20" id="all-guides" aria-labelledby="all-guides-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead id="all-guides-title" eyebrow="Library" title="All guides" />
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar mb-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  category === c ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-10 text-center">
              <p className="font-medium text-gray-900">No guides match your search</p>
              <button onClick={() => { setQuery(""); setCategory("All"); }} className="mt-3 text-sm font-medium text-red-600 hover:text-red-700">Show all guides</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {shown.map((guide) => (
                <Link
                  key={guide.id}
                  to={`/learn/${guide.id}`}
                  className="group flex flex-col rounded-xl p-5 bg-[#f6f7f9] ring-1 ring-gray-200/70 hover:bg-white hover:ring-gray-300 hover:shadow-lg hover:shadow-gray-900/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-lg bg-white ring-1 ring-gray-200 text-gray-700 group-hover:text-red-600 transition-colors [&_svg]:w-5 [&_svg]:h-5">{guide.icon}</span>
                    <span className="text-[12px] font-medium uppercase tracking-wider text-gray-500">{guide.category}</span>
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-red-600 transition-colors">{guide.title}</h3>
                  <p className="mt-1.5 text-gray-600 text-sm line-clamp-2">{guide.description}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{guide.readTime}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative isolate overflow-hidden py-14 lg:py-20" aria-labelledby="faq-section">
        <Pattern variant="grid" fade="radial" className="-z-10 text-gray-200" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead id="faq-section" center eyebrow="FAQ" title="Quick answers" subtitle="The questions we hear most often." />
          <FAQList items={faqs} />
        </div>
      </section>

      <CTABand
        title="Still have questions?"
        subtitle="Our team is happy to help you buy or sell."
        primary={{ label: "Contact us", to: "/contact" }}
        secondary={{ label: "Browse cars", to: "/marketplace" }}
      />

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