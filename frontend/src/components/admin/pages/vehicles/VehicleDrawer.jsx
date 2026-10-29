import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, Gavel, Pencil, ShieldCheck, Trash2, XCircle,
} from "../../../ui/icons";
import { resources } from "../../lib/adminApi";
import { keys } from "../../lib/optimistic";
import { useUpload } from "../../lib/uploadStore";
import { formatDate, formatMoney } from "../../lib/useTableState";
import { Drawer, Menu } from "../../ui/overlays";
import { Avatar, Button, cx, Pill, Skeleton, Thumb, VehicleStatus } from "../../ui/primitives";
import { BODY, FUEL, TRANSMISSION } from "./VehicleForm";
import { vehicleLabel } from "./useVehicleMutations";

const label = (pairs, v) => (pairs.find(([k]) => k === v)?.[1] ?? v) || "—";

// Mileage is free text in the DB ("85000", "85,000km"); show a clean number when possible.
export const formatKm = (mileage) => {
  if (!mileage) return "—";
  const n = Number(String(mileage).replace(/[^\d.]/g, ""));
  return n ? `${n.toLocaleString()} km` : String(mileage);
};

function Spec({ k, v, mono }) {
  return (
    <div className="py-2.5 px-3">
      <div className="text-[11.5px] text-gray-500">{k}</div>
      <div className={cx("text-[13px] font-medium text-gray-900 mt-0.5 truncate", mono && "font-mono text-[12px]")}>{v || "—"}</div>
    </div>
  );
}

