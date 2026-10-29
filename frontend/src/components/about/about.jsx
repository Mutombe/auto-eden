// src/components/about/about.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Pattern, { HeroPattern } from "../ui/Pattern";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Car,
  CheckCircle,
  DollarSign,
  Eye,
  FileCheck,
  Handshake,
  Heart,
  Key,
  Search,
  Shield,
  Zap,
} from "../ui/icons";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const JOURNEYS = {
  sell: {
    label: "Selling",
    cta: { to: "/sell", text: "Start selling, it's free" },
    steps: [
      { icon: Camera, title: "Upload your car", text: "Take clear photos and fill in the details. No listing fees, ever." },
      { icon: FileCheck, title: "We verify it", text: "Our team reviews your listing, then inspects the car at no cost to you." },
      { icon: Eye, title: "Buyers find you", text: "Your verified listing goes live and buyers make offers through Auto Eden." },
      { icon: Handshake, title: "Sell securely", text: "We handle the transaction. You get paid securely, the buyer gets their car." },
    ],
  },
  buy: {
    label: "Buying",
    cta: { to: "/marketplace", text: "Browse the marketplace" },
    steps: [
      { icon: Search, title: "Browse freely", text: "Explore the whole marketplace at no cost. Filter by make, price, body type and more." },
      { icon: BadgeCheck, title: "Trust the checks", text: "Every car is verified digitally and physically before it appears." },
      { icon: Car, title: "Test drive", text: "Found the one? Book a test drive and see it for yourself." },
      { icon: Key, title: "Drive away", text: "Complete the purchase securely through Auto Eden and collect your keys." },
    ],
  },
};

const STATS = [
  ["1000+", "Happy customers"],
  ["100%", "Cars verified"],
  ["$0", "Listing fee"],
];

