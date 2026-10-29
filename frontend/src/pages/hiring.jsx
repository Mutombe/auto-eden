// src/pages/HiringPage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, Zap, MapPin, Clock, ArrowRight, Mail, Coffee, Laptop, Loader2, Stethoscope, GlobeHemisphereEast, ChevronDown, Check, FileText, X } from "../components/ui/icons";
import api from "../utils/api";
import Pattern from "../components/ui/Pattern";
import { PageHero, SectionHead, CTABand, reveal } from "../components/site/PageKit";

const CAREERS_EMAIL = "careers@autoeden.co.zw";

// Company benefits/perks
const perks = [
  { icon: Laptop, title: "Flexible work", description: "Remote-friendly with flexible hours" },
  { icon: Stethoscope, title: "Health benefits", description: "Comprehensive medical coverage" },
  { icon: Coffee, title: "Great culture", description: "Collaborative, fun environment" },
  { icon: Zap, title: "Growth", description: "Learning & development support" },
  { icon: GlobeHemisphereEast, title: "Impact", description: "Shape Zimbabwe's car industry" },
  { icon: Users, title: "Team events", description: "Regular team building activities" },
];

const values = [
  ["Fair by default", "We build for buyers and sellers equally. If a feature only helps one side, we rethink it."],
  ["Earn trust daily", "Every listing we verify and every reply we send is a promise. We keep them."],
  ["Ship, then polish", "Small, frequent improvements beat big launches that never land."],
];

const input = "w-full h-11 px-3.5 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] bg-white";

/** Inline application form, posts to /core/jobs/apply/ (multipart, for the CV). */
function ApplyForm({ job, onDone }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", linkedin_url: "", cover_letter: "" });
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Tell us your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Add a phone number";
    if (!resume) errs.resume = "Attach your CV";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const body = new FormData();
    body.append("position", job.id);
    Object.entries(form).forEach(([k, v]) => v && body.append(k, v));
    body.append("resume", resume);
    setSending(true);
    try {
      await api.post("/core/jobs/apply/", body, { headers: { "Content-Type": "multipart/form-data" } });
      onDone();
    } catch (err) {
      const data = err?.response?.data || {};
      setErrors(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])));
      if (!Object.keys(data).length) setErrors({ form: "Couldn't send your application. Please try again or email us." });
    } finally {
      setSending(false);
    }
  };

  const field = (k, label, props = {}) => (
    <label className="block">
      <span className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</span>
      <input {...props} value={form[k]} onChange={set(k)} className={`${input} ${errors[k] ? "ring-red-400" : ""}`} />
      {errors[k] && <span className="mt-1 block text-[13px] text-red-600">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-5 pt-5 border-t border-gray-100 grid sm:grid-cols-2 gap-3">
      {field("name", "Full name", { autoComplete: "name" })}
      {field("email", "Email", { type: "email", autoComplete: "email" })}
      {field("phone", "Phone", { type: "tel", autoComplete: "tel", placeholder: "+263 7…" })}
      {field("linkedin_url", "LinkedIn (optional)", { type: "url", placeholder: "https://linkedin.com/in/…" })}
      <label className="sm:col-span-2 block">
        <span className="block text-[13px] font-medium text-gray-700 mb-1.5">CV</span>
        <span className={`flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 cursor-pointer hover:bg-gray-50 ${errors.resume ? "border-red-400" : "border-gray-300"}`}>
          <FileText size={20} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-600 truncate flex-1">{resume ? resume.name : "Choose a PDF or Word file"}</span>
          {resume && (
            <button type="button" aria-label="Remove file" onClick={(e) => { e.preventDefault(); setResume(null); }} className="p-1 rounded hover:bg-gray-200">
              <X size={14} />
            </button>
          )}
          <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => setResume(e.target.files?.[0] || null)} />
        </span>
        {errors.resume && <span className="mt-1 block text-[13px] text-red-600">{errors.resume}</span>}
      </label>
      <label className="sm:col-span-2 block">
        <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Why you? (optional)</span>
        <textarea rows={4} value={form.cover_letter} onChange={set("cover_letter")} className="w-full px-3.5 py-3 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-[15px] resize-none" />
      </label>
      {errors.form && <p className="sm:col-span-2 text-sm text-red-600">{errors.form}</p>}
      <div className="sm:col-span-2">
        <button disabled={sending} className="h-11 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60 inline-flex items-center gap-2">
          {sending ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : "Send application"}
        </button>
      </div>
    </form>
  );
}