function Gallery({ images, uploading }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
  }, [images?.length]);
  if (!images?.length) {
    return (
      <div className="aspect-[16/10] bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-1">
        <Thumb className="w-16 h-12 bg-transparent" />
        <span className="text-[13px]">{uploading ? "Photos uploading…" : "No photos yet — use Edit to add some"}</span>
      </div>
    );
  }
  const go = (d) => setI((x) => (x + d + images.length) % images.length);
  return (
    <div>
      <div className="relative aspect-[16/10] bg-gray-900 group">
        <Thumb src={images[i]?.image} className="w-full h-full object-contain bg-gray-900" />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/85 shadow opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous photo">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/85 shadow opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next photo">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <span className="absolute right-2 bottom-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] tabular-nums">
          {i + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 p-2 overflow-x-auto no-scrollbar bg-gray-50 border-b border-gray-100">
          {images.map((img, j) => (
            <button key={img.id} onClick={() => setI(j)} className={cx("shrink-0 rounded-md overflow-hidden ring-2 transition", j === i ? "ring-red-500" : "ring-transparent opacity-70 hover:opacity-100")}>
              <Thumb src={img.image} className="w-16 h-11" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VehicleDrawer({ row, onClose, onEdit, onStatus, onReject, onToggleVisibility, onDelete }) {
  const open = !!row;
  const { data: vehicle } = useQuery({
    queryKey: keys.detail("vehicles", row?.id),
    queryFn: () => resources.vehicles.get(row.id),
    enabled: open && typeof row?.id === "number",
    initialData: row || undefined,
    staleTime: 10_000,
  });
  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: ["admin", "vehicles", "bids", row?.id],
    queryFn: () => resources.vehicles.bids(row.id),
    enabled: open && typeof row?.id === "number",
  });
  const upload = useUpload(row?.id);
  const v = vehicle || row;
  if (!v) return <Drawer open={false} onClose={onClose} />;

  const price = v.listing_type === "instant_sale" ? v.proposed_price : v.price;
  const bidRows = bids?.results || bids || [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={vehicleLabel(v)}
      subtitle={
        <span className="flex items-center gap-2 flex-wrap">
          <span className="font-mono">#{v.id}</span>
          <VehicleStatus state={v.verification_state} />
          {!v.is_visible && <Pill tone="gray">Hidden</Pill>}
          {v.__pending && <Pill tone="violet">Saving…</Pill>}
        </span>
      }
      footer={
        <>
          <Button variant="primary" icon={Pencil} onClick={() => onEdit(v)}>Edit</Button>
          {v.verification_state !== "physical" && (
            <Button icon={BadgeCheck} onClick={() => onStatus(v, "physical")}>Verify physically</Button>
          )}
          {v.verification_state === "pending" && (
            <Button icon={ShieldCheck} onClick={() => onStatus(v, "digital")}>Verify digitally</Button>
          )}
          <div className="ml-auto">
            <Menu
              items={[
                v.verification_state !== "rejected" && { label: "Reject…", icon: XCircle, onClick: () => onReject(v) },
                { label: v.is_visible ? "Hide from marketplace" : "Show on marketplace", icon: v.is_visible ? EyeOff : Eye, onClick: () => onToggleVisibility(v) },
                { label: "Open public page", icon: ExternalLink, onClick: () => window.open(`/vehicles/${v.id}`, "_blank") },
                { divider: true },
                { label: "Delete vehicle", icon: Trash2, danger: true, onClick: () => onDelete(v) },
              ]}
            />
          </div>
        </>
      }
    >
      <Gallery images={v.images} uploading={!!upload} />
      {upload && (
        <div className="px-5 py-2.5 bg-sky-50 border-b border-sky-100 text-[13px] text-sky-800 flex items-center gap-3">
          <span className="font-medium">Uploading photos {upload.done}/{upload.total}</span>
          <div className="flex-1 h-1.5 rounded-full bg-sky-100 overflow-hidden">
            <div className="h-full bg-sky-500 transition-all" style={{ width: `${(upload.done / upload.total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="p-5 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[12px] text-gray-500">{v.listing_type === "instant_sale" ? "Instant-sale offer" : "Listing price"}</div>
            <div className="text-2xl font-semibold tabular-nums">{formatMoney(price)}</div>
          </div>
          <div className="text-right text-[12px] text-gray-500">
            Listed {formatDate(v.created_at)}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-100 rounded-xl border border-gray-200 overflow-hidden [&>*]:bg-white">
          <Spec k="Make" v={v.make} />
          <Spec k="Model" v={v.model} />
          <Spec k="Year" v={v.year} />
          <Spec k="Mileage" v={formatKm(v.mileage)} />
          <Spec k="Fuel" v={label(FUEL, v.fuel_type)} />
          <Spec k="Transmission" v={label(TRANSMISSION, v.transmission)} />
          <Spec k="Body" v={label(BODY, v.body_type)} />
          <Spec k="Location" v={v.location} />
          <Spec k="VIN" v={v.vin} mono />
        </div>

        {v.description && v.description !== "No description provided" && (
          <div>
            <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</h4>
            <p className="text-[13.5px] text-gray-700 leading-relaxed whitespace-pre-line">{v.description}</p>
          </div>
        )}

        <div>
          <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Owner</h4>
          <div className="flex items-center gap-2.5">
            <Avatar name={v.owner?.username} size={32} />
            <div className="leading-tight">
              <div className="text-[13.5px] font-medium">{v.owner?.username || "—"}</div>
              <div className="text-[12px] text-gray-500">{v.owner?.email}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Verification</h4>
          <ol className="space-y-2 text-[13px]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" /> Submitted <span className="text-gray-500 ml-auto">{formatDate(v.created_at, true)}</span>
            </li>
            {v.digitally_verified_at && (
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-500" /> Digitally verified <span className="text-gray-500 ml-auto">{formatDate(v.digitally_verified_at, true)}</span>
              </li>
            )}
            {v.physically_verified_at && (
              <li className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-500" /> Physically verified <span className="text-gray-500 ml-auto">{formatDate(v.physically_verified_at, true)}</span>
              </li>
            )}
            {v.verification_state === "rejected" && (
              <li className="rounded-lg bg-red-50 border border-red-100 p-3 text-red-800">
                <div className="flex items-center gap-2 font-medium">
                  <XCircle className="w-4 h-4" /> Rejected {v.rejected_at && <span className="font-normal text-red-600 ml-auto">{formatDate(v.rejected_at, true)}</span>}
                </div>
                {v.rejection_reason && <p className="mt-1 text-[13px]">{v.rejection_reason}</p>}
              </li>
            )}
          </ol>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" /> Bids {bidRows.length > 0 && <span className="text-gray-400">({bidRows.length})</span>}
          </h4>
          {bidsLoading ? (
            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100" aria-hidden="true">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 flex-1" />
                  <Skeleton className="h-3.5 w-14" />
                </div>
              ))}
            </div>
          ) : bidRows.length === 0 ? (
            <p className="text-[13px] text-gray-500">No bids yet.</p>
          ) : (
            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
              {bidRows.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                  <Avatar name={b.bidder?.username} size={24} />
                  <span className="font-medium">{b.bidder?.username}</span>
                  <span className="text-gray-500 truncate flex-1">{b.message}</span>
                  <span className="font-semibold tabular-nums">{formatMoney(b.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