export default function AboutPage() {
  const [journey, setJourney] = useState("sell");
  const j = JOURNEYS[journey];

  return (
    <main className="pacaembu-font bg-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_80%_at_85%_20%,rgba(220,38,38,0.35),transparent_65%)]" />
        <HeroPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-12 sm:pb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 h-7 px-3 rounded-md bg-white/10 ring-1 ring-inset ring-white/15 text-[12.5px] font-medium text-white/85">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Est. 2019 · Harare, Zimbabwe
            </span>
            <h1 className="mt-5 text-[36px] leading-[1.06] sm:text-6xl lg:text-[68px] font-semibold tracking-tight">
              Buying and selling cars,
              <span className="block">
                made <span className="text-red-500">simple and fair.</span>
              </span>
            </h1>
            <p className="mt-6 text-[16px] sm:text-xl text-white/70 leading-relaxed max-w-2xl">
              Auto Eden is Zimbabwe's free car marketplace. We connect buyers and sellers without the fees, paperwork hassles or trust issues that hold the industry back.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/sell" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-red-600 hover:bg-red-700 font-semibold transition-colors">
                Sell your car <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/marketplace" className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-inset ring-white/20 font-medium transition-colors">
                Browse cars
              </Link>
            </div>
          </motion.div>

          <dl className="mt-14 sm:mt-20 grid grid-cols-3 border-t border-white/10">
            {STATS.map(([v, l], i) => (
              <div key={l} className={`pt-5 sm:pt-6 ${i ? "pl-4 sm:pl-8 border-l border-white/10" : ""}`}>
                <dt className="sr-only">{l}</dt>
                <dd className="text-2xl sm:text-4xl font-semibold tabular-nums">{v}</dd>
                <dd className="mt-1 text-[12.5px] sm:text-sm text-white/55">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-28" aria-labelledby="our-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div {...reveal}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-red-600">Our story</p>
            <h2 id="our-story" className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
              Born from a simple frustration
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed text-[16px]">
              <p>
                In 2019, buying or selling a car in Zimbabwe was expensive, complicated and often risky. Platforms charged sellers hefty fees, and buyers had no way to know a car's
                real condition.
              </p>
              <p className="text-gray-900 font-medium text-lg border-l-2 border-red-600 pl-4">What if car trading could be free, transparent and trustworthy?</p>
              <p>
                That question became Auto Eden: a marketplace where sellers list for free, every vehicle is verified by our own team, and transactions are handled securely.
                We've since helped thousands of Zimbabweans find the right car and get fair value for theirs.
              </p>
            </div>
          </motion.div>

          <motion.div {...reveal} className="relative">
            <div className="absolute -inset-4 sm:-inset-6 -z-0 rounded-2xl overflow-hidden">
              <Pattern variant="dots" fade="radial" className="text-gray-300" />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <img src="/city2.jpg" alt="Harare city skyline" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute -bottom-5 left-4 sm:-left-5 flex items-center gap-3 bg-white p-3.5 pr-5 rounded-xl shadow-lg ring-1 ring-black/5">
              <span className="grid place-items-center w-11 h-11 rounded-lg bg-white ring-1 ring-gray-200 overflow-hidden">
                <img src="/Auto-eden-favicon.png" alt="" className="w-8 h-8 object-contain" />
              </span>
              <span>
                <span className="block font-semibold text-gray-900">Trusted since 2019</span>
                <span className="block text-sm text-gray-500">Verified cars only</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principles bento */}
      <section className="pb-16 lg:pb-28" aria-labelledby="why-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...reveal} className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-red-600">Why Auto Eden</p>
            <h2 id="why-us" className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">Not just another marketplace</h2>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 sm:gap-4">
            <motion.article {...reveal} className="relative isolate overflow-hidden sm:col-span-2 lg:row-span-2 rounded-xl bg-gray-950 text-white p-6 sm:p-8 flex flex-col min-h-[260px]">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_100%_100%,rgba(220,38,38,0.45),transparent_70%)]" />
              <Pattern variant="tread" fade="bottom" className="-z-10 text-white/[0.07]" />
              <span className="grid place-items-center w-12 h-12 rounded-lg bg-red-600">
                <DollarSign className="w-6 h-6" />
              </span>
              <h3 className="mt-auto pt-10 text-2xl sm:text-3xl font-semibold">Zero fees for sellers</h3>
              <p className="mt-2 text-white/65 max-w-md leading-relaxed">
                List your vehicle completely free. No hidden charges, no listing fees and no commission on your sale.
              </p>
            </motion.article>
            {[
              [Shield, "Verified vehicles only", "Every car passes digital and physical checks before it appears on the marketplace."],
              [Zap, "Fast and simple", "Less waiting, less paperwork and more time enjoying your car."],
              [Heart, "Customer first", "Real people supporting you at every step, from first photo to final handover."],
            ].map(([Icon, t, d], i) => (
              <motion.article
                key={t}
                {...reveal}
                transition={{ duration: 0.5, delay: 0.08 * (i + 1) }}
                className={`rounded-xl bg-[#f6f7f9] ring-1 ring-gray-200/70 p-6 ${i === 2 ? "lg:col-span-2" : ""}`}
              >
                <span className="grid place-items-center w-11 h-11 rounded-lg bg-white ring-1 ring-gray-200 text-red-600">
                  <Icon className="w-[22px] h-[22px]" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{t}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{d}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative isolate overflow-hidden bg-[#f6f7f9] py-16 lg:py-28" aria-labelledby="how-it-works">
        <Pattern variant="grid" fade="radial" className="-z-10 text-gray-200" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-red-600">How it works</p>
              <h2 id="how-it-works" className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">Four steps, either way</h2>
            </div>
            <div className="inline-flex p-1 rounded-lg bg-white ring-1 ring-gray-200 self-start sm:self-auto" role="tablist">
              {Object.entries(JOURNEYS).map(([k, v]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={journey === k}
                  onClick={() => setJourney(k)}
                  className={`relative h-10 px-5 rounded-md text-sm font-medium transition-colors ${journey === k ? "text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {journey === k && <motion.span layoutId="journey-pill" className="absolute inset-0 rounded-md bg-gray-900" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <span className="relative">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.ol
              key={journey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {j.steps.map((s, i) => (
                <li key={s.title} className="relative bg-white rounded-xl p-5 sm:p-6 ring-1 ring-gray-200/80">
                  <div className="flex items-center justify-between">
                    <span className="grid place-items-center w-11 h-11 rounded-lg bg-red-50 text-red-600">
                      <s.icon className="w-[22px] h-[22px]" />
                    </span>
                    <span className="text-[13px] font-semibold text-gray-300 tabular-nums">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{s.text}</p>
                </li>
              ))}
            </motion.ol>
          </AnimatePresence>

          <Link to={j.cta.to} className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
            {j.cta.text} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Verification */}
      <section className="py-16 lg:py-28" aria-labelledby="verification">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <motion.div {...reveal}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-red-600">Verification</p>
            <h2 id="verification" className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">Two checks before any car goes live</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Trust is the whole point. That's why no car reaches the marketplace on the seller's word alone.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              ["01", "Digital review", "We check the listing details, VIN and photos for anything that doesn't add up."],
              ["02", "Physical inspection", "Our team inspects the car in person and confirms its condition matches the listing."],
            ].map(([n, t, d], i) => (
              <motion.div key={n} {...reveal} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative isolate overflow-hidden rounded-xl ring-1 ring-gray-200 p-6">
                <Pattern variant="circuit" fade="corner" scale={0.8} className="-z-10 text-gray-200" />
                <span className="text-sm font-semibold text-red-600 tabular-nums">{n}</span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{t}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{d}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
                  <CheckCircle className="w-4 h-4" /> Required for every car
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-2 sm:px-3 lg:px-4 pb-2 sm:pb-3 lg:pb-4">
        <div className="relative isolate overflow-hidden rounded-xl bg-red-600 text-white">
          <Pattern variant="grid" fade="right" className="-z-10 text-white/[0.12]" />
          <div className="max-w-4xl mx-auto px-5 py-16 lg:py-24 text-center">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">Ready when you are</h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">Join thousands of Zimbabweans who buy and sell with Auto Eden. It's free, it's simple and it works.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/marketplace" className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-7 rounded-lg bg-white text-red-600 font-semibold hover:bg-red-50 transition-colors">
                Find your car
              </Link>
              <Link to="/sell" className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-7 rounded-lg bg-red-700/60 ring-1 ring-inset ring-white/25 font-semibold hover:bg-red-800/60 transition-colors">
                Sell your car
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Auto Eden",
          description: "Zimbabwe's free car marketplace. List vehicles for free, browse for free, verified cars, secure transactions.",
          url: "https://autoeden.co.zw",
          logo: "https://autoeden.co.zw/Auto-eden-favicon.png",
          foundingDate: "2019",
          address: { "@type": "PostalAddress", addressLocality: "Harare", addressCountry: "ZW" },
          contactPoint: { "@type": "ContactPoint", telephone: "+263782222032", contactType: "customer service" },
        })}
      </script>
    </main>
  );
}
