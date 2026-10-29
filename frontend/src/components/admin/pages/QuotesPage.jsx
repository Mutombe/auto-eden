import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Flag, Mail, MapPin, PanelRight, Phone, Trash2, XCircle } from "../../ui/icons";
import { toast } from "react-toastify";
import { errorMessage, resources } from "../lib/adminApi";
import { keys, patchRows, removeRows, replaceRow, useList, useOptimisticMutation } from "../lib/optimistic";
import { formatDate, formatMoney, timeAgo, useTableState } from "../lib/useTableState";
import { BulkBar, BulkButton, DataTable, Pagination, sk } from "../ui/DataTable";
import { ConfirmDialog, Drawer } from "../ui/overlays";
import { Button, Card, cx, EmptyState, Field, PageHeader, Pill, Textarea, Thumb } from "../ui/primitives";
import { ExportMenu, FilterSelect, SearchInput, Toolbar } from "../ui/Toolbar";

const R = "quotes";
export const QUOTE_STATUS = {
  pending: { label: "New", tone: "amber" },
  reviewed: { label: "Reviewed", tone: "blue" },
  quoted: { label: "Quoted", tone: "violet" },
  converted: { label: "Converted", tone: "green" },
  expired: { label: "Expired", tone: "gray" },
};
const PRIORITY = {
  low: { label: "Low", tone: "gray" },
  medium: { label: "Medium", tone: "blue" },
  high: { label: "High", tone: "amber" },
  urgent: { label: "Urgent", tone: "red" },
};
const vLabel = (v) => (v ? `${v.year} ${v.make} ${v.model}` : "—");

