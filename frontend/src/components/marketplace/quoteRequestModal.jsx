// Quote request: a bottom sheet on phones, a dialog on larger screens. Posts to
// /core/vehicles/<id>/request-quote/; the backend emails a PDF quotation and alerts the team.
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { X, FileText, CheckCircle, WhatsappLogo, Lock } from "../ui/icons";
import { requestQuote, resetQuoteState } from "../../redux/slices/quoteSlice";
import { formatPrice } from "../../lib/progressive";
import { titleCase } from "../vehicles/ListingCard";

const COUNTRIES = [
  "Zimbabwe", "South Africa", "Zambia", "Botswana", "Mozambique", "Malawi", "Namibia",
  "Tanzania", "Kenya", "United Kingdom", "United States", "Australia", "Canada", "Ireland",
  "United Arab Emirates", "Other",
];

const TOPICS = ["Is it still available?", "Can I view it?", "Delivery to my city", "Payment options"];

const WHATSAPP = "263782222032";
const EMPTY = { fullName: "", email: "", telephone: "", country: "Zimbabwe", city: "", address: "", note: "" };

const field =
  "w-full h-11 px-3.5 rounded-lg bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-red-600 outline-none text-[15px] text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50";

function Field({ label, error, hint, optional, children }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[13px] font-medium text-gray-700 mb-1.5">
        {label}
        {optional && <span className="font-normal text-gray-400">Optional</span>}
      </span>
      {children}
      {error ? (
        <span className="block mt-1 text-[12px] text-red-600">{error}</span>
      ) : hint ? (
        <span className="block mt-1 text-[12px] text-gray-500">{hint}</span>
      ) : null}
    </label>
  );
}

function validate(f) {
  const e = {};
  if (!f.fullName.trim()) e.fullName = "Tell us your name";
  if (!f.email.trim()) e.email = "We need an email to send the quote to";
  else if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "That email doesn't look right";
  if (!f.telephone.trim()) e.telephone = "Add a phone number";
  else if (!/^\+?[\d\s\-()]{8,}$/.test(f.telephone.trim())) e.telephone = "Use digits, e.g. +263 77 123 4567";
  if (!f.city.trim()) e.city = "Which city are you in?";
  return e;
}

// Turn DRF field errors into our field names.
const SERVER_FIELDS = { full_name: "fullName", email: "email", telephone: "telephone", city: "city", country: "country" };

