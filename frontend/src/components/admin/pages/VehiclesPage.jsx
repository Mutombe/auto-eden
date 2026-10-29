import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck, Car, Eye, EyeOff, ExternalLink, Fuel, ImageOff, Pencil, Plus, Settings2, ShieldCheck, Tag, Trash2, XCircle, PanelRight,
} from "../../ui/icons";
import { resources } from "../lib/adminApi";
import { keys, prefetchList, useList } from "../lib/optimistic";
import { useUpload } from "../lib/uploadStore";
import { formatDate, formatMoney, useTableState } from "../lib/useTableState";
import { BulkBar, BulkButton, DataTable, Pagination, sk } from "../ui/DataTable";
import { ConfirmDialog, Modal } from "../ui/overlays";
import { Avatar, Button, Card, EmptyState, Field, PageHeader, Pill, Tabs, Textarea, Thumb, Toggle, VehicleStatus, VEHICLE_STATES } from "../ui/primitives";
import { ExportMenu, FilterSelect, SearchInput, Toolbar } from "../ui/Toolbar";
import VehicleForm, { BODY, FUEL, TRANSMISSION } from "./vehicles/VehicleForm";
import VehicleDrawer, { formatKm } from "./vehicles/VehicleDrawer";
import { useVehicleMutations, vehicleLabel } from "./vehicles/useVehicleMutations";

// Status tabs map onto server filters
const TABS = [
  { value: "all", label: "All", countKey: "total", params: {} },
  { value: "pending", label: "Pending review", countKey: "pending", params: { verification_state: "pending" } },
  { value: "physical", label: "Live", countKey: "physical", params: { verification_state: "physical" } },
  { value: "digital", label: "Digitally verified", countKey: "digital", params: { verification_state: "digital" } },
  { value: "rejected", label: "Rejected", countKey: "rejected", params: { verification_state: "rejected" } },
  { value: "hidden", label: "Hidden", countKey: "hidden", params: { is_visible: "false" } },
  { value: "no_photos", label: "No photos", countKey: "no_images", params: { has_images: "false" } },
];

function PhotoCell({ vehicle }) {
  const upload = useUpload(vehicle.id);
  if (upload) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-sky-700 font-medium tabular-nums">
        <span className="w-3 h-3 rounded-full border-2 border-sky-200 border-t-sky-600 animate-spin" />
        {upload.done}/{upload.total}
      </span>
    );
  }
  const n = (vehicle.images || []).filter((i) => !i.__local).length || (vehicle.images || []).length;
  return n ? <span className="tabular-nums text-gray-600">{n}</span> : <Pill tone="red" dot={false}>None</Pill>;
}

const priceOf = (v) => (v.listing_type === "instant_sale" ? v.proposed_price : v.price);

