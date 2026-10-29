// src/components/dashboard/userDashboard.jsx
// Seller + buyer dashboard: listings, offers on them, offers I made, saved-search alerts.
// Same building blocks and optimistic behaviour as the admin console.
import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AccountLayout, { SectionHeader, ago } from "../account/AccountLayout";
import { Button, Card, cx, EmptyState, Field, Input, Pill, Skeleton, StatCard, Tabs, Thumb, Toggle, VehicleStatus } from "../admin/ui/primitives";
import { ConfirmDialog, Modal } from "../admin/ui/overlays";
import VehicleForm from "../admin/pages/vehicles/VehicleForm";
import { vehicleLabel } from "../admin/pages/vehicles/useVehicleMutations";
import { useUpload } from "../admin/lib/uploadStore";
import { ME, useMine, useMyVehicleMutations, useSearchMutations, useWithdrawBid } from "../../lib/accountApi";
import { formatPrice } from "../../lib/progressive";
import { titleCase } from "../vehicles/ListingCard";
import {
  ArrowRight,
  Car,
  CheckCircle,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Gavel,
  Handshake,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Trash2,
} from "../ui/icons";

const name = (v) => titleCase(vehicleLabel(v));
const cover = (v) => v?.images?.[0]?.image || v?.thumbnail || null;
const askingPrice = (v) => Number(v?.price || v?.proposed_price || 0);
const isLive = (v) => v.verification_state === "physical" && v.is_visible;

const BID_STATUS = {
  pending: { label: "Awaiting reply", tone: "amber" },
  accepted: { label: "Accepted", tone: "green" },
  rejected: { label: "Declined", tone: "gray" },
};
const BidStatus = ({ status }) => {
  const s = BID_STATUS[status] || { label: status, tone: "gray" };
  return <Pill tone={s.tone}>{s.label}</Pill>;
};

// How an offer compares with the asking price: "8% below asking".
function VsAsking({ amount, vehicle }) {
  const ask = askingPrice(vehicle);
  if (!ask) return null;
  const diff = Math.round(((Number(amount) - ask) / ask) * 100);
  if (diff === 0) return <span className="text-xs text-emerald-600 font-medium">At asking price</span>;
  return (
    <span className={cx("text-xs font-medium", diff > 0 ? "text-emerald-600" : "text-gray-500")}>
      {Math.abs(diff)}% {diff > 0 ? "above" : "below"} asking
    </span>
  );
}

export default function UserDashboard() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "overview";
  const [form, setForm] = useState({ open: false, vehicle: null });
  const openNew = () => setForm({ open: true, vehicle: null });
  const go = (t) => setParams(t === "overview" ? {} : { tab: t });

  const vehicleMutations = useMyVehicleMutations();
  const submit = ({ data, files, previews, removedImageIds }) => {
    if (form.vehicle) vehicleMutations.update.mutate({ id: form.vehicle.id, data, files, removedImageIds });
    else vehicleMutations.create.mutate({ data, files, previews });
    if (!form.vehicle && tab !== "listings") go("listings");
  };

  return (
    <AccountLayout
      actions={
        <Button variant="primary" size="md" icon={Plus} onClick={openNew}>
          Sell your car
        </Button>
      }
    >
      {tab === "overview" && <Overview go={go} onSell={openNew} />}
      {tab === "listings" && <Listings onSell={openNew} onEdit={(v) => setForm({ open: true, vehicle: v })} mutations={vehicleMutations} />}
      {tab === "offers" && <OffersReceived />}
      {tab === "bids" && <MyBids />}
      {tab === "searches" && <SavedSearches />}

      <VehicleForm owner open={form.open} vehicle={form.vehicle} onClose={() => setForm({ open: false, vehicle: null })} onSubmit={submit} />
    </AccountLayout>
  );
}

