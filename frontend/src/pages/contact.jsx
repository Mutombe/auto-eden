// src/pages/ContactPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle, AlertCircle, ArrowRight, WhatsappLogo, BookOpen, Lightbulb, Star,
} from "../components/ui/icons";
import api from "../utils/api";
import Pattern from "../components/ui/Pattern";
import { PageHero } from "../components/site/PageKit";

const PHONE = "+263 78 222 2032";
const EMAIL = "admin@autoeden.co.zw";

const TOPICS = [
  ["buying", "Buying a car"],
  ["selling", "Selling a car"],
  ["verification", "Verification"],
  ["account", "My account"],
  ["other", "Something else"],
];

const channels = [
  { icon: Phone, label: "Call us", value: PHONE, href: `tel:${PHONE.replace(/\s/g, "")}` },
  { icon: WhatsappLogo, label: "WhatsApp", value: "Chat with the team", href: `https://wa.me/${PHONE.replace(/\D/g, "")}`, external: true },
  { icon: Mail, label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
];

const input = "w-full h-11 px-3.5 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] bg-white transition-shadow";

/**
 * Contact Page - Auto Eden
 * SEO-optimized contact page with form and contact information
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);
  const [topicError, setTopicError] = useState(false);
  const set = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      setTopicError(true);
      return;
    }
    setLoading(true);
    setStatus(null);

    try {
      await api.post("/core/contact/", formData);
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <PageHero
        eyebrow="Get in touch"
        icon={MessageCircle}
        title="We'd love to hear from you"
        subtitle="Questions about buying or selling, or help with a listing? A real person from our Harare team will reply."
      >
        <div className="grid sm:grid-cols-3 gap-2.5 max-w-3xl">
          {channels.map(({ icon: Icon, label, value, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-3 rounded-lg bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/10 px-4 py-3 transition-colors"
            >
              <span className="grid place-items-center w-9 h-9 rounded-md bg-white/10 text-white shrink-0"><Icon size={18} /></span>
              <span className="min-w-0">
                <span className="block text-[12px] text-white/55">{label}</span>
                <span className="block text-sm font-medium truncate">{value}</span>
              </span>
            </a>
          ))}
        </div>
      </PageHero>

      <section className="py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden">
            <div className="relative isolate overflow-hidden px-5 sm:px-8 pt-6 pb-5 border-b border-gray-100">
              <Pattern variant="grid" fade="right" scale={0.75} className="-z-10 text-gray-200" />
              <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
              <p className="mt-1 text-sm text-gray-500">We usually reply within one working day.</p>
            </div>

            {status === "success" ? (
              <div className="px-5 sm:px-8 py-12 text-center">
                <span className="grid place-items-center w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600"><CheckCircle size={30} weight="fill" /></span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Message sent</h3>
                <p className="mt-2 text-gray-600">Thanks for reaching out. We'll get back to you soon.</p>
                <button onClick={() => setStatus(null)} className="mt-6 h-11 px-6 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 font-medium text-gray-900">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-6 space-y-5">
                {status === "error" && (
                  <div className="p-3.5 bg-red-50 ring-1 ring-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700">Something went wrong. Please try again, or call us on {PHONE}.</p>
                  </div>
                )}

                <fieldset>
                  <legend className="block text-[13px] font-medium text-gray-700 mb-2">What's it about?</legend>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map(([v, l]) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => { setFormData({ ...formData, subject: v }); setTopicError(false); }}
                        aria-pressed={formData.subject === v}
                        className={`h-9 px-3.5 rounded-lg text-sm font-medium transition-colors ${
                          formData.subject === v ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  {topicError && <p className="mt-1.5 text-[13px] text-red-600">Pick a topic so we can route your message.</p>}
                </fieldset>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Full name</span>
                    <input type="text" required autoComplete="name" value={formData.name} onChange={set("name")} className={input} />
                  </label>
                  <label className="block">
                    <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</span>
                    <input type="email" required autoComplete="email" value={formData.email} onChange={set("email")} className={input} />
                  </label>
                </div>
                <label className="block sm:max-w-[calc(50%-0.5rem)]">
                  <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></span>
                  <input type="tel" autoComplete="tel" value={formData.phone} onChange={set("phone")} className={input} placeholder="+263 7…" />
                </label>
                <label className="block">
                  <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Message</span>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={set("message")}
                    className="w-full px-3.5 py-3 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] resize-none"
                    placeholder="How can we help?"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto h-12 px-7 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send message</>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Details */}
          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-xl bg-white ring-1 ring-gray-200 p-5 sm:p-6 space-y-4">
              {[
                [MapPin, "Office", "Harare, Zimbabwe"],
                [Clock, "Hours", "Mon – Sat, 8am – 6pm"],
              ].map(([Icon, l, v]) => (
                <div key={l} className="flex items-start gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-lg bg-red-50 text-red-600 shrink-0"><Icon size={18} /></span>
                  <div>
                    <p className="text-[13px] text-gray-500">{l}</p>
                    <p className="font-medium text-gray-900">{v}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white ring-1 ring-gray-200 divide-y divide-gray-100">
              {[
                [BookOpen, "Guides & FAQs", "/learn"],
                [Lightbulb, "Suggest an idea", "/suggestions"],
                [Star, "Leave a review", "/reviews"],
              ].map(([Icon, l, to]) => (
                <Link key={to} to={to} className="group flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <Icon size={18} className="text-gray-500 group-hover:text-red-600" />
                  <span className="flex-1 font-medium text-gray-900">{l}</span>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </motion.aside>
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
