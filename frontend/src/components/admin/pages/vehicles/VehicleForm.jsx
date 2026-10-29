import React, { useEffect, useMemo, useRef, useState } from "react";
import { Car, ImagePlus, Trash2, X } from "../../../ui/icons";
import { Modal } from "../../ui/overlays";
import { Button, cx, Field, Input, Select, Textarea, Thumb } from "../../ui/primitives";

export const FUEL = [["petrol", "Petrol"], ["diesel", "Diesel"], ["hybrid", "Hybrid"], ["electric", "Electric"]];
export const TRANSMISSION = [["automatic", "Automatic"], ["manual", "Manual"]];
export const BODY = [["sedan", "Sedan"], ["suv", "SUV"], ["hatchback", "Hatchback"], ["coupe", "Coupe"], ["truck", "Truck"], ["van", "Van"], ["wagon", "Wagon"]];

const MAX_PHOTOS = 30;
const EMPTY = {
  make: "", model: "", year: String(new Date().getFullYear()), vin: "", mileage: "",
  fuel_type: "petrol", transmission: "automatic", body_type: "sedan", location: "",
  description: "", listing_type: "marketplace", price: "", proposed_price: "", verification_state: "physical",
};

function Section({ title, description, children }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-6 gap-y-3 py-5 first:pt-0 border-b border-gray-100 last:border-0">
      <div>
        <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function validate(f) {
  const e = {};
  if (!f.make.trim()) e.make = "Required";
  if (!f.model.trim()) e.model = "Required";
  const year = Number(f.year);
  if (!year || year < 1900 || year > new Date().getFullYear() + 1) e.year = "Enter a valid year";
  if (!f.vin.trim()) e.vin = "Required";
  else if (f.vin.trim().length > 17) e.vin = "VIN is at most 17 characters";
  if (!String(f.mileage).trim()) e.mileage = "Required";
  if (f.listing_type === "marketplace" && !(Number(f.price) > 0)) e.price = "Enter the listing price";
  if (f.listing_type === "instant_sale" && !(Number(f.proposed_price) > 0)) e.proposed_price = "Enter the offer price";
  return e;
}

/**
 * Create (vehicle = null) or edit. onSubmit receives
 * { data, files, previews, removedImageIds } and the modal closes immediately (optimistic).
 */
export default function VehicleForm({ open, onClose, vehicle, draft, onSubmit }) {
  const editing = !!vehicle;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setRemoved([]);
    if (vehicle) {
      setForm({
        ...EMPTY,
        ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, vehicle[k] ?? EMPTY[k]])),
        year: String(vehicle.year ?? ""),
        price: vehicle.price ?? "",
        proposed_price: vehicle.proposed_price ?? "",
      });
      setFiles([]);
    } else if (draft) {
      setForm({ ...EMPTY, ...draft.data, year: String(draft.data.year ?? "") });
      setFiles(draft.files || []);
    } else {
      setForm(EMPTY);
      setFiles([]);
    }
  }, [open, vehicle, draft]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const existing = (vehicle?.images || []).filter((img) => !removed.includes(img.id) && !img.__local);
  const totalPhotos = existing.length + files.length;

  const set = (name) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const addFiles = (list) => {
    const images = [...list].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    setFiles((cur) => [...cur, ...images].slice(0, MAX_PHOTOS - existing.length));
  };

  const submit = (e) => {
    e?.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const data = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      vin: form.vin.trim().toUpperCase(),
      mileage: String(form.mileage).trim(),
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      body_type: form.body_type,
      location: form.location.trim() || null,
      description: form.description.trim() || "No description provided",
      listing_type: form.listing_type,
      price: form.listing_type === "marketplace" ? form.price : form.price || null,
      proposed_price: form.listing_type === "instant_sale" ? form.proposed_price : form.proposed_price || null,
    };
    if (!editing) data.verification_state = form.verification_state;

    // Fresh object URLs: the modal's own previews are revoked when it closes
    onSubmit({
      data,
      files,
      previews: files.map((f) => URL.createObjectURL(f)),
      removedImageIds: removed,
    });
    onClose();
  };

  const err = (k) => errors[k];
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={Car}
      title={editing ? `Edit ${[vehicle.year, vehicle.make, vehicle.model].join(" ")}` : draft ? "New vehicle (restored draft)" : "New vehicle"}
      subtitle={editing ? `ID #${vehicle.id} · VIN ${vehicle.vin}` : "Saved instantly — photos upload in the background"}
      footer={
        <>
          {hasErrors && <span className="mr-auto text-xs text-red-600">Fix the highlighted fields</span>}
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            {editing ? "Save changes" : "Create vehicle"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Section title="Listing" description="How this vehicle is sold.">
          <div className="inline-flex p-0.5 rounded-lg bg-gray-100 mb-4">
            {[["marketplace", "Marketplace"], ["instant_sale", "Instant sale"]].map(([v, l]) => (
              <button
                type="button"
                key={v}
                onClick={() => set("listing_type")(v)}
                className={cx(
                  "h-8 px-3.5 rounded-md text-[13px] font-medium transition-all",
                  form.listing_type === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.listing_type === "marketplace" ? (
              <Field label="Listing price (USD)" required error={err("price")}>
                <Input type="number" min="0" step="1" inputMode="decimal" value={form.price} onChange={set("price")} placeholder="e.g. 12500" invalid={err("price")} />
              </Field>
            ) : (
              <Field label="Offer price (USD)" required error={err("proposed_price")} hint="What Auto Eden pays the seller">
                <Input type="number" min="0" step="1" inputMode="decimal" value={form.proposed_price} onChange={set("proposed_price")} placeholder="e.g. 9000" invalid={err("proposed_price")} />
              </Field>
            )}
            {!editing && (
              <Field label="Initial status" hint="Physically verified listings go live immediately">
                <Select value={form.verification_state} onChange={set("verification_state")}>
                  <option value="physical">Physically verified (live)</option>
                  <option value="digital">Digitally verified</option>
                  <option value="pending">Pending review</option>
                </Select>
              </Field>
            )}
          </div>
        </Section>

        <Section title="Vehicle" description="Identification and specs shown on the listing.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Make" required error={err("make")}>
              <Input value={form.make} onChange={set("make")} placeholder="Toyota" invalid={err("make")} />
            </Field>
            <Field label="Model" required error={err("model")}>
              <Input value={form.model} onChange={set("model")} placeholder="Hilux" invalid={err("model")} />
            </Field>
            <Field label="Year" required error={err("year")}>
              <Input type="number" inputMode="numeric" value={form.year} onChange={set("year")} invalid={err("year")} />
            </Field>
            <Field label="VIN" required error={err("vin")} className="col-span-2 sm:col-span-1">
              <Input value={form.vin} onChange={set("vin")} maxLength={17} className="font-mono uppercase" invalid={err("vin")} />
            </Field>
            <Field label="Mileage (km)" required error={err("mileage")}>
              <Input inputMode="numeric" value={form.mileage} onChange={set("mileage")} placeholder="85000" invalid={err("mileage")} />
            </Field>
            <Field label="Location">
              <Input value={form.location || ""} onChange={set("location")} placeholder="Harare" />
            </Field>
            <Field label="Fuel">
              <Select value={form.fuel_type || ""} onChange={set("fuel_type")}>
                {FUEL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Transmission">
              <Select value={form.transmission || ""} onChange={set("transmission")}>
                {TRANSMISSION.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Body type">
              <Select value={form.body_type || ""} onChange={set("body_type")}>
                {BODY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
          </div>
        </Section>

        <Section title="Description" description="Condition, history, extras.">
          <Textarea value={form.description === "No description provided" ? "" : form.description || ""} onChange={set("description")} rows={4} placeholder="Full service history, one owner…" />
        </Section>

        <Section title="Photos" description={`Up to ${MAX_PHOTOS}. The first photo is the cover. Large photos are compressed automatically.`}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={cx(
              "flex flex-col items-center justify-center gap-1 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
              dragging ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <ImagePlus className="w-6 h-6 text-gray-400" />
            <span className="text-[13px] font-medium text-gray-700">Drop photos or click to browse</span>
            <span className="text-xs text-gray-400">{totalPhotos}/{MAX_PHOTOS} photos</span>
            <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {totalPhotos > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
              {existing.map((img, i) => (
                <div key={img.id} className="relative group aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-gray-200">
                  <Thumb src={img.image} className="w-full h-full" />
                  {i === 0 && <span className="absolute left-1 top-1 px-1.5 py-px rounded bg-gray-900/75 text-white text-[10px] font-medium">Cover</span>}
                  <button
                    type="button"
                    onClick={() => setRemoved((r) => [...r, img.id])}
                    className="absolute right-1 top-1 p-1 rounded-md bg-white/90 text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {previews.map((url, i) => (
                <div key={url} className="relative group aspect-[4/3] rounded-lg overflow-hidden ring-2 ring-emerald-300">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {existing.length === 0 && i === 0 && <span className="absolute left-1 top-1 px-1.5 py-px rounded bg-gray-900/75 text-white text-[10px] font-medium">Cover</span>}
                  <span className="absolute left-1 bottom-1 px-1.5 py-px rounded bg-emerald-600 text-white text-[10px] font-medium">New</span>
                  <button
                    type="button"
                    onClick={() => setFiles((f) => f.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 p-1 rounded-md bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {removed.length > 0 && (
            <p className="text-xs text-red-600 mt-2">
              {removed.length} photo{removed.length > 1 ? "s" : ""} will be deleted when you save.{" "}
              <button type="button" className="underline" onClick={() => setRemoved([])}>Undo</button>
            </p>
          )}
        </Section>
      </form>
    </Modal>
  );
}