function JobRow({ job }) {
  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [sent, setSent] = useState(false);
  const blocks = [
    ["About the role", job.description],
    ["What you'll do", job.responsibilities],
    ["What we're looking for", job.requirements],
    ["Benefits", job.benefits],
  ].filter(([, t]) => t?.trim());

  return (
    <motion.article {...reveal} className="rounded-xl bg-white ring-1 ring-gray-200 hover:ring-gray-300 transition-colors">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full text-left p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-red-600">{job.department}</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.employment_type}</span>
            {job.salary_range && <span>{job.salary_range}</span>}
          </div>
        </div>
        <span className={`grid place-items-center w-9 h-9 rounded-lg bg-gray-100 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronDown size={18} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 sm:px-6 pb-6">
              <div className="space-y-5">
                {blocks.map(([h, t]) => (
                  <div key={h}>
                    <h4 className="font-semibold text-gray-900">{h}</h4>
                    <p className="mt-1.5 text-gray-600 whitespace-pre-line leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
              {sent ? (
                <div className="mt-5 flex items-start gap-3 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 p-4">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-emerald-500 text-white shrink-0"><Check size={14} weight="bold" /></span>
                  <p className="text-sm text-emerald-900">Application sent. We've emailed you a confirmation and will be in touch if it's a match.</p>
                </div>
              ) : applying ? (
                <ApplyForm job={job} onDone={() => setSent(true)} />
              ) : (
                <button onClick={() => setApplying(true)} className="mt-6 h-11 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold inline-flex items-center gap-2">
                  Apply for this role <ArrowRight size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/**
 * Hiring Page - Auto Eden Careers
 */
export default function HiringPage() {
  const [openPositions, setOpenPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get("/core/jobs/");
        setOpenPositions(data.results || data);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <PageHero
        eyebrow="Careers"
        icon={Briefcase}
        title="Build the future of car trading in Zimbabwe"
        subtitle="We're making buying and selling cars simple, transparent and fair for everyone. Come help us do it."
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="#open-positions" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-red-600 hover:bg-red-700 font-semibold transition-colors">
            See open roles <ArrowRight size={16} />
          </a>
          <a href={`mailto:${CAREERS_EMAIL}`} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white/10 ring-1 ring-white/15 hover:bg-white/15 font-medium transition-colors">
            <Mail size={16} /> {CAREERS_EMAIL}
          </a>
        </div>
      </PageHero>

      {/* Values */}
      <section className="py-14 lg:py-20" aria-labelledby="values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead id="values" eyebrow="How we work" title="What we care about" />
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {values.map(([t, d], i) => (
              <motion.div key={t} {...reveal} transition={{ duration: 0.45, delay: i * 0.06 }} className="relative isolate overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 p-6">
                <Pattern variant="grid" fade="corner" className="-z-10 text-gray-100" />
                <span className="text-sm font-semibold text-red-600 tabular-nums">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{t}</h3>
                <p className="mt-1.5 text-gray-600">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-14 lg:py-20 bg-white border-y border-gray-200/70" aria-labelledby="why-join">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead id="why-join" eyebrow="Perks" title="Why join Auto Eden?" subtitle="More than a job: a chance to make a real dent in how Zimbabwe buys cars." />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {perks.map(({ icon: Icon, title, description }, index) => (
              <motion.div key={title} {...reveal} transition={{ duration: 0.45, delay: index * 0.04 }} className="rounded-xl bg-[#f6f7f9] ring-1 ring-gray-200/70 p-4 sm:p-5">
                <span className="grid place-items-center w-10 h-10 rounded-lg bg-white ring-1 ring-gray-200 text-red-600"><Icon size={20} /></span>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-gray-600 text-sm">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section id="open-positions" className="py-14 lg:py-20 scroll-mt-20" aria-labelledby="open-positions-title">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead id="open-positions-title" eyebrow="Join us" title="Open positions" />

          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => <div key={i} className="h-28 rounded-xl bg-white ring-1 ring-gray-200 animate-pulse" />)}
            </div>
          ) : openPositions.length > 0 ? (
            <div className="space-y-3">
              {openPositions.map((job) => <JobRow key={job.id} job={job} />)}
            </div>
          ) : (
            <motion.div {...reveal} className="relative isolate overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 p-8 sm:p-12 text-center">
              <Pattern variant="grid" fade="radial" className="-z-10 text-gray-100" />
              <span className="grid place-items-center w-14 h-14 mx-auto rounded-xl bg-gray-950 text-white"><Briefcase size={26} /></span>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">No open roles right now</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                We're always happy to meet talented people. Send us your CV and we'll be in touch when something fits.
              </p>
              <a
                href={`mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent("CV for future roles")}`}
                className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors"
              >
                <Mail className="w-4 h-4" /> Send your CV
              </a>
            </motion.div>
          )}
        </div>
      </section>

      <CTABand
        title="Don't see a fit? Stay in touch."
        subtitle="Follow us for new roles and company news."
        primary={{ label: "Follow on LinkedIn", href: "https://linkedin.com/company/autoeden", external: true }}
        secondary={{ label: "About Auto Eden", to: "/about" }}
      />

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Auto Eden",
            "sameAs": "https://autoeden.co.zw",
            "logo": "https://autoeden.co.zw/logo.png"
          },
          "jobLocation": {
            "@type": "Place",
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