export default function QuoteRequestModal({ open, onClose, vehicle, vehicleId }) {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.quotes.loading);
  const user = useSelector((s) => s.auth?.user);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [sentTo, setSentTo] = useState(null);

  // Fresh form each time it opens, prefilled for signed-in users.
  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY,
      fullName: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "",
      email: user?.email || "",
      telephone: user?.phone || user?.phone_number || "",
    });
    setErrors({});
    setServerError("");
    setSentTo(null);
    dispatch(resetQuoteState());
  }, [open, user, dispatch]);

  // Esc closes; the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, loading, onClose]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }));
  };

  const addTopic = (t) =>
    setForm((f) => (f.note.includes(t) ? f : { ...f, note: f.note ? `${f.note.trim()}\n${t}` : t }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;
    try {
      const res = await dispatch(
        requestQuote({ vehicleId, ...form, fullName: form.fullName.trim(), email: form.email.trim(), telephone: form.telephone.trim() })
      ).unwrap();
      setSentTo(res?.email || form.email.trim());
    } catch (err) {
      const mapped = {};
      for (const [k, v] of Object.entries(err?.fields || {})) {
        if (SERVER_FIELDS[k]) mapped[SERVER_FIELDS[k]] = Array.isArray(v) ? v[0] : String(v);
      }
      if (Object.keys(mapped).length) setErrors(mapped);
      else setServerError(err?.detail || "We couldn't send your request. Please try again.");
    }
  };

  const name = vehicle ? `${vehicle.year || ""} ${titleCase(vehicle.make)} ${titleCase(vehicle.model)}`.trim() : "";
  const price = vehicle
    ? Number(vehicle.listing_type === "instant_sale" ? vehicle.proposed_price || vehicle.price : vehicle.price || vehicle.proposed_price)
    : 0;
  const photo = vehicle?.images?.[0]?.image || vehicle?.main_image;
  const waText = encodeURIComponent(`Hi Auto Eden, I'd like a quote for the ${name} (${window.location.href})`);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="quote-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-xl max-h-[92svh] overflow-y-auto overscroll-contain shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-4 sm:px-6 pt-3 sm:pt-5 pb-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex items-start gap-3">
                {photo ? (
                  <img src={photo} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
                ) : (
                  <span className="grid place-items-center w-14 h-14 rounded-lg bg-red-50 text-red-600 shrink-0"><FileText size={26} /></span>
                )}
                <div className="flex-1 min-w-0">
                  <h2 id="quote-title" className="text-lg font-semibold text-gray-900">
                    {sentTo ? "Quote requested" : "Get a quote"}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">
                    {name}{price ? ` · ${formatPrice(price)}` : ""}
                  </p>
                </div>
                <button
                  aria-label="Close"
                  onClick={onClose}
                  disabled={loading}
                  className="p-2 -mr-2 -mt-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {sentTo ? (
              <div className="px-4 sm:px-6 py-8 text-center pb-[max(2rem,env(safe-area-inset-bottom))]">
                <span className="grid place-items-center w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle size={30} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Your quotation is on its way</h3>
                <p className="mt-1.5 text-sm text-gray-600 max-w-xs mx-auto">
                  We're emailing a PDF quote to <span className="font-medium text-gray-900 break-words">{sentTo}</span>. Check
                  your spam folder if it isn't there in a few minutes. Our team will also be in touch.
                </p>
                <div className="mt-6 grid gap-2.5">
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${waText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 rounded-lg bg-[#25D366] hover:brightness-95 text-white font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <WhatsappLogo size={20} weight="fill" /> Chat with us on WhatsApp
                  </a>
                  <button onClick={onClose} className="h-12 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 font-medium text-gray-900">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="px-4 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4">
                <p className="text-sm text-gray-600">
                  We'll email you a PDF quotation for this car, with the price and how to pay. It's free and doesn't commit you to anything.
                </p>

                <Field label="Full name" error={errors.fullName}>
                  <input className={field} value={form.fullName} onChange={set("fullName")} autoComplete="name" disabled={loading} placeholder="Tendai Moyo" />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email" error={errors.email}>
                    <input className={field} type="email" inputMode="email" value={form.email} onChange={set("email")} autoComplete="email" disabled={loading} placeholder="you@example.com" />
                  </Field>
                  <Field label="Phone" error={errors.telephone}>
                    <input className={field} type="tel" inputMode="tel" value={form.telephone} onChange={set("telephone")} autoComplete="tel" disabled={loading} placeholder="+263 77 123 4567" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Country" error={errors.country}>
                    <select className={`${field} pr-8`} value={form.country} onChange={set("country")} autoComplete="country-name" disabled={loading}>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input className={field} value={form.city} onChange={set("city")} autoComplete="address-level2" disabled={loading} placeholder="Harare" />
                  </Field>
                </div>

                <Field label="Address" optional hint="Where you'd like the car delivered, if anywhere.">
                  <input className={field} value={form.address} onChange={set("address")} autoComplete="street-address" disabled={loading} />
                </Field>

                <div>
                  <Field label="Anything you'd like to ask?" optional>
                    <textarea
                      className={`${field} h-auto py-2.5 min-h-[84px] resize-y`}
                      rows={3}
                      value={form.note}
                      onChange={set("note")}
                      disabled={loading}
                      placeholder="Questions about the car, delivery, payment…"
                    />
                  </Field>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {TOPICS.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => addTopic(t)}
                        disabled={loading}
                        className={`h-8 px-3 rounded-full text-[13px] ring-1 transition-colors ${
                          form.note.includes(t) ? "bg-red-50 ring-red-200 text-red-700" : "ring-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {serverError && (
                  <p role="alert" className="rounded-lg bg-red-50 text-red-700 text-sm px-3.5 py-2.5">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white font-semibold inline-flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                  {loading ? "Sending…" : "Email me the quote"}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[12px] text-gray-500 pb-1">
                  <Lock size={13} /> We only use your details for this quote.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
