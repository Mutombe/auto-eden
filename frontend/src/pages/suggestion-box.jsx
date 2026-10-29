// src/pages/SuggestionsPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Send, CheckCircle, AlertCircle, Sparkles, Zap, Smartphone, ThumbsUp, Check } from "../components/ui/icons";
import api from "../utils/api";
import Pattern from "../components/ui/Pattern";
import { PageHero } from "../components/site/PageKit";

const categories = [
  { value: "feature", label: "New feature" },
  { value: "improvement", label: "Improve something" },
  { value: "bug", label: "Report a bug" },
  { value: "ux", label: "Ease of use" },
  { value: "other", label: "Other" },
];

const recentIdeas = [
  { title: "Mobile App", status: "planned", icon: Smartphone },
  { title: "Vehicle Financing Options", status: "in-progress", icon: ThumbsUp },
  { title: "Price Comparison Tool", status: "considering", icon: Zap },
];

const STATUS = {
  planned: ["Planned", "bg-sky-50 text-sky-700 ring-sky-200"],
  "in-progress": ["In progress", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
  considering: ["Considering", "bg-gray-100 text-gray-600 ring-gray-200"],
};

const input = "w-full h-11 px-3.5 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] bg-white";

/**
 * Suggestions Page - User Feedback & Ideas
 * Ideas are saved as feedback inquiries through /core/contact/, so the team sees them in the admin.
 */
export default function SuggestionsPage() {
  const [formData, setFormData] = useState({ name: "", email: "", category: "", suggestion: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const set = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return setCategoryError(true);
    setLoading(true);
    setStatus(null);
    const label = categories.find((c) => c.value === formData.category)?.label;
    try {
      await api.post("/core/contact/", {
        type: "feedback",
        name: formData.name.trim() || "Anonymous",
        email: formData.email,
        subject: `Suggestion: ${label}`,
        message: formData.suggestion,
      });
      setStatus("success");
      setFormData({ name: "", email: "", category: "", suggestion: "" });
    } catch (err) {
      console.error("Suggestion error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <PageHero
        eyebrow="Suggestion box"
        icon={Lightbulb}
        title="Help us build a better Auto Eden"
        subtitle="Your ideas shape what we build next. Tell us what would make buying or selling easier for you."
        compact
      />

      <section className="py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4 sm:gap-6 lg:gap-8 items-start">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden">
            <div className="relative isolate overflow-hidden px-5 sm:px-8 pt-6 pb-5 border-b border-gray-100">
              <Pattern variant="grid" fade="right" scale={0.75} className="-z-10 text-gray-200" />
              <h2 className="text-xl font-semibold text-gray-900">Share your idea</h2>
              <p className="mt-1 text-sm text-gray-500">Every suggestion is read by the team.</p>
            </div>

            {status === "success" ? (
              <div className="px-5 sm:px-8 py-12 text-center">
                <span className="grid place-items-center w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600"><CheckCircle size={30} weight="fill" /></span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Thanks for the idea</h3>
                <p className="mt-2 text-gray-600">We've got it. If we build it, you'll hear about it first.</p>
                <button onClick={() => setStatus(null)} className="mt-6 h-11 px-6 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 font-medium text-gray-900">
                  Share another idea
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-6 space-y-5">
                {status === "error" && (
                  <div className="p-3.5 bg-red-50 ring-1 ring-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700">Something went wrong. Please try again.</p>
                  </div>
                )}

                <fieldset>
                  <legend className="block text-[13px] font-medium text-gray-700 mb-2">What kind of idea?</legend>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        aria-pressed={formData.category === c.value}
                        onClick={() => { setFormData({ ...formData, category: c.value }); setCategoryError(false); }}
                        className={`h-9 px-3.5 rounded-lg text-sm font-medium transition-colors ${
                          formData.category === c.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  {categoryError && <p className="mt-1.5 text-[13px] text-red-600">Pick the kind of idea.</p>}
                </fieldset>

                <label className="block">
                  <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Your idea</span>
                  <textarea
                    required
                    rows={6}
                    value={formData.suggestion}
                    onChange={set("suggestion")}
                    className="w-full px-3.5 py-3 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] resize-none"
                    placeholder="What problem does it solve? How would it help you?"
                  />
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Name <span className="text-gray-400 font-normal">(optional)</span></span>
                    <input type="text" autoComplete="name" value={formData.name} onChange={set("name")} className={input} />
                  </label>
                  <label className="block">
                    <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</span>
                    <input type="email" required autoComplete="email" value={formData.email} onChange={set("email")} className={input} placeholder="So we can follow up" />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto h-12 px-7 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send suggestion</>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-xl bg-white ring-1 ring-gray-200 p-5 sm:p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-red-600" /> On our roadmap</h3>
              <ul className="mt-4 space-y-2.5">
                {recentIdeas.map(({ title, status: s, icon: Icon }) => (
                  <li key={title} className="flex items-center gap-3 rounded-lg bg-[#f6f7f9] ring-1 ring-gray-200/70 p-3">
                    <span className="grid place-items-center w-8 h-8 rounded-md bg-white ring-1 ring-gray-200 text-gray-700 shrink-0"><Icon size={16} /></span>
                    <span className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">{title}</span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[12px] font-medium ring-1 ${STATUS[s][1]}`}>{STATUS[s][0]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative isolate overflow-hidden rounded-xl bg-gray-950 text-white p-5 sm:p-6">
              <Pattern variant="grid" fade="corner" className="-z-10 text-white/[0.08]" />
              <h4 className="font-semibold">What makes a great suggestion</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {["Describe the problem, not just the fix", "Say how it would help you", "Include an example if you can"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><Check size={14} weight="bold" className="mt-0.5 text-red-400 shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Suggestion Box - Auto Eden",
          "description": "Share your ideas to help improve Auto Eden, Zimbabwe's leading car marketplace",
          "url": "https://autoeden.co.zw/suggestions"
        })}
      </script>
    </main>
  );
}
