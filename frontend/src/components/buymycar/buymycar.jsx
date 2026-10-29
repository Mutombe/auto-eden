// src/components/buymycar/buymycar.jsx
// "Buy My Car": the seller asks Auto Eden itself to buy their car (instant_sale listing).
// The form works signed out too: on submit we ask them to sign in, then send the saved draft.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AuthModals } from "../auth/AuthModals";
import Pattern from "../ui/Pattern";
import { resources, errorMessage } from "../admin/lib/adminApi";
import { keys } from "../admin/lib/optimistic";
import { usePhotoUploader } from "../admin/pages/vehicles/useVehicleMutations";
import { useUpload } from "../admin/lib/uploadStore";
import { ME, useMine } from "../../lib/accountApi";
import { formatPrice } from "../../lib/progressive";
import { titleCase } from "../vehicles/ListingCard";
import {
  ArrowRight,
  Camera,
  Car,
  CheckCircle,
  ChevronDown,
  Clock,
  FileCheck,
  HandCoins,
  ImagePlus,
  Shield,
  X,
} from "../ui/icons";

const YEAR = new Date().getFullYear();
const MAX_PHOTOS = 20;
const EMPTY = { make: "", model: "", year: "", mileage: "", vin: "", fuel_type: "", transmission: "", location: "", proposed_price: "", description: "" };

const STEPS = [
  { icon: FileCheck, title: "Tell us about your car", text: "Make, model, mileage, a few photos and the price you have in mind. It takes about two minutes." },
  { icon: Shield, title: "We check the details", text: "Our team reviews your submission, then arranges a physical inspection at no cost to you." },
  { icon: HandCoins, title: "Get your offer", text: "We make you a fair cash offer based on the car's real condition. No haggling with strangers." },
  { icon: CheckCircle, title: "Get paid", text: "Accept the offer, hand over the keys and paperwork, and we pay you securely." },
];

const COMPARE = [
  ["Fees", "None", "Adverts and agent commission"],
  ["Who you deal with", "Auto Eden's own team", "Strangers responding to adverts"],
  ["Viewings", "One inspection", "Many viewings and test drives"],
  ["Getting paid", "Secure payment from Auto Eden", "Cash handovers and payment risk"],
];

const FAQ = [
  ["Does it cost anything?", "No. Getting an offer is free and there are no fees or hidden charges, whether or not you accept."],
  ["Where do I find my VIN?", "The 17-character Vehicle Identification Number is on your registration book, at the bottom of the windscreen on the driver's side, and on the driver's door pillar."],
  ["What happens after I submit?", "Our team reviews the details first, then contacts you to arrange a physical inspection. Your offer follows the inspection. You can follow every step from your dashboard."],
  ["Can I sell on the marketplace instead?", "Yes. If you'd rather set your own price and let buyers make offers, list the car on the marketplace from your dashboard. It's also free."],
];

const inputCls =
  "w-full h-11 px-3.5 rounded-lg bg-white text-[15px] text-gray-900 placeholder:text-gray-400 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-shadow";

function F({ label, error, hint, children, className = "", as: Tag = "label" }) {
  return (
    <Tag className={`block ${className}`}>
      <span className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
      {error ? <span className="block text-xs text-red-600 mt-1">{error}</span> : hint ? <span className="block text-xs text-gray-500 mt-1">{hint}</span> : null}
    </Tag>
  );
}

