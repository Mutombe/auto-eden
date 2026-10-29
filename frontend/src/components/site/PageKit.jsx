import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "../ui/icons";
import Pattern, { HeroPattern } from "../ui/Pattern";

/*
 * Shared building blocks for the content pages (Learn, Hiring, News, Contact, Reviews,
 * Suggestions, legal). They all open with the same dark hero as the dashboard and marketplace,
 * so the site reads as one product.
 */

export const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45 },
};

export function Eyebrow({ children, dark = false, className = "" }) {
  return (
    <p className={`text-[12px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-red-400" : "text-red-600"} ${className}`}>{children}</p>
  );
}

/** Dark page header. `children` sits under the subtitle (buttons, stats, a search box…). */
export function PageHero({ eyebrow, icon: Icon, title, subtitle, children, aside, compact = false }) {
  return (
    <header className="relative isolate overflow-hidden bg-gray-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_110%_at_88%_0%,rgba(220,38,38,0.34),transparent_62%)]" />
      <HeroPattern />
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 ${compact ? "pb-10 sm:pb-12" : "pb-12 sm:pb-16 lg:pb-20"} ${aside ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12 lg:items-end" : ""}`}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-md bg-white/[0.06] ring-1 ring-white/10 px-2.5 py-1 text-[12px] font-medium text-white/80">
              {Icon && <Icon size={14} className="text-red-400" />}
              {eyebrow}
            </div>
          )}
          <h1 className="mt-4 text-[32px] leading-[1.08] sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-balance">{title}</h1>
          {subtitle && <p className="mt-4 text-[17px] sm:text-lg text-white/65 leading-relaxed max-w-2xl">{subtitle}</p>}
          {children && <div className="mt-7">{children}</div>}
        </motion.div>
        {aside && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-10 lg:mt-0">
            {aside}
          </motion.div>
        )}
      </div>
    </header>
  );
}

export function SectionHead({ eyebrow, title, subtitle, center = false, action, id }) {
  return (
    <motion.div {...reveal} className={`mb-8 sm:mb-10 ${center ? "text-center max-w-2xl mx-auto" : "flex items-end justify-between gap-4"}`}>
      <div className={center ? "" : "max-w-2xl"}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 id={id} className="mt-2 text-[26px] sm:text-4xl font-semibold tracking-tight text-gray-900">{title}</h2>
        {subtitle && <p className="mt-3 text-gray-600 sm:text-lg">{subtitle}</p>}
      </div>
      {action && <div className="hidden sm:block shrink-0">{action}</div>}
    </motion.div>
  );
}

export function FAQList({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-gray-200 rounded-xl bg-white ring-1 ring-gray-200">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.question}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left"
            >
              <span className="font-medium text-gray-900">{f.question}</span>
              <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <p className="px-5 sm:px-6 pb-5 -mt-1 text-gray-600 leading-relaxed">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Closing red call-to-action band with the grid pattern. */
export function CTABand({ title, subtitle, primary, secondary }) {
  const btn = (b, light) => {
    const cls = light
      ? "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
      : "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-red-700/60 ring-1 ring-white/25 text-white font-medium hover:bg-red-700 transition-colors";
    const inner = <>{b.label}{light && <ArrowRight size={16} />}</>;
    return b.href ? (
      <a href={b.href} target={b.external ? "_blank" : undefined} rel={b.external ? "noopener noreferrer" : undefined} className={cls}>{inner}</a>
    ) : (
      <Link to={b.to} className={cls}>{inner}</Link>
    );
  };
  return (
    <section className="px-2 sm:px-3 lg:px-4 pb-2 sm:pb-3 lg:pb-4">
      <div className="relative isolate overflow-hidden rounded-xl bg-red-600 text-white">
        <Pattern variant="grid" fade="right" className="-z-10 text-white/[0.12]" />
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 sm:py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-[26px] sm:text-4xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-3 text-white/80 sm:text-lg">{subtitle}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {primary && btn(primary, true)}
            {secondary && btn(secondary, false)}
          </div>
        </div>
      </div>
    </section>
  );
}
