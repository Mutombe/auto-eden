import React, { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "../ui/icons";
import { getConsent, onOpenCookieSettings, saveConsent } from "../../lib/consent";
import Pattern from "../ui/Pattern";

/**
 * First-visit cookie banner + preferences panel.
 * Shown until the visitor makes a choice; reopened from any "Cookie settings" link.
 * "Accept all" and "Essential only" are equally prominent — declining is as easy as accepting.
 */
export default function CookieConsent() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("summary"); // summary | prefs
  const [analytics, setAnalytics] = useState(false);
  const titleId = useId();

  // New visitors: appear shortly after the page settles, so it never competes with first paint.
  useEffect(() => {
    if (getConsent()) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(
    () =>
      onOpenCookieSettings(() => {
        setAnalytics(!!getConsent()?.analytics);
        setView("prefs");
        setOpen(true);
      }),
    []
  );

  const decide = (choice) => {
    saveConsent(choice);
    setOpen(false);
  };

  // Staff tools are not part of the public site.
  if (pathname.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-labelledby={titleId}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="pacaembu-font fixed z-[60] inset-x-3 bottom-3 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:w-[420px] bg-white rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden pb-[env(safe-area-inset-bottom)]"
        >
          <div className="relative isolate p-5">
            <Pattern variant="grid" fade="corner" scale={0.75} className="-z-10 text-gray-200" />
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-950 text-white flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="font-semibold text-gray-900">
                  {view === "summary" ? "We value your privacy" : "Cookie preferences"}
                </h2>
                {view === "summary" && (
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    We use essential cookies to keep you signed in and the site secure. With your permission, we also count
                    visits and vehicle views to improve Auto Eden. No advertising cookies, ever.
                  </p>
                )}
              </div>
              {view === "prefs" && getConsent() && (
                <button onClick={() => setOpen(false)} className="p-1 -m-1 text-gray-400 hover:text-gray-600" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {view === "prefs" && (
              <div className="mt-4 space-y-2.5">
                <Row
                  title="Essential"
                  text="Sign-in, security and remembering this choice. Needed for the site to work."
                  control={<span className="text-xs font-medium text-gray-500 whitespace-nowrap">Always on</span>}
                />
                <Row
                  title="Analytics"
                  text="Counts visits and vehicle views so we know what's popular. No advertising."
                  control={<Switch checked={analytics} onChange={setAnalytics} label="Allow analytics cookies" />}
                />
              </div>
            )}

            <p className="mt-3 text-xs text-gray-500">
              Read our{" "}
              <Link to="/cookies" className="underline hover:text-gray-800">Cookie Policy</Link> and{" "}
              <Link to="/privacy" className="underline hover:text-gray-800">Privacy Policy</Link>.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {view === "summary" ? (
                <>
                  <button onClick={() => decide({ analytics: false })} className={btnSecondary}>Essential only</button>
                  <button onClick={() => decide({ analytics: true })} className={btnPrimary}>Accept all</button>
                </>
              ) : (
                <>
                  <button onClick={() => decide({ analytics })} className={btnSecondary}>Save choices</button>
                  <button onClick={() => decide({ analytics: true })} className={btnPrimary}>Accept all</button>
                </>
              )}
            </div>
            {view === "summary" && (
              <button onClick={() => setView("prefs")} className="mt-3 w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900">
                Manage preferences
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const btnBase = "h-11 rounded-lg text-sm font-medium transition-colors";
const btnPrimary = `${btnBase} bg-red-600 hover:bg-red-700 text-white`;
const btnSecondary = `${btnBase} bg-gray-100 hover:bg-gray-200 text-gray-900`;

function Row({ title, text, control }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white ring-1 ring-gray-200 p-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{text}</div>
      </div>
      {control}
    </div>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-red-600" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}