// Inline status/priority editor: a pill that is secretly a <select>.
function InlineSelect({ value, options, onChange, disabled }) {
  const o = options[value] || { label: value, tone: "gray" };
  return (
    <label className={cx("relative inline-flex", disabled ? "pointer-events-none" : "cursor-pointer")} onClick={(e) => e.stopPropagation()}>
      <Pill tone={o.tone} className="pr-5">{o.label}</Pill>
      <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 6 4 4 4-4" /></svg>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Change">
        {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
    </label>
  );
}

export default function QuotesPage() {
  const qc = useQueryClient();
  const [state, update] = useTableState({ ordering: "-created_at", status: "", priority: "" });
  const params = useMemo(
    () => ({ page: state.page, page_size: state.page_size, search: state.search, ordering: state.ordering, status: state.status, priority: state.priority }),
    [state]
  );
  const list = useList(R, resources.quotes.list, params);
  const rows = list.data?.results || [];
  const [selected, setSelected] = useState(new Set());
  const [drawerId, setDrawerId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const drawerRow = rows.find((r) => r.id === drawerId) || null;

  const save = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id, data }) => resources.quotes.update(id, data),
    apply: (qc, { id, data }) => patchRows(qc, R, [id], { ...data, __pending: true }),
    settle: (qc, q) => replaceRow(qc, R, q.id, q),
    success: (_, { toastText }) => toastText || "Quote request updated",
    failure: "Couldn't update quote request",
  });
  const bulkSave = useOptimisticMutation({
    resource: R,
    mutationFn: ({ ids, data }) => Promise.all(ids.map((id) => resources.quotes.update(id, data))),
    apply: (qc, { ids, data }) => patchRows(qc, R, ids, { ...data, __pending: true }),
    success: (_, { ids }) => `${ids.length} quote requests updated`,
    failure: "Bulk update failed",
  });
  const remove = useOptimisticMutation({
    resource: R,
    mutationFn: ({ ids }) => Promise.all(ids.map((id) => resources.quotes.remove(id))),
    apply: (qc, { ids }) => removeRows(qc, R, ids),
    success: (_, { ids }) => (ids.length > 1 ? `${ids.length} quote requests deleted` : "Quote request deleted"),
    failure: "Couldn't delete",
  });

  const downloadPdf = async (q) => {
    const id = toast.loading("Generating quote PDF…");
    try {
      const blob = await resources.quotes.downloadPdf(q.id);
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `AutoEden_Quote_${q.id}.pdf` });
      a.click();
      URL.revokeObjectURL(url);
      toast.update(id, { render: "Quote PDF downloaded", type: "success", isLoading: false, autoClose: 2500 });
    } catch (err) {
      toast.update(id, { render: `PDF failed — ${errorMessage(err)}`, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  const clearSel = () => setSelected(new Set());
  const setField = (q, field, value) =>
    save.mutate({ id: q.id, data: { [field]: value }, toastText: `${q.full_name}: ${field} → ${(field === "status" ? QUOTE_STATUS : PRIORITY)[value].label}` });

  const columns = [
    {
      id: "customer",
      skeleton: sk.lines("w-28", "w-40"),
      header: "Customer",
      sortKey: "full_name",
      cell: (q) => (
        <div className="leading-tight min-w-[180px]">
          <div className="font-semibold text-gray-900 truncate max-w-[220px]">{q.full_name}</div>
          <div className="text-[12px] text-gray-500 truncate max-w-[220px]">{q.email}</div>
        </div>
      ),
    },
    { id: "phone", header: "Phone", hideBelow: "lg", skeleton: sk.text("w-24"), cell: (q) => <a href={`tel:${q.telephone}`} onClick={(e) => e.stopPropagation()} className="text-gray-700 hover:text-red-600 whitespace-nowrap">{q.telephone || "—"}</a> },
    { id: "location", header: "Location", hideBelow: "xl", skeleton: sk.text("w-28"), cell: (q) => <span className="text-gray-600">{[q.city, q.country].filter(Boolean).join(", ") || "—"}</span> },
    {
      id: "vehicle",
      skeleton: sk.media("w-11 h-8"),
      header: "Vehicle",
      cell: (q) => (
        <div className="flex items-center gap-2.5 min-w-[180px]">
          <Thumb src={q.vehicle?.thumbnail} className="w-11 h-8 rounded ring-1 ring-black/5" />
          <div className="leading-tight min-w-0">
            <div className="text-gray-900 font-medium truncate max-w-[180px]">{vLabel(q.vehicle)}</div>
            <div className="text-[12px] text-gray-500">{formatMoney(q.vehicle?.price)}</div>
          </div>
        </div>
      ),
    },
    { id: "priority", header: "Priority", sortKey: "priority", skeleton: sk.pill("w-20"), cell: (q) => <InlineSelect value={q.priority} options={PRIORITY} disabled={q.__pending} onChange={(v) => setField(q, "priority", v)} /> },
    { id: "status", header: "Status", sortKey: "status", skeleton: sk.pill("w-16"), cell: (q) => <InlineSelect value={q.status} options={QUOTE_STATUS} disabled={q.__pending} onChange={(v) => setField(q, "status", v)} /> },
    { id: "created", header: "Received", sortKey: "created_at", hideBelow: "lg", skeleton: sk.text("w-20"), cell: (q) => <span className="text-gray-500 whitespace-nowrap" title={formatDate(q.created_at, true)}>{timeAgo(q.created_at)}</span> },
  ];

  const exportColumns = [
    { id: "id", header: "ID" },
    { id: "full_name", header: "Customer" },
    { id: "email", header: "Email" },
    { id: "telephone", header: "Phone" },
    { id: "city", header: "City" },
    { id: "country", header: "Country" },
    { id: "address", header: "Address" },
    { id: "vehicle", header: "Vehicle", exportValue: (q) => vLabel(q.vehicle) },
    { id: "vehicle_price", header: "Vehicle price", exportValue: (q) => Number(q.vehicle?.price) || "" },
    { id: "priority", header: "Priority", exportValue: (q) => PRIORITY[q.priority]?.label },
    { id: "status", header: "Status", exportValue: (q) => QUOTE_STATUS[q.status]?.label },
    { id: "note", header: "Customer note" },
    { id: "admin_notes", header: "Admin notes" },
    { id: "created_at", header: "Received", exportValue: (q) => formatDate(q.created_at, true) },
  ];

  const rowMenu = (q) => [
    { label: "Open", icon: PanelRight, onClick: () => setDrawerId(q.id) },
    { label: "Download quote PDF", icon: Download, onClick: () => downloadPdf(q) },
    { label: "Email customer", icon: Mail, onClick: () => window.open(`mailto:${q.email}?subject=Your Auto Eden quote for the ${vLabel(q.vehicle)}`) },
    { divider: true },
    { label: "Delete", icon: Trash2, danger: true, onClick: () => setConfirm({ ids: [q.id] }) },
  ];

  return (
    <>
      <PageHeader title="Quote requests" subtitle={list.data ? `${list.data.count.toLocaleString()} requests` : "Buyer enquiries and quotations"}>
        <ExportMenu listFn={resources.quotes.list} params={params} columns={exportColumns} filename="autoeden_quotes" selectedRows={rows.filter((r) => selected.has(r.id))} total={list.data?.count || 0} />
      </PageHeader>
      <Card className="overflow-hidden">
        <Toolbar>
          <SearchInput value={state.search} onChange={(search) => update({ search })} placeholder="Search name, email, phone, vehicle…" />
          <FilterSelect label="Status" value={state.status} onChange={(status) => update({ status })} options={Object.entries(QUOTE_STATUS).map(([value, s]) => ({ value, label: s.label }))} />
          <FilterSelect label="Priority" icon={Flag} value={state.priority} onChange={(priority) => update({ priority })} options={Object.entries(PRIORITY).map(([value, s]) => ({ value, label: s.label }))} />
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
          onRowClick={(q) => setDrawerId(q.id)}
          onRowHover={(q) => qc.setQueryData(keys.detail(R, q.id), q)}
          rowMenu={rowMenu}
          mobileCard={(q) => (
            <div>
              <div className="font-semibold text-[14px]">{q.full_name}</div>
              <div className="text-[12.5px] text-gray-500 truncate">{vLabel(q.vehicle)} · {timeAgo(q.created_at)}</div>
              <div className="flex gap-1.5 mt-1.5">
                <Pill tone={QUOTE_STATUS[q.status]?.tone}>{QUOTE_STATUS[q.status]?.label}</Pill>
                <Pill tone={PRIORITY[q.priority]?.tone} dot={false}>{PRIORITY[q.priority]?.label}</Pill>
              </div>
            </div>
          )}
          empty={<EmptyState icon={list.isError ? XCircle : FileText} title={list.isError ? "Couldn't load quote requests" : "No quote requests found"} action={list.isError ? <Button onClick={() => list.refetch()}>Retry</Button> : null} />}
        />
        {(list.data?.count ?? 0) > 0 && (
          <Pagination page={state.page} pageSize={state.page_size} count={list.data.count} totalPages={list.data.total_pages} onPage={(page) => { clearSel(); update({ page }, { resetPage: false }); }} onPageSize={(page_size) => update({ page_size })} />
        )}
      </Card>

      <BulkBar count={selected.size} onClear={clearSel}>
        <BulkButton onClick={() => { bulkSave.mutate({ ids: [...selected], data: { status: "reviewed" } }); clearSel(); }}>Mark reviewed</BulkButton>
        <BulkButton onClick={() => { bulkSave.mutate({ ids: [...selected], data: { status: "quoted" } }); clearSel(); }}>Mark quoted</BulkButton>
        <BulkButton onClick={() => { bulkSave.mutate({ ids: [...selected], data: { priority: "high" } }); clearSel(); }}>High priority</BulkButton>
        <BulkButton icon={Trash2} danger onClick={() => setConfirm({ ids: [...selected] })}>Delete</BulkButton>
      </BulkBar>

      <QuoteDrawer
        quote={drawerRow}
        onClose={() => setDrawerId(null)}
        onSave={(data, toastText) => save.mutate({ id: drawerRow.id, data, toastText })}
        onDownload={() => downloadPdf(drawerRow)}
        onDelete={() => {
          setConfirm({ ids: [drawerRow.id] });
          setDrawerId(null);
        }}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.ids.length > 1 ? `Delete ${confirm.ids.length} quote requests?` : "Delete this quote request?"}
        message="It's permanently removed. This can't be undone."
        onConfirm={() => {
          remove.mutate({ ids: confirm.ids });
          clearSel();
        }}
      />
    </>
  );
}

function QuoteDrawer({ quote, onClose, onSave, onDownload, onDelete }) {
  const [notes, setNotes] = useState("");
  useEffect(() => {
    setNotes(quote?.admin_notes || "");
  }, [quote?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!quote) return <Drawer open={false} onClose={onClose} />;
  const dirty = notes !== (quote.admin_notes || "");
  const Row = ({ icon: Icon, children }) => (
    <div className="flex items-start gap-2.5 text-[13.5px] text-gray-700"><Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" /><div className="min-w-0">{children}</div></div>
  );
  return (
    <Drawer
      open
      onClose={onClose}
      width="sm:w-[520px]"
      title={quote.full_name}
      subtitle={`Quote request #${quote.id} · received ${formatDate(quote.created_at, true)}`}
      footer={
        <>
          <Button variant="primary" icon={Download} onClick={onDownload}>Quote PDF</Button>
          <Button icon={Mail} onClick={() => window.open(`mailto:${quote.email}`)}>Email</Button>
          <Button variant="danger" icon={Trash2} className="ml-auto" onClick={onDelete}>Delete</Button>
        </>
      }
    >
      <div className="p-5 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <div><InlineSelect value={quote.status} options={QUOTE_STATUS} disabled={quote.__pending} onChange={(v) => onSave({ status: v }, `Status → ${QUOTE_STATUS[v].label}`)} /></div>
          </Field>
          <Field label="Priority">
            <div><InlineSelect value={quote.priority} options={PRIORITY} disabled={quote.__pending} onChange={(v) => onSave({ priority: v }, `Priority → ${PRIORITY[v].label}`)} /></div>
          </Field>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Contact</h4>
          <Row icon={Mail}><a className="hover:text-red-600" href={`mailto:${quote.email}`}>{quote.email}</a></Row>
          <Row icon={Phone}><a className="hover:text-red-600" href={`tel:${quote.telephone}`}>{quote.telephone || "—"}</a></Row>
          <Row icon={MapPin}>{[quote.address, quote.city, quote.country].filter(Boolean).join(", ") || "—"}</Row>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Vehicle</h4>
          <a href={`/vehicles/${quote.vehicle?.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-gray-300">
            <Thumb src={quote.vehicle?.thumbnail} className="w-16 h-12 rounded-lg" />
            <div className="leading-tight">
              <div className="font-semibold text-[14px]">{vLabel(quote.vehicle)}</div>
              <div className="text-[13px] text-gray-500">{formatMoney(quote.vehicle?.price)}</div>
            </div>
          </a>
        </div>

        {quote.note && (
          <div>
            <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Customer note</h4>
            <p className="text-[13.5px] text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3">{quote.note}</p>
          </div>
        )}

        <div>
          <Field label="Admin notes" hint={quote.processed_by ? `Last processed by ${quote.processed_by} · ${formatDate(quote.processed_at, true)}` : "Internal only — never shown to the customer"}>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Called customer, shipping estimate sent…" />
          </Field>
          {dirty && (
            <div className="flex justify-end gap-2 mt-2">
              <Button size="xs" onClick={() => setNotes(quote.admin_notes || "")}>Discard</Button>
              <Button size="xs" variant="primary" onClick={() => onSave({ admin_notes: notes }, "Notes saved")}>Save notes</Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