export default function VehiclesPage() {
  const qc = useQueryClient();
  const [state, update] = useTableState({ tab: "all", ordering: "-created_at", listing_type: "", fuel_type: "", transmission: "", body_type: "" });
  const tab = TABS.find((t) => t.value === state.tab) || TABS[0];

  const paramsFor = (t, page) => ({
    page,
    page_size: state.page_size,
    search: state.search,
    ordering: state.ordering,
    listing_type: state.listing_type,
    fuel_type: state.fuel_type,
    transmission: state.transmission,
    body_type: state.body_type,
    ...t.params,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const params = useMemo(() => paramsFor(tab, state.page), [state, tab]);
  // Predictive: hovering a tab loads its first page, so the switch shows data immediately.
  const prefetchTab = (value) => {
    const t = TABS.find((x) => x.value === value);
    if (t) prefetchList(qc, "vehicles", resources.vehicles.list, paramsFor(t, 1));
  };

  const list = useList("vehicles", resources.vehicles.list, params);
  const { data: summary } = useQuery({ queryKey: keys.summary("vehicles"), queryFn: resources.vehicles.summary });
  const rows = list.data?.results || [];

  const [selected, setSelected] = useState(new Set());
  const [drawerRow, setDrawerRow] = useState(null);
  const [form, setForm] = useState({ open: false, vehicle: null });
  const [draft, setDraft] = useState(null);
  const [reject, setReject] = useState(null); // { ids, label }
  const [confirmDelete, setConfirmDelete] = useState(null); // { ids, label }

  const m = useVehicleMutations({ onCreateFailed: (vars) => setDraft(vars) });

  // Keep the open drawer in sync with optimistic changes to its row
  const liveDrawerRow = drawerRow ? rows.find((r) => r.id === drawerRow.id) || drawerRow : null;

  const prefetch = (row) =>
    qc.prefetchQuery({ queryKey: keys.detail("vehicles", row.id), queryFn: () => resources.vehicles.get(row.id), staleTime: 30_000 });

  const selectedRows = rows.filter((r) => selected.has(r.id));
  const clearSel = () => setSelected(new Set());

  const openCreate = () => setForm({ open: true, vehicle: null });
  const openEdit = (v) => {
    setDrawerRow(null);
    setForm({ open: true, vehicle: v });
  };
  const handleSubmit = ({ data, files, previews, removedImageIds }) => {
    if (form.vehicle) {
      m.update.mutate({ id: form.vehicle.id, data, files, removedImageIds });
    } else {
      setDraft(null);
      if (state.page !== 1 || state.tab !== "all") update({ tab: "all" });
      m.create.mutate({ data, files, previews });
    }
  };

  const setStatus = (v, s) => m.setStatus.mutate({ id: v.id, state: s });
  const toggleVis = (v) => m.toggleVisibility.mutate({ id: v.id, visible: !v.is_visible });
  const askDelete = (v) => setConfirmDelete({ ids: [v.id], label: vehicleLabel(v) });
  const askReject = (v) => setReject({ ids: [v.id], label: vehicleLabel(v) });

  const columns = [
    {
      id: "vehicle",
      header: "Vehicle",
      skeleton: sk.media("w-14 h-10"),
      sortKey: "make",
      cell: (v) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <Thumb src={v.images?.[0]?.image} className="w-14 h-10 rounded-md ring-1 ring-black/5" />
          <div className="min-w-0 leading-tight">
            <div className="font-semibold text-gray-900 truncate max-w-[240px]">{v.make} {v.model}</div>
            <div className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className="tabular-nums">{v.year}</span>
              <span className="text-gray-300">·</span>
              <span className="font-mono text-[11px] truncate max-w-[150px]">{v.vin}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      skeleton: sk.pill("w-28"),
      sortKey: "verification_state",
      cell: (v) => <VehicleStatus state={v.verification_state} />,
    },
    {
      id: "price",
      header: "Price",
      skeleton: sk.num("w-16"),
      sortKey: "price",
      align: "right",
      cell: (v) => (
        <div className="leading-tight">
          <div className="font-semibold text-gray-900">{formatMoney(priceOf(v))}</div>
          {v.listing_type === "instant_sale" && <div className="text-[11px] text-violet-600 font-medium">Instant sale</div>}
        </div>
      ),
    },
    { id: "mileage", header: "Mileage", align: "right", hideBelow: "xl", skeleton: sk.num(), cell: (v) => <span className="text-gray-600">{formatKm(v.mileage)}</span> },
    { id: "location", header: "Location", hideBelow: "xl", skeleton: sk.text("w-20"), cell: (v) => <span className="text-gray-600">{v.location || "—"}</span> },
    {
      id: "owner",
      header: "Owner",
      skeleton: sk.person(22, 1),
      hideBelow: "lg",
      cell: (v) => (
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={v.owner?.username} size={22} />
          <span className="truncate max-w-[130px] text-gray-700">{v.owner?.username || "—"}</span>
        </div>
      ),
    },
    { id: "photos", header: "Photos", align: "right", skeleton: sk.num("w-6"), cell: (v) => <PhotoCell vehicle={v} /> },
    {
      id: "visible",
      header: "Live",
      skeleton: sk.toggle(),
      cell: (v) => <Toggle checked={!!v.is_visible} disabled={v.__temp || v.__pending} onChange={() => toggleVis(v)} label="Visible on marketplace" />,
    },
    { id: "created", header: "Added", sortKey: "created_at", hideBelow: "lg", skeleton: sk.text("w-16"), cell: (v) => <span className="text-gray-500 whitespace-nowrap">{formatDate(v.created_at)}</span> },
  ];

  const exportColumns = [
    { id: "id", header: "ID" },
    { id: "make", header: "Make" },
    { id: "model", header: "Model" },
    { id: "year", header: "Year" },
    { id: "vin", header: "VIN" },
    { id: "status", header: "Status", exportValue: (v) => VEHICLE_STATES[v.verification_state]?.label || v.verification_state },
    { id: "listing_type", header: "Listing type", exportValue: (v) => (v.listing_type === "instant_sale" ? "Instant sale" : "Marketplace") },
    { id: "price", header: "Price (USD)", exportValue: (v) => (v.price ? Number(v.price) : "") },
    { id: "proposed_price", header: "Offer price (USD)", exportValue: (v) => (v.proposed_price ? Number(v.proposed_price) : "") },
    { id: "mileage", header: "Mileage" },
    { id: "fuel_type", header: "Fuel" },
    { id: "transmission", header: "Transmission" },
    { id: "body_type", header: "Body" },
    { id: "location", header: "Location" },
    { id: "owner", header: "Owner", exportValue: (v) => v.owner?.username },
    { id: "owner_email", header: "Owner email", exportValue: (v) => v.owner?.email },
    { id: "is_visible", header: "Visible", exportValue: (v) => (v.is_visible ? "Yes" : "No") },
    { id: "photos", header: "Photos", exportValue: (v) => v.images?.length || 0 },
    { id: "rejection_reason", header: "Rejection reason" },
    { id: "created_at", header: "Created", exportValue: (v) => formatDate(v.created_at, true) },
  ];

  const rowMenu = (v) => [
    { label: "View details", icon: PanelRight, onClick: () => setDrawerRow(v) },
    { label: "Edit", icon: Pencil, onClick: () => openEdit(v) },
    { divider: true },
    v.verification_state !== "physical" && { label: "Verify physically (go live)", icon: BadgeCheck, onClick: () => setStatus(v, "physical") },
    v.verification_state === "pending" && { label: "Verify digitally", icon: ShieldCheck, onClick: () => setStatus(v, "digital") },
    v.verification_state !== "rejected" && { label: "Reject…", icon: XCircle, onClick: () => askReject(v) },
    { label: v.is_visible ? "Hide from marketplace" : "Show on marketplace", icon: v.is_visible ? EyeOff : Eye, onClick: () => toggleVis(v) },
    { label: "Open public page", icon: ExternalLink, onClick: () => window.open(`/vehicles/${v.id}`, "_blank") },
    { divider: true },
    { label: "Delete", icon: Trash2, danger: true, onClick: () => askDelete(v) },
  ];

  const mobileCard = (v) => (
    <div className="flex gap-3">
      <Thumb src={v.images?.[0]?.image} className="w-20 h-14 rounded-lg ring-1 ring-black/5" />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[14px] text-gray-900 truncate">{v.year} {v.make} {v.model}</div>
        <div className="text-[13px] font-semibold text-gray-900 mt-0.5">
          {formatMoney(priceOf(v))}
          {v.listing_type === "instant_sale" && <span className="ml-1.5 text-[11px] text-violet-600">Instant sale</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {v.__temp ? <Pill tone="violet">Saving…</Pill> : <VehicleStatus state={v.verification_state} />}
          {!v.is_visible && <Pill tone="gray">Hidden</Pill>}
          <span className="text-[12px] text-gray-500"><PhotoCell vehicle={v} /> photos</span>
        </div>
      </div>
    </div>
  );

  const filtersActive = state.listing_type || state.fuel_type || state.transmission || state.body_type || state.search;

  return (
    <>
      <PageHeader title="Vehicles" subtitle={summary ? `${summary.total.toLocaleString()} vehicles · ${summary.pending} awaiting review` : "Inventory, verification and listings"}>
        <ExportMenu
          listFn={resources.vehicles.list}
          params={params}
          columns={exportColumns}
          filename="autoeden_vehicles"
          selectedRows={selectedRows}
          total={list.data?.count || 0}
        />
        <Button variant="primary" icon={Plus} onClick={openCreate}>
          {draft ? "New vehicle (draft)" : "New vehicle"}
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="px-4 pt-1">
          <Tabs
            value={tab.value}
            onHover={prefetchTab}
            onChange={(value) => {
              clearSel();
              update({ tab: value });
            }}
            tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: summary?.[t.countKey] }))}
          />
        </div>
        <Toolbar
          right={
            filtersActive ? (
              <Button variant="ghost" size="sm" onClick={() => update({ search: "", listing_type: "", fuel_type: "", transmission: "", body_type: "" })}>
                Clear filters
              </Button>
            ) : null
          }
        >
          <SearchInput value={state.search} onChange={(search) => update({ search })} placeholder="Search make, model, VIN, owner…" />
          <FilterSelect label="Type" icon={Tag} value={state.listing_type} onChange={(listing_type) => update({ listing_type })} options={[{ value: "marketplace", label: "Marketplace" }, { value: "instant_sale", label: "Instant sale" }]} />
          <FilterSelect label="Fuel" icon={Fuel} value={state.fuel_type} onChange={(fuel_type) => update({ fuel_type })} options={FUEL.map(([value, label]) => ({ value, label }))} />
          <FilterSelect label="Gearbox" icon={Settings2} value={state.transmission} onChange={(transmission) => update({ transmission })} options={TRANSMISSION.map(([value, label]) => ({ value, label }))} />
          <FilterSelect label="Body" icon={Car} value={state.body_type} onChange={(body_type) => update({ body_type })} options={BODY.map(([value, label]) => ({ value, label }))} />
        </Toolbar>

        <DataTable
          columns={columns}
          rows={rows}
          isLoading={list.isLoading}
          isFetching={list.isFetching}
          ordering={state.ordering}
          onSort={(ordering) => update({ ordering }, { resetPage: false })}
          selected={selected}
          onSelect={setSelected}
          onRowClick={setDrawerRow}
          onRowHover={prefetch}
          rowMenu={rowMenu}
          mobileCard={mobileCard}
          empty={
            list.isError ? (
              <EmptyState icon={XCircle} title="Couldn't load vehicles" description="Check your connection and try again." action={<Button onClick={() => list.refetch()}>Retry</Button>} />
            ) : (
              <EmptyState
                icon={tab.value === "no_photos" ? ImageOff : Car}
                title={filtersActive ? "No vehicles match these filters" : tab.value === "pending" ? "Review queue is clear" : "No vehicles here"}
                description={filtersActive ? "Try a different search or clear the filters." : undefined}
                action={!filtersActive && tab.value === "all" ? <Button variant="primary" icon={Plus} onClick={openCreate}>Add a vehicle</Button> : null}
              />
            )
          }
        />
        {(list.data?.count ?? 0) > 0 && (
          <Pagination
            page={state.page}
            pageSize={state.page_size}
            count={list.data.count}
            totalPages={list.data.total_pages}
            onPage={(page) => {
              clearSel();
              update({ page }, { resetPage: false });
            }}
            onPageSize={(page_size) => update({ page_size })}
          />
        )}
      </Card>

      <BulkBar count={selected.size} onClear={clearSel}>
        <BulkButton icon={BadgeCheck} onClick={() => { m.bulk.mutate({ ids: [...selected], action: "physical" }); clearSel(); }}>Verify</BulkButton>
        <BulkButton icon={XCircle} onClick={() => setReject({ ids: [...selected], label: `${selected.size} vehicles` })}>Reject</BulkButton>
        <BulkButton icon={Eye} onClick={() => { m.bulk.mutate({ ids: [...selected], action: "show" }); clearSel(); }}>Show</BulkButton>
        <BulkButton icon={EyeOff} onClick={() => { m.bulk.mutate({ ids: [...selected], action: "hide" }); clearSel(); }}>Hide</BulkButton>
        <BulkButton icon={Trash2} danger onClick={() => setConfirmDelete({ ids: [...selected], label: `${selected.size} vehicles` })}>Delete</BulkButton>
      </BulkBar>

      <VehicleDrawer
        row={liveDrawerRow}
        onClose={() => setDrawerRow(null)}
        onEdit={openEdit}
        onStatus={setStatus}
        onReject={askReject}
        onToggleVisibility={toggleVis}
        onDelete={(v) => {
          setDrawerRow(null);
          askDelete(v);
        }}
      />

      <VehicleForm open={form.open} vehicle={form.vehicle} draft={form.vehicle ? null : draft} onClose={() => setForm({ open: false, vehicle: null })} onSubmit={handleSubmit} />

      <RejectDialog
        target={reject}
        onClose={() => setReject(null)}
        onConfirm={(reason) => {
          if (reject.ids.length === 1) m.setStatus.mutate({ id: reject.ids[0], state: "rejected", reason });
          else m.bulk.mutate({ ids: reject.ids, action: "reject", reason });
          clearSel();
        }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={`Delete ${confirmDelete?.label}?`}
        message="This permanently removes the listing, its photos, bids and quote requests. This can't be undone."
        confirmText="Delete"
        onConfirm={() => {
          const { ids, label } = confirmDelete;
          if (ids.length === 1) m.remove.mutate({ id: ids[0], label });
          else m.bulk.mutate({ ids, action: "delete" });
          setDrawerRow((d) => (d && ids.includes(d.id) ? null : d));
          clearSel();
        }}
      />
    </>
  );
}

const REASONS = ["Photos are unclear or missing", "Price looks unrealistic", "Details don't match the documents", "Duplicate listing"];

function RejectDialog({ target, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const open = !!target;
  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      icon={XCircle}
      title={`Reject ${target?.label}`}
      subtitle="The owner is emailed this reason."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="dangerSolid"
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason.trim());
              onClose();
            }}
          >
            Reject
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {REASONS.map((r) => (
          <button key={r} onClick={() => setReason(r)} className="px-2.5 h-7 rounded-md text-[12px] border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50">
            {r}
          </button>
        ))}
      </div>
      <Field label="Reason" required>
        <Textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Explain what needs to change…" />
      </Field>
    </Modal>
  );
}
