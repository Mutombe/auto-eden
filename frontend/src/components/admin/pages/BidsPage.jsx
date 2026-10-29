import React, { useMemo, useState } from "react";
import { Check, Clock, Gavel, Trash2, X, XCircle } from "../../ui/icons";
import { resources } from "../lib/adminApi";
import { patchRows, removeRows, replaceRow, useList, useOptimisticMutation } from "../lib/optimistic";
import { formatDate, formatMoney, useTableState } from "../lib/useTableState";
import { BulkBar, BulkButton, DataTable, Pagination, sk } from "../ui/DataTable";
import { ConfirmDialog } from "../ui/overlays";
import { Avatar, Button, Card, EmptyState, PageHeader, Pill, Thumb } from "../ui/primitives";
import { ExportMenu, FilterSelect, SearchInput, Toolbar } from "../ui/Toolbar";

const R = "bids";
const STATUS = {
  pending: { label: "Pending", tone: "amber" },
  accepted: { label: "Accepted", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};
const vLabel = (v) => (v ? `${v.year} ${v.make} ${v.model}` : "—");

export default function BidsPage() {
  const [state, update] = useTableState({ ordering: "-created_at", status: "" });
  const params = useMemo(
    () => ({ page: state.page, page_size: state.page_size, search: state.search, ordering: state.ordering, status: state.status }),
    [state]
  );
  const list = useList(R, resources.bids.list, params);
  const rows = list.data?.results || [];
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null);

  const setStatus = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id, status }) => resources.bids.setStatus(id, status),
    apply: (qc, { ids, id, status }) => patchRows(qc, R, ids || [id], { status, __pending: true }),
    settle: (qc, bid) => replaceRow(qc, R, bid.id, bid),
    success: (bid) => `Bid ${STATUS[bid.status].label.toLowerCase()}`,
    failure: "Couldn't update bid",
  });
  const bulkStatus = useOptimisticMutation({
    resource: R,
    mutationFn: ({ ids, status }) => Promise.all(ids.map((id) => resources.bids.setStatus(id, status))),
    apply: (qc, { ids, status }) => patchRows(qc, R, ids, { status, __pending: true }),
    success: (_, { ids, status }) => `${ids.length} bids marked ${STATUS[status].label.toLowerCase()}`,
    failure: "Bulk update failed",
  });
  const remove = useOptimisticMutation({
    resource: R,
    mutationFn: ({ ids }) => Promise.all(ids.map((id) => resources.bids.remove(id))),
    apply: (qc, { ids }) => removeRows(qc, R, ids),
    success: (_, { ids }) => (ids.length > 1 ? `${ids.length} bids deleted` : "Bid deleted"),
    failure: "Couldn't delete",
    also: ["vehicles"],
  });

  const clearSel = () => setSelected(new Set());

  const columns = [
    {
      id: "vehicle",
      header: "Vehicle",
      skeleton: sk.media("w-12 h-9"),
      cell: (b) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Thumb src={b.vehicle?.thumbnail} className="w-12 h-9 rounded-md ring-1 ring-black/5" />
          <div className="leading-tight min-w-0">
            <div className="font-semibold text-gray-900 truncate">{vLabel(b.vehicle)}</div>
            <div className="text-[12px] text-gray-500">Listed {formatMoney(b.vehicle?.price)}</div>
          </div>
        </div>
      ),
    },
    {
      id: "bidder",
      header: "Bidder",
      skeleton: sk.person(24, 2),
      cell: (b) => (
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={b.bidder?.username} size={24} />
          <div className="leading-tight min-w-0">
            <div className="text-gray-900 font-medium truncate max-w-[160px]">{b.bidder?.username}</div>
            <div className="text-[12px] text-gray-500 truncate max-w-[180px]">{b.bidder?.email}</div>
          </div>
        </div>
      ),
    },
    { id: "amount", header: "Bid", sortKey: "amount", align: "right", skeleton: sk.num(), cell: (b) => <span className="font-semibold text-gray-900">{formatMoney(b.amount)}</span> },
    {
      id: "vs",
      header: "vs. price",
      skeleton: sk.num("w-10"),
      align: "right",
      hideBelow: "xl",
      cell: (b) => {
        const p = Number(b.vehicle?.price);
        if (!p) return "—";
        const diff = ((Number(b.amount) - p) / p) * 100;
        return <span className={diff >= 0 ? "text-emerald-600" : "text-gray-500"}>{diff >= 0 ? "+" : ""}{diff.toFixed(0)}%</span>;
      },
    },
    { id: "message", header: "Message", hideBelow: "lg", skeleton: sk.text("w-40"), cell: (b) => <span className="text-gray-600 line-clamp-1 max-w-[260px]">{b.message || "—"}</span> },
    { id: "status", header: "Status", sortKey: "status", skeleton: sk.pill("w-20"), cell: (b) => <Pill tone={STATUS[b.status]?.tone}>{STATUS[b.status]?.label}</Pill> },
    { id: "created", header: "Placed", sortKey: "created_at", hideBelow: "lg", skeleton: sk.text("w-28"), cell: (b) => <span className="text-gray-500 whitespace-nowrap">{formatDate(b.created_at, true)}</span> },
  ];

  const exportColumns = [
    { id: "id", header: "ID" },
    { id: "vehicle", header: "Vehicle", exportValue: (b) => vLabel(b.vehicle) },
    { id: "vehicle_id", header: "Vehicle ID", exportValue: (b) => b.vehicle?.id },
    { id: "list_price", header: "List price", exportValue: (b) => Number(b.vehicle?.price) || "" },
    { id: "amount", header: "Bid amount", exportValue: (b) => Number(b.amount) },
    { id: "bidder", header: "Bidder", exportValue: (b) => b.bidder?.username },
    { id: "bidder_email", header: "Bidder email", exportValue: (b) => b.bidder?.email },
    { id: "message", header: "Message" },
    { id: "status", header: "Status", exportValue: (b) => STATUS[b.status]?.label },
    { id: "created_at", header: "Placed", exportValue: (b) => formatDate(b.created_at, true) },
  ];

  const rowMenu = (b) => [
    b.status !== "accepted" && { label: "Accept", icon: Check, onClick: () => setStatus.mutate({ id: b.id, status: "accepted" }) },
    b.status !== "rejected" && { label: "Reject", icon: X, onClick: () => setStatus.mutate({ id: b.id, status: "rejected" }) },
    b.status !== "pending" && { label: "Mark pending", icon: Clock, onClick: () => setStatus.mutate({ id: b.id, status: "pending" }) },
    { divider: true },
    { label: "Delete", icon: Trash2, danger: true, onClick: () => setConfirm({ ids: [b.id] }) },
  ];

  return (
    <>
      <PageHeader title="Bids" subtitle={list.data ? `${list.data.count.toLocaleString()} bids` : "Offers from buyers"}>
        <ExportMenu listFn={resources.bids.list} params={params} columns={exportColumns} filename="autoeden_bids" selectedRows={rows.filter((r) => selected.has(r.id))} total={list.data?.count || 0} />
      </PageHeader>
      <Card className="overflow-hidden">
        <Toolbar>
          <SearchInput value={state.search} onChange={(search) => update({ search })} placeholder="Search vehicle, bidder, message…" />
          <FilterSelect label="Status" value={state.status} onChange={(status) => update({ status })} options={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))} />
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
          rowMenu={rowMenu}
          mobileCard={(b) => (
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[14px] truncate">{vLabel(b.vehicle)}</span>
                <span className="font-semibold tabular-nums">{formatMoney(b.amount)}</span>
              </div>
              <div className="text-[12.5px] text-gray-500 mt-0.5">{b.bidder?.username} · {formatDate(b.created_at)}</div>
              <div className="mt-1.5"><Pill tone={STATUS[b.status]?.tone}>{STATUS[b.status]?.label}</Pill></div>
            </div>
          )}
          empty={<EmptyState icon={list.isError ? XCircle : Gavel} title={list.isError ? "Couldn't load bids" : "No bids found"} action={list.isError ? <Button onClick={() => list.refetch()}>Retry</Button> : null} />}
        />
        {(list.data?.count ?? 0) > 0 && (
          <Pagination page={state.page} pageSize={state.page_size} count={list.data.count} totalPages={list.data.total_pages} onPage={(page) => { clearSel(); update({ page }, { resetPage: false }); }} onPageSize={(page_size) => update({ page_size })} />
        )}
      </Card>

      <BulkBar count={selected.size} onClear={clearSel}>
        <BulkButton icon={Check} onClick={() => { bulkStatus.mutate({ ids: [...selected], status: "accepted" }); clearSel(); }}>Accept</BulkButton>
        <BulkButton icon={X} onClick={() => { bulkStatus.mutate({ ids: [...selected], status: "rejected" }); clearSel(); }}>Reject</BulkButton>
        <BulkButton icon={Trash2} danger onClick={() => setConfirm({ ids: [...selected] })}>Delete</BulkButton>
      </BulkBar>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.ids.length > 1 ? `Delete ${confirm.ids.length} bids?` : "Delete this bid?"}
        message="The bid is permanently removed. This can't be undone."
        onConfirm={() => {
          remove.mutate({ ids: confirm.ids });
          clearSel();
        }}
      />
    </>
  );
}