// ---------------------------------------------------------------- Overview
function Overview({ go, onSell }) {
  const vehicles = useMine(ME.vehicles);
  const offers = useMine(ME.offers);
  const bids = useMine(ME.bids);

  const live = vehicles.rows.filter(isLive).length;
  const review = vehicles.rows.filter((v) => v.verification_state === "pending" || v.verification_state === "digital").length;
  const newOffers = offers.rows.filter((o) => o.status === "pending");
  const myOpen = bids.rows.filter((b) => b.status === "pending").length;
  const loading = vehicles.isLoading;

  return (
    <div className="space-y-5 sm:space-y-6">
      {newOffers.length > 0 && (
        <button
          onClick={() => go("offers")}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-600 text-white text-left hover:bg-red-700 transition-colors"
        >
          <span className="grid place-items-center w-10 h-10 rounded-lg bg-white/15 shrink-0">
            <Handshake className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-semibold">
              {newOffers.length} new offer{newOffers.length > 1 ? "s" : ""} on your cars
            </span>
            <span className="block text-sm text-white/75 truncate">
              Latest: {formatPrice(newOffers[0].amount)} for {name(newOffers[0].vehicle)}
            </span>
          </span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard label="Live on marketplace" value={live} icon={CheckCircle} tone="green" loading={loading} onClick={() => go("listings")} />
        <StatCard label="In review" value={review} icon={Clock} tone="amber" loading={loading} onClick={() => go("listings")} />
        <StatCard label="Offers to review" value={newOffers.length} icon={Handshake} tone="red" loading={offers.isLoading} onClick={() => go("offers")} />
        <StatCard label="My open offers" value={myOpen} icon={Gavel} tone="blue" loading={bids.isLoading} onClick={() => go("bids")} />
      </div>

      {!loading && vehicles.rows.length === 0 && (
        <Card className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 grid place-items-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Sell your car on Auto Eden</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Add your car's details and photos. Our team verifies it, then buyers can make offers. Listing is free.
            </p>
          </div>
          <Button variant="primary" size="md" icon={Plus} onClick={onSell} className="justify-center">
            Sell your car
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Panel title="Your listings" onAll={() => go("listings")} loading={loading} empty={vehicles.rows.length === 0 && "No listings yet"}>
          {vehicles.rows.slice(0, 4).map((v) => (
            <Row key={v.id} img={cover(v)} title={name(v)} sub={`${formatPrice(askingPrice(v))} · listed ${ago(v.created_at)}`} right={<VehicleStatus state={v.verification_state} />} dim={v.__temp} />
          ))}
        </Panel>
        <Panel title="Latest offers on your cars" onAll={() => go("offers")} loading={offers.isLoading} empty={offers.rows.length === 0 && "No offers yet. They'll show here as soon as a buyer makes one."}>
          {offers.rows.slice(0, 4).map((o) => (
            <Row
              key={o.id}
              img={cover(o.vehicle)}
              title={`${formatPrice(o.amount)} from ${o.bidder}`}
              sub={`${name(o.vehicle)} · ${ago(o.created_at)}`}
              right={<BidStatus status={o.status} />}
            />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, onAll, loading, empty, children }) {
  return (
    <Card className="p-1.5">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <button onClick={onAll} className="text-[13px] font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-1">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5">
            <Skeleton className="w-14 h-10 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        ))
      ) : empty ? (
        <p className="px-3 pb-6 pt-4 text-sm text-gray-500">{empty}</p>
      ) : (
        children
      )}
    </Card>
  );
}

const Row = ({ img, title, sub, right, dim }) => (
  <div className={cx("flex items-center gap-3 p-2.5 rounded-lg", dim && "opacity-60")}>
    <Thumb src={img} className="w-14 h-10 rounded-md" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
      <p className="text-xs text-gray-500 truncate">{sub}</p>
      <div className="sm:hidden mt-1">{right}</div>
    </div>
    <div className="hidden sm:block shrink-0">{right}</div>
  </div>
);

// ---------------------------------------------------------------- Listings
const LISTING_FILTERS = [
  { value: "all", label: "All", test: () => true },
  { value: "live", label: "Live", test: isLive },
  { value: "review", label: "In review", test: (v) => v.verification_state === "pending" || v.verification_state === "digital" },
  { value: "hidden", label: "Hidden", test: (v) => v.verification_state === "physical" && !v.is_visible },
  { value: "rejected", label: "Needs changes", test: (v) => v.verification_state === "rejected" },
];

function Listings({ onSell, onEdit, mutations }) {
  const { rows, isLoading } = useMine(ME.vehicles);
  const offers = useMine(ME.offers);
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(null);

  const offerCount = useMemo(() => {
    const m = {};
    offers.rows.forEach((o) => (m[o.vehicle?.id] = (m[o.vehicle?.id] || 0) + 1));
    return m;
  }, [offers.rows]);

  const tabs = LISTING_FILTERS.map((f) => ({ value: f.value, label: f.label, count: rows.filter(f.test).length })).filter(
    (t) => t.value === "all" || t.count > 0
  );
  const shown = rows.filter(LISTING_FILTERS.find((f) => f.value === filter)?.test || (() => true));

  return (
    <>
      <SectionHeader title="My listings" description="Cars you're selling. Edits to a live listing are saved straight away." />
      {rows.length > 0 && (
        <div className="mb-4">
          <Tabs tabs={tabs} value={filter} onChange={setFilter} />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => <ListingSkeleton key={i} />)}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Car}
            title="You haven't listed a car yet"
            description="Add the details and photos. We verify every car before it goes live, so buyers trust what they see."
            action={<Button variant="primary" size="md" icon={Plus} onClick={onSell}>Sell your car</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {shown.map((v) => (
            <ListingCard
              key={v.id}
              v={v}
              offers={offerCount[v.id] || 0}
              onEdit={() => onEdit(v)}
              onToggle={() => mutations.toggleVisibility.mutate({ id: v.id, visible: !v.is_visible })}
              onDelete={() => setConfirm(v)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`Delete ${confirm ? name(confirm) : ""}?`}
        message="The listing, its photos and any offers on it will be removed. This can't be undone."
        onConfirm={() => mutations.remove.mutate({ id: confirm.id, label: name(confirm) })}
      />
    </>
  );
}

const ListingSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-[16/10] w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-full mt-3" />
    </div>
  </Card>
);

const STATE_NOTE = {
  pending: "Our team is reviewing your listing. This usually takes less than a day.",
  digital: "Details checked. We'll arrange a physical inspection next.",
};

function ListingCard({ v, offers, onEdit, onToggle, onDelete }) {
  const navigate = useNavigate();
  const upload = useUpload(v.id);
  const busy = v.__temp || v.__pending;
  return (
    <Card className={cx("overflow-hidden flex flex-col transition-opacity", busy && "opacity-70")}>
      <div className="relative">
        <Thumb src={cover(v)} alt={name(v)} className="aspect-[16/10] w-full" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <VehicleStatus state={v.verification_state} />
          {v.verification_state === "physical" && !v.is_visible && <Pill tone="gray">Hidden</Pill>}
        </div>
        {upload && (
          <span className="absolute bottom-2.5 left-2.5 px-2 h-6 inline-flex items-center rounded-md bg-gray-900/80 text-white text-[11.5px] font-medium">
            Uploading photos {upload.done}/{upload.total}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 truncate">{name(v)}</h3>
        <div className="flex items-baseline justify-between gap-2 mt-0.5">
          <p className="text-lg font-semibold text-gray-900 tabular-nums">{formatPrice(askingPrice(v))}</p>
          <p className="text-xs text-gray-500">Listed {ago(v.created_at)}</p>
        </div>

        {v.verification_state === "rejected" ? (
          <p className="mt-3 text-[13px] text-red-700 bg-red-50 rounded-lg px-3 py-2">
            <span className="font-medium">Needs changes: </span>
            {v.rejection_reason || "Please check the details and photos, then save to resubmit."}
          </p>
        ) : STATE_NOTE[v.verification_state] ? (
          <p className="mt-3 text-[13px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{STATE_NOTE[v.verification_state]}</p>
        ) : offers > 0 ? (
          <Link to="/dashboard?tab=offers" className="mt-3 text-[13px] text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 inline-flex items-center gap-2">
            <Handshake className="w-4 h-4 text-red-600" />
            {offers} offer{offers > 1 ? "s" : ""} received
          </Link>
        ) : null}

        <div className="mt-auto pt-4 flex items-center gap-1.5">
          {isLive(v) && (
            <Button size="sm" icon={ExternalLink} onClick={() => navigate(`/vehicles/${v.id}`)} className="flex-1 justify-center">View</Button>
          )}
          <Button size="sm" icon={Edit3} onClick={onEdit} disabled={busy} className="flex-1 justify-center">
            Edit
          </Button>
          {v.verification_state === "physical" && (
            <Button size="icon" variant="secondary" icon={v.is_visible ? EyeOff : Eye} onClick={onToggle} disabled={busy} aria-label={v.is_visible ? "Hide from marketplace" : "Show on marketplace"} title={v.is_visible ? "Hide from marketplace" : "Show on marketplace"} />
          )}
          <Button size="icon" variant="danger" icon={Trash2} onClick={onDelete} disabled={busy} aria-label="Delete listing" title="Delete listing" />
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- Offers on my cars
const OFFER_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting reply" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Declined" },
];

function OffersReceived() {
  const { rows, isLoading } = useMine(ME.offers);
  const [filter, setFilter] = useState("all");
  const tabs = OFFER_FILTERS.map((f) => ({ ...f, count: f.value === "all" ? rows.length : rows.filter((r) => r.status === f.value).length }));
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <>
      <SectionHeader title="Offers received" description="What buyers have offered for your cars. Auto Eden contacts you to agree the sale, so you never have to share your number." />
      {rows.length > 0 && <div className="mb-4"><Tabs tabs={tabs} value={filter} onChange={setFilter} /></div>}
      {isLoading ? (
        <RowsSkeleton />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={Handshake} title="No offers yet" description="When a buyer makes an offer on one of your live listings, it shows up here and we email you." />
        </Card>
      ) : (
        <Card className="divide-y divide-gray-100">
          {shown.map((o) => (
            <OfferRow key={o.id} vehicle={o.vehicle} amount={o.amount} status={o.status} created={o.created_at} who={o.bidder} message={o.message} />
          ))}
        </Card>
      )}
    </>
  );
}

function OfferRow({ vehicle, amount, status, created, who, message, action }) {
  const hasMessage = message && message !== "No message provided";
  return (
    <div className="p-3.5 sm:p-4 flex gap-3 sm:gap-4">
      <Thumb src={cover(vehicle)} className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-gray-900 tabular-nums">{formatPrice(amount)}</p>
            <p className="text-[13px] text-gray-600 truncate">
              {vehicle?.id ? <Link to={`/vehicles/${vehicle.id}`} className="hover:text-red-600">{name(vehicle)}</Link> : name(vehicle)}
            </p>
          </div>
          <BidStatus status={status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
          <VsAsking amount={amount} vehicle={vehicle} />
          <span className="text-gray-300">•</span>
          {who && <span>from {who}</span>}
          <span>{ago(created)}</span>
        </div>
        {hasMessage && (
          <p className="mt-2 text-[13px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2 flex gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-px" />
            <span className="line-clamp-3">{message}</span>
          </p>
        )}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
    </div>
  );
}

const RowsSkeleton = () => (
  <Card className="divide-y divide-gray-100">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-4 flex gap-4">
        <Skeleton className="w-24 h-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    ))}
  </Card>
);

// ---------------------------------------------------------------- Offers I made
function MyBids() {
  const navigate = useNavigate();
  const { rows, isLoading } = useMine(ME.bids);
  const withdraw = useWithdrawBid();
  const [confirm, setConfirm] = useState(null);

  return (
    <>
      <SectionHeader title="My offers" description="Offers you've made on other people's cars.">
        <Button size="md" icon={Search} onClick={() => navigate("/marketplace")}>Browse cars</Button>
      </SectionHeader>
      {isLoading ? (
        <RowsSkeleton />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Gavel}
            title="You haven't made any offers"
            description="Find a car you like on the marketplace and tap Make an offer. Your offers and their status appear here."
            action={<Button variant="primary" size="md" onClick={() => navigate("/marketplace")}>Browse the marketplace</Button>}
          />
        </Card>
      ) : (
        <Card className="divide-y divide-gray-100">
          {rows.map((b) => (
            <OfferRow
              key={b.id}
              vehicle={b.vehicle}
              amount={b.amount}
              status={b.status}
              created={b.created_at}
              message={b.message}
              action={
                b.status === "pending" && (
                  <Button size="xs" variant="ghost" icon={Trash2} onClick={() => setConfirm(b)} className="!text-gray-500 hover:!text-red-600">
                    Withdraw offer
                  </Button>
                )
              }
            />
          ))}
        </Card>
      )}
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Withdraw this offer?"
        message={confirm ? `Your ${formatPrice(confirm.amount)} offer on ${name(confirm.vehicle)} will be cancelled and the seller won't see it any more.` : ""}
        confirmText="Withdraw"
        onConfirm={() => withdraw.mutate({ id: confirm.id })}
      />
    </>
  );
}

// ---------------------------------------------------------------- Saved searches
const EMPTY_SEARCH = { make: "", model: "", min_year: "", max_year: "", max_price: "" };

function SavedSearches() {
  const navigate = useNavigate();
  const { rows, isLoading } = useMine(ME.searches);
  const m = useSearchMutations();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const describe = (s) =>
    [s.min_year && s.max_year ? `${s.min_year}–${s.max_year}` : s.min_year || s.max_year, s.max_price && `up to ${formatPrice(s.max_price)}`]
      .filter(Boolean)
      .join(" · ");
  const browse = (s) => `/marketplace?${new URLSearchParams({ make: s.make, search: s.model, ...(s.max_price ? { maxPrice: String(Math.round(s.max_price)) } : {}) })}`;

  return (
    <>
      <SectionHeader title="Saved searches" description="Tell us what you're looking for and we'll email you when a matching car is listed.">
        <Button variant="primary" size="md" icon={Plus} onClick={() => setOpen(true)}>New alert</Button>
      </SectionHeader>
      {isLoading ? (
        <RowsSkeleton />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Heart}
            title="No saved searches"
            description="Create an alert, for example a Toyota Hilux from 2015 under $20,000, and we'll let you know as soon as one is listed."
            action={<Button variant="primary" size="md" icon={Plus} onClick={() => setOpen(true)}>Create an alert</Button>}
          />
        </Card>
      ) : (
        <Card className="divide-y divide-gray-100">
          {rows.map((s) => {
            const active = s.status !== "paused";
            return (
              <div key={s.id} className={cx("p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4", s.__temp && "opacity-60")}>
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 grid place-items-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{titleCase(`${s.make} ${s.model}`)}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {describe(s)}
                    {s.match_count > 0 && ` · ${s.match_count} match${s.match_count > 1 ? "es" : ""}`}
                  </p>
                </div>
                <Button size="sm" icon={ExternalLink} onClick={() => navigate(browse(s))} className="hidden sm:inline-flex">Browse</Button>
                <label className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                  <span className="hidden sm:inline">{active ? "Alerts on" : "Paused"}</span>
                  <Toggle checked={active} disabled={s.__temp} label={active ? "Pause alerts" : "Resume alerts"} onChange={(on) => m.setActive.mutate({ id: s.id, active: on })} />
                </label>
                <Button size="icon" variant="ghost" icon={Trash2} disabled={s.__temp} onClick={() => setConfirm(s)} aria-label="Delete saved search" />
              </div>
            );
          })}
        </Card>
      )}

      <NewSearchModal open={open} onClose={() => setOpen(false)} onSave={(data) => m.create.mutate(data)} />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Delete this saved search?"
        message="You'll stop getting emails for it."
        onConfirm={() => m.remove.mutate({ id: confirm.id })}
      />
    </>
  );
}

function NewSearchModal({ open, onClose, onSave }) {
  const [f, setF] = useState(EMPTY_SEARCH);
  const [errors, setErrors] = useState({});
  const year = new Date().getFullYear();
  const set = (k) => (e) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const save = (e) => {
    e?.preventDefault();
    const er = {};
    if (!f.make.trim()) er.make = "Required";
    if (!f.model.trim()) er.model = "Required";
    if (!(Number(f.max_price) > 0)) er.max_price = "Enter your budget";
    const min = Number(f.min_year) || 1990;
    const max = Number(f.max_year) || year + 1;
    if (min > max) er.max_year = "Must be after the 'from' year";
    setErrors(er);
    if (Object.keys(er).length) return;
    onSave({ make: f.make.trim(), model: f.model.trim(), min_year: min, max_year: max, max_price: Number(f.max_price) });
    setF(EMPTY_SEARCH);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      icon={Heart}
      title="New search alert"
      subtitle="We'll email you when a matching car is listed"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save alert</Button>
        </>
      }
    >
      <form onSubmit={save} className="grid grid-cols-2 gap-3">
        <Field label="Make" required error={errors.make}>
          <Input value={f.make} onChange={set("make")} placeholder="Toyota" invalid={errors.make} autoFocus />
        </Field>
        <Field label="Model" required error={errors.model}>
          <Input value={f.model} onChange={set("model")} placeholder="Hilux" invalid={errors.model} />
        </Field>
        <Field label="From year" hint="Optional">
          <Input type="number" inputMode="numeric" value={f.min_year} onChange={set("min_year")} placeholder="2015" />
        </Field>
        <Field label="To year" error={errors.max_year} hint="Optional">
          <Input type="number" inputMode="numeric" value={f.max_year} onChange={set("max_year")} placeholder={String(year)} invalid={errors.max_year} />
        </Field>
        <Field label="Max price (USD)" required error={errors.max_price} className="col-span-2">
          <Input type="number" inputMode="numeric" value={f.max_price} onChange={set("max_price")} placeholder="20000" invalid={errors.max_price} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