function Chips({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value === v ? "" : v)}
          className={`h-9 px-3.5 rounded-lg text-[13px] font-medium transition-colors ${
            value === v ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function validateStep(step, f, photos) {
  const e = {};
  if (step === 0) {
    if (!f.make.trim()) e.make = "Required";
    if (!f.model.trim()) e.model = "Required";
    const y = Number(f.year);
    if (!y || y < 1950 || y > YEAR + 1) e.year = "Enter a valid year";
    if (!String(f.mileage).trim() || Number(f.mileage) < 0) e.mileage = "Required";
    const vin = f.vin.trim();
    if (!vin) e.vin = "Required";
    else if (vin.length > 17) e.vin = "A VIN has at most 17 characters";
  } else {
    if (!(Number(f.proposed_price) > 0)) e.proposed_price = "Enter the price you'd like";
    if (photos.length === 0) e.photos = "Add at least one photo";
  }
  return e;
}

export default function BuyMyCarPage() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const formRef = useRef(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="pacaembu-font bg-[#f6f7f9]">
      {/* Hero + form */}
      <section className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_90%_10%,rgba(220,38,38,0.38),transparent_65%)]" />
        <Pattern variant="tread" fade="left" scale={0.9} className="-z-10 text-white/[0.06]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-10 lg:pb-20 grid lg:grid-cols-[minmax(0,1fr)_460px] gap-8 lg:gap-14 items-start">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="lg:pt-8">
            <span className="inline-flex items-center gap-2 h-7 px-3 rounded-md bg-white/10 ring-1 ring-inset ring-white/15 text-[12.5px] font-medium text-white/85">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Sell directly to Auto Eden
            </span>
            <h1 className="mt-4 text-[34px] leading-[1.08] sm:text-5xl lg:text-[56px] font-semibold tracking-tight">
              We'll buy your car.
              <span className="block text-white/50">No adverts, no strangers.</span>
            </h1>
            <p className="mt-5 text-[16px] sm:text-lg text-white/70 max-w-xl leading-relaxed">
              Tell us about your car and the price you have in mind. We check it, inspect it and make you a fair offer, then pay you securely.
            </p>
            <ul className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl">
              {[
                [HandCoins, "Free offer", "No fees, ever"],
                [Shield, "Inspected", "By our own team"],
                [Clock, "Fast", "Skip weeks of viewings"],
              ].map(([Icon, t, s]) => (
                <li key={t} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.06] ring-1 ring-inset ring-white/10">
                  <span className="grid place-items-center w-9 h-9 rounded-md bg-red-600/90 shrink-0">
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{t}</span>
                    <span className="block text-xs text-white/55">{s}</span>
                  </span>
                </li>
              ))}
            </ul>
            <button onClick={scrollToForm} className="lg:hidden mt-7 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-semibold">
              Get my offer <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div ref={formRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="scroll-mt-20">
            <OfferForm />
          </motion.div>
        </div>
      </section>

      {isAuthenticated && <MyInstantSales />}

      {/* How it works */}
      <section className="relative isolate overflow-hidden py-16 lg:py-24">
        <Pattern variant="dots" fade="radial" className="-z-10 text-gray-300" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-red-600">How it works</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">From first photo to payment in four steps</h2>
          </div>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative bg-white rounded-xl p-5 sm:p-6 ring-1 ring-gray-200/80 overflow-hidden">
                <span className="absolute -right-2 -top-5 text-[88px] font-bold leading-none text-gray-100 select-none tabular-nums">{i + 1}</span>
                <span className="relative grid place-items-center w-11 h-11 rounded-lg bg-red-50 text-red-600">
                  <s.icon className="w-[22px] h-[22px]" />
                </span>
                <h3 className="relative mt-4 font-semibold text-gray-900">{s.title}</h3>
                <p className="relative mt-1.5 text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight text-center">Why sell to Auto Eden?</h2>
          <p className="mt-3 text-gray-600 text-center max-w-xl mx-auto">Selling privately can mean weeks of adverts, calls and viewings. Here's the difference.</p>
          <div className="mt-10 rounded-xl ring-1 ring-gray-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr] text-[12px] sm:text-sm font-semibold">
              <div className="p-3 sm:p-4 bg-gray-50" />
              <div className="relative isolate overflow-hidden p-3 sm:p-4 bg-gray-950 text-white">
                <Pattern variant="circuit" fade="corner" scale={0.7} className="-z-10 text-white/[0.12]" />
                Auto Eden
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 text-gray-500">Selling privately</div>
            </div>
            {COMPARE.map(([k, us, them]) => (
              <div key={k} className="grid grid-cols-[1fr_1fr_1fr] border-t border-gray-100 text-[13px] sm:text-[15px]">
                <div className="p-3 sm:p-4 font-medium text-gray-900">{k}</div>
                <div className="p-3 sm:p-4 bg-red-50/40 text-gray-900 flex gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 hidden sm:block" />
                  {us}
                </div>
                <div className="p-3 sm:p-4 text-gray-500">{them}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">Questions</h2>
          <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
            {FAQ.map(([q, a]) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button onClick={scrollToForm} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">
              Get my offer <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/contact" className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-white ring-1 ring-gray-200 hover:bg-gray-50 text-gray-900 font-medium">
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="font-medium text-gray-900">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-gray-600 leading-relaxed">
            <span className="block pb-5">{a}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------- the form
function OfferForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const uploadPhotos = usePhotoUploader(ME.vehicles);
  const fileRef = useRef(null);

  const [step, setStep] = useState(0);
  const [f, setF] = useState(EMPTY);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(null);
  const [auth, setAuth] = useState(null);
  const [waitingForAuth, setWaitingForAuth] = useState(false);

  const previews = useMemo(() => photos.map((p) => URL.createObjectURL(p)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const set = (k) => (e) => {
    const v = e?.target ? e.target.value : e;
    setF((p) => ({ ...p, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const addPhotos = (list) => {
    const imgs = [...list].filter((x) => x.type.startsWith("image/") || /\.(heic|heif)$/i.test(x.name));
    setPhotos((cur) => [...cur, ...imgs].slice(0, MAX_PHOTOS));
    setErrors((er) => ({ ...er, photos: undefined }));
  };

  const next = () => {
    const e = validateStep(0, f, photos);
    setErrors(e);
    if (!Object.keys(e).length) setStep(1);
  };

  const send = async () => {
    setSending(true);
    setServerError("");
    try {
      const vehicle = await resources.vehicles.create({
        make: f.make.trim(),
        model: f.model.trim(),
        year: Number(f.year),
        mileage: String(f.mileage).trim(),
        vin: f.vin.trim().toUpperCase(),
        fuel_type: f.fuel_type || null,
        transmission: f.transmission || null,
        location: f.location.trim() || null,
        description: f.description.trim() || "No description provided",
        proposed_price: Number(f.proposed_price),
        listing_type: "instant_sale",
      });
      qc.invalidateQueries({ queryKey: keys.all(ME.vehicles) });
      uploadPhotos(vehicle, photos); // photos upload in the background, with progress below
      setDone(vehicle);
    } catch (err) {
      const vinTaken = /vin/i.test(JSON.stringify(err.response?.data || ""));
      if (vinTaken) {
        setStep(0);
        setErrors({ vin: "This VIN is already registered with us. Check it, or contact us if this is your car." });
      } else setServerError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const submit = (e) => {
    e?.preventDefault();
    const er = validateStep(1, f, photos);
    setErrors(er);
    if (Object.keys(er).length) return;
    if (!isAuthenticated) {
      setWaitingForAuth(true);
      setAuth("register");
      return;
    }
    send();
  };

  // Signed in from the prompt: send the draft they already filled in.
  useEffect(() => {
    if (isAuthenticated && waitingForAuth) {
      setWaitingForAuth(false);
      setAuth(null);
      send();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, waitingForAuth]);

  const reset = () => {
    setF(EMPTY);
    setPhotos([]);
    setStep(0);
    setDone(null);
  };

  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/5 overflow-hidden">
      {done ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Thanks, we've got your {titleCase(`${done.make} ${done.model}`)}</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Our team will review the details and contact you to arrange an inspection. Your photos are uploading now. You can follow progress from your dashboard.
          </p>
          <div className="mt-6 grid gap-2">
            <button onClick={() => navigate("/dashboard?tab=listings")} className="h-11 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-semibold">
              Track it in my dashboard
            </button>
            <button onClick={reset} className="h-11 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 text-sm font-medium">
              Sell another car
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="relative isolate overflow-hidden px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
            <Pattern variant="contour" fade="right" className="-z-10 text-gray-200" />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Get your offer</h2>
              <span className="text-xs font-medium text-gray-500">Step {step + 1} of 2</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {["Your car", "Photos & price"].map((l, i) => (
                <div key={l}>
                  <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-red-600" : "bg-gray-200"}`} />
                  <p className={`mt-1.5 text-[12px] font-medium ${i <= step ? "text-gray-900" : "text-gray-400"}`}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {step === 0 ? (
              <div className="grid grid-cols-2 gap-3.5">
                <F label="Make" error={errors.make}>
                  <input className={inputCls} value={f.make} onChange={set("make")} placeholder="Toyota" autoComplete="off" />
                </F>
                <F label="Model" error={errors.model}>
                  <input className={inputCls} value={f.model} onChange={set("model")} placeholder="Hilux" autoComplete="off" />
                </F>
                <F label="Year" error={errors.year}>
                  <input className={inputCls} type="number" inputMode="numeric" value={f.year} onChange={set("year")} placeholder={String(YEAR - 6)} />
                </F>
                <F label="Mileage (km)" error={errors.mileage}>
                  <input className={inputCls} type="number" inputMode="numeric" value={f.mileage} onChange={set("mileage")} placeholder="85000" />
                </F>
                <F label="VIN" error={errors.vin} hint="17 characters, on your registration book" className="col-span-2">
                  <input className={`${inputCls} uppercase tracking-wider`} value={f.vin} onChange={set("vin")} maxLength={17} placeholder="AHTFR22G106012345" autoComplete="off" />
                </F>
                <F as="div" label="Fuel" className="col-span-2">
                  <Chips value={f.fuel_type} onChange={set("fuel_type")} options={[["petrol", "Petrol"], ["diesel", "Diesel"], ["hybrid", "Hybrid"], ["electric", "Electric"]]} />
                </F>
                <F as="div" label="Gearbox" className="col-span-2">
                  <Chips value={f.transmission} onChange={set("transmission")} options={[["automatic", "Automatic"], ["manual", "Manual"]]} />
                </F>
                <button type="button" onClick={next} className="col-span-2 mt-1 h-12 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold inline-flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Photos</span>
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                      <div key={src} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 grid place-items-center w-6 h-6 rounded-md bg-black/60 text-white"
                          aria-label="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {i === 0 && <span className="absolute bottom-1 left-1 px-1.5 rounded bg-black/60 text-white text-[10px] font-medium">Cover</span>}
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className={`aspect-square rounded-lg border-2 border-dashed grid place-items-center text-gray-500 hover:bg-gray-50 transition-colors ${
                          errors.photos ? "border-red-300 bg-red-50/50" : "border-gray-300"
                        } ${photos.length === 0 ? "col-span-4 aspect-auto h-28" : ""}`}
                      >
                        <span className="flex flex-col items-center gap-1 text-[12.5px] font-medium">
                          {photos.length === 0 ? <Camera className="w-6 h-6" /> : <ImagePlus className="w-5 h-5" />}
                          {photos.length === 0 ? "Add photos: front, back, sides, interior" : "Add"}
                        </span>
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
                  {errors.photos && <span className="block text-xs text-red-600 mt-1">{errors.photos}</span>}
                </div>
                <F label="Price you'd like (USD)" error={errors.proposed_price}>
                  <input className={inputCls} type="number" inputMode="numeric" value={f.proposed_price} onChange={set("proposed_price")} placeholder="12000" />
                </F>
                <F label="Where is the car?">
                  <input className={inputCls} value={f.location} onChange={set("location")} placeholder="Harare" />
                </F>
                <F label="Anything we should know?" className="col-span-2">
                  <textarea
                    className={`${inputCls} h-auto py-2.5 resize-none`}
                    rows={3}
                    value={f.description}
                    onChange={set("description")}
                    placeholder="Service history, recent repairs, any damage…"
                  />
                </F>
                {serverError && <p className="col-span-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>}
                <div className="col-span-2 mt-1 grid grid-cols-[auto_1fr] gap-2">
                  <button type="button" onClick={() => setStep(0)} className="h-12 px-4 rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 text-sm font-medium">
                    Back
                  </button>
                  <button type="submit" disabled={sending} className="h-12 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold inline-flex items-center justify-center gap-2">
                    {sending ? "Sending…" : isAuthenticated ? "Get my offer" : "Continue to get my offer"}
                    {!sending && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
                {!isAuthenticated && <p className="col-span-2 text-xs text-gray-500 text-center">We'll ask you to sign in or create a free account so we can send you the offer. Your details are kept.</p>}
              </div>
            )}
          </div>
        </form>
      )}
      <AuthModals
        openType={auth}
        onClose={() => {
          setAuth(null);
          setWaitingForAuth(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------- the seller's instant-sale cars
const STATE = {
  pending: ["In review", "bg-amber-50 text-amber-700 ring-amber-200"],
  digital: ["Inspection next", "bg-sky-50 text-sky-700 ring-sky-200"],
  physical: ["Inspected", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
  rejected: ["Needs changes", "bg-red-50 text-red-700 ring-red-200"],
};

function MyInstantSales() {
  const { rows, isLoading } = useMine(ME.vehicles);
  const mine = rows.filter((v) => v.listing_type === "instant_sale");
  if (isLoading || mine.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cars you've offered us</h2>
          <p className="text-sm text-gray-500">We'll be in touch about each one.</p>
        </div>
        <Link to="/dashboard?tab=listings" className="text-sm font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-1">
          Dashboard <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mine.map((v) => (
          <InstantRow key={v.id} v={v} />
        ))}
      </div>
    </section>
  );
}

function InstantRow({ v }) {
  const upload = useUpload(v.id);
  const [label, cls] = STATE[v.verification_state] || STATE.pending;
  const img = v.images?.[0]?.image;
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl ring-1 ring-gray-200/80">
      <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 grid place-items-center">
        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Car className="w-6 h-6 text-gray-300" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 truncate">{titleCase(`${v.year} ${v.make} ${v.model}`)}</p>
        <p className="text-sm text-gray-500 tabular-nums">Asking {formatPrice(v.proposed_price)}</p>
        {upload && <p className="text-xs text-gray-500">Uploading photos {upload.done}/{upload.total}</p>}
      </div>
      <span className={`shrink-0 px-2 h-6 inline-flex items-center rounded-md text-[11.5px] font-medium ring-1 ring-inset ${cls}`}>{label}</span>
    </div>
  );
}

