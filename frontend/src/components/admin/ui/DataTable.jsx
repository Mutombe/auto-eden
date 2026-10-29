import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, X,
} from "../../ui/icons";
import { Button, Checkbox, cx, Skeleton } from "./primitives";
import { Menu } from "./overlays";
import { rowKey } from "../lib/optimistic";
import { useProgressiveReveal } from "../../../lib/progressive";

// Skeleton shapes for columns, so loading rows match the real cells' footprint.
// Usage on a column: { skeleton: sk.media("w-14 h-10") } — default is a single text line.
export const sk = {
  text: (w = "w-20") => () => <Skeleton className={cx("h-3.5", w)} />,
  num: (w = "w-16") => () => <Skeleton className={cx("h-3.5 ml-auto", w)} />,
  pill: (w = "w-24") => () => <Skeleton className={cx("h-5 rounded-full", w)} />,
  toggle: () => () => <Skeleton className="h-5 w-9 rounded-full" />,
  media: (thumb = "w-14 h-10") => () => (
    <div className="flex items-center gap-3">
      <Skeleton className={cx("rounded-md shrink-0", thumb)} />
      <div className="space-y-1.5 flex-1"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-3 w-24" /></div>
    </div>
  ),
  person: (size = 24, lines = 2) => () => (
    <div className="flex items-center gap-2">
      <Skeleton className="rounded-full shrink-0" style={{ width: size, height: size }} />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-24" />
        {lines > 1 && <Skeleton className="h-3 w-32" />}
      </div>
    </div>
  ),
  lines: (w1 = "w-20", w2 = "w-12", right = false) => () => (
    <div className={cx("space-y-1.5", right && "flex flex-col items-end")}><Skeleton className={cx("h-3.5", w1)} /><Skeleton className={cx("h-3", w2)} /></div>
  ),
};
const defaultSkeleton = (i) => <Skeleton className={cx("h-3.5", i === 0 ? "w-40" : i % 2 ? "w-20" : "w-16")} />;

// Small status chip shown on rows with a request in flight. Positioned over the menu cell so
// it never changes column widths.
function FlightChip({ children }) {
  return (
    <span className="absolute right-2 top-1/2 -translate-y-1/2 z-[1] inline-flex items-center gap-1.5 h-6 pl-2 pr-2.5 rounded-full bg-white/95 ring-1 ring-gray-200 shadow-xs text-[11.5px] font-medium text-gray-600 whitespace-nowrap">
      <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
      {children}
    </span>
  );
}

/**
 * Column: { id, header, cell(row), skeleton(), width, align, sortKey, hideBelow: "lg"|"xl", className }
 * Rows may carry __temp (being created) / __pending (change in flight).
 */
export function DataTable({
  columns,
  rows,
  isLoading,
  isFetching,
  ordering,
  onSort,
  selected,
  onSelect,
  onRowClick,
  onRowHover,
  rowMenu,
  mobileCard,
  empty,
  skeletonRows = 10,
}) {
  const selectable = !!onSelect;
  const realRows = rows.filter((r) => !r.__temp);
  const allSelected = selectable && realRows.length > 0 && realRows.every((r) => selected.has(r.id));
  const someSelected = selectable && realRows.some((r) => selected.has(r.id));

  // Chronological rendering: on first load, real rows replace skeleton rows top to bottom.
  const revealed = useProgressiveReveal(rows.length, !isLoading);

  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) realRows.forEach((r) => next.delete(r.id));
    else realRows.forEach((r) => next.add(r.id));
    onSelect(next);
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelect(next);
  };

  const hide = (c) => (c.hideBelow === "xl" ? "hidden xl:table-cell" : c.hideBelow === "lg" ? "hidden lg:table-cell" : "");
  const sortState = (c) => {
    if (!c.sortKey) return null;
    if (ordering === c.sortKey) return "asc";
    if (ordering === `-${c.sortKey}`) return "desc";
    return "none";
  };
  // Creating: soft shimmer sweep; Saving: dimmed while the server confirms.
  const rowState = (row) =>
    row.__temp ? "shimmer opacity-70 pointer-events-none" : row.__pending ? "opacity-60" : "";
  const flight = (row) => (row.__temp ? <FlightChip>Creating…</FlightChip> : row.__pending ? <FlightChip>Saving…</FlightChip> : null);

  // Same cells, paddings and shapes as a real row, so swapping content in moves nothing.
  const skeletonRow = (key) => (
    <tr key={key} aria-hidden="true">
      {selectable && <td className="pl-4 pr-1 py-2 border-b border-gray-100"><Skeleton className="w-4 h-4" /></td>}
      {columns.map((c, j) => (
        <td key={c.id} className={cx("px-3 py-2 border-b border-gray-100 h-[49px]", c.align === "right" && "text-right", hide(c))}>
          {c.skeleton ? c.skeleton() : defaultSkeleton(j)}
        </td>
      ))}
      {rowMenu && <td className="pr-3 py-2 border-b border-gray-100" />}
    </tr>
  );
  const skeletonCard = (key) => (
    <div key={key} aria-hidden="true" className="p-4 flex gap-3">
      {selectable && <Skeleton className="w-4 h-4 mt-1" />}
      <Skeleton className="w-20 h-14 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Background-refresh bar: data stays visible while the next page/filter loads */}
      <div className={cx("absolute top-0 left-0 right-0 h-0.5 z-20 overflow-hidden transition-opacity", isFetching && !isLoading ? "opacity-100" : "opacity-0")}>
        <div className="h-full w-1/3 bg-red-500 animate-[tableProgress_1s_ease-in-out_infinite]" />
      </div>

      {/* ---------- Desktop / tablet table ---------- */}
      <div className="hidden md:block overflow-x-auto" aria-busy={isLoading || undefined}>
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr>
              {selectable && (
                <th className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-200 w-10 pl-4 pr-1 py-2.5">
                  <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} label="Select all" />
                </th>
              )}
              {columns.map((c) => {
                const s = sortState(c);
                return (
                  <th
                    key={c.id}
                    style={{ width: c.width }}
                    className={cx(
                      "sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-200 px-3 py-2.5 text-[11.5px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap",
                      c.align === "right" && "text-right",
                      hide(c)
                    )}
                  >
                    {c.sortKey ? (
                      <button
                        onClick={() => onSort(s === "desc" ? c.sortKey : `-${c.sortKey}`)}
                        className={cx("inline-flex items-center gap-1 hover:text-gray-900 transition-colors uppercase", s !== "none" && "text-gray-900")}
                      >
                        {c.header}
                        {s === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : s === "desc" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowMenu && <th className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-200 w-12 pr-3" />}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => skeletonRow(`sk${i}`))
            ) : (
              <AnimatePresence initial={false}>
                {rows.map((row, i) => {
                  if (i >= revealed) return skeletonRow(`sk-${rowKey(row)}`);
                  const isSel = selectable && selected.has(row.id);
                  return (
                    <motion.tr
                      key={rowKey(row)}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                      exit={{ opacity: 0, scale: 0.985, transition: { duration: 0.18 } }}
                      onClick={() => !row.__temp && onRowClick?.(row)}
                      onMouseEnter={() => !row.__temp && onRowHover?.(row)}
                      className={cx(
                        "group transition-[background-color,opacity] duration-200",
                        onRowClick && "cursor-pointer",
                        isSel ? "bg-red-50/50" : "hover:bg-gray-50/80",
                        rowState(row)
                      )}
                    >
                      {selectable && (
                        <td className="pl-4 pr-1 py-2 border-b border-gray-100">
                          {row.__temp ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <Checkbox checked={isSel} onChange={() => toggleOne(row.id)} label="Select row" />
                          )}
                        </td>
                      )}
                      {columns.map((c) => (
                        <td
                          key={c.id}
                          className={cx(
                            "px-3 py-2 border-b border-gray-100 text-[13px] text-gray-700 align-middle h-[49px]",
                            c.align === "right" && "text-right tabular-nums",
                            hide(c),
                            c.className
                          )}
                        >
                          {c.cell ? c.cell(row) : row[c.id] ?? "—"}
                        </td>
                      ))}
                      {rowMenu && (
                        <td className="relative pr-3 py-2 border-b border-gray-100 text-right" onClick={(e) => e.stopPropagation()}>
                          {flight(row) || <Menu items={rowMenu(row)} />}
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Mobile cards ---------- */}
      <div className="md:hidden divide-y divide-gray-100" aria-busy={isLoading || undefined}>
        {isLoading
          ? Array.from({ length: Math.min(skeletonRows, 6) }).map((_, i) => skeletonCard(`sk${i}`))
          : (
            <AnimatePresence initial={false}>
              {rows.map((row, i) => i >= revealed ? skeletonCard(`sk-${rowKey(row)}`) : (
                <motion.div
                  key={rowKey(row)}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => !row.__temp && onRowClick?.(row)}
                  className={cx("relative flex items-start gap-3 p-4 active:bg-gray-50", rowState(row), selectable && selected.has(row.id) && "bg-red-50/50")}
                >
                  {selectable && (
                    <div className="pt-1">
                      {row.__temp ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <Checkbox checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} label="Select row" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">{mobileCard(row)}</div>
                  {rowMenu && (
                    <div className="relative self-stretch flex items-start" onClick={(e) => e.stopPropagation()}>
                      {flight(row) ? <div className="relative w-24 h-8">{flight(row)}</div> : <Menu items={rowMenu(row)} />}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
      </div>

      {!isLoading && rows.length === 0 && empty}
    </div>
  );
}

export function Pagination({ page, pageSize, count, totalPages, onPage, onPageSize }) {
  const pages = totalPages || Math.max(1, Math.ceil(count / pageSize));
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);

  const numbers = [];
  const add = (n) => numbers.push(n);
  if (pages <= 7) for (let n = 1; n <= pages; n++) add(n);
  else {
    add(1);
    if (page > 3) add("…l");
    for (let n = Math.max(2, page - 1); n <= Math.min(pages - 1, page + 1); n++) add(n);
    if (page < pages - 2) add("…r");
    add(pages);
  }

  const nav = "h-8 min-w-8 px-2 inline-flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors disabled:opacity-35 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white rounded-b-xl">
      <div className="flex items-center gap-3 text-[13px] text-gray-500">
        <span className="tabular-nums">
          <span className="font-medium text-gray-900">{from}–{to}</span> of <span className="font-medium text-gray-900">{count.toLocaleString()}</span>
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <label className="flex items-center gap-1.5">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-[13px] text-gray-900 focus:outline-none focus:border-red-400"
          >
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button className={cx(nav, "hidden sm:inline-flex text-gray-500 hover:bg-gray-100")} disabled={page <= 1} onClick={() => onPage(1)} aria-label="First page"><ChevronsLeft className="w-4 h-4" /></button>
        <button className={cx(nav, "text-gray-500 hover:bg-gray-100")} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
        {numbers.map((n) =>
          typeof n === "string" ? (
            <span key={n} className="px-1 text-gray-400 text-[13px]">…</span>
          ) : (
            <button
              key={n}
              onClick={() => onPage(n)}
              className={cx(nav, "tabular-nums", n === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100")}
            >
              {n}
            </button>
          )
        )}
        <button className={cx(nav, "text-gray-500 hover:bg-gray-100")} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
        <button className={cx(nav, "hidden sm:inline-flex text-gray-500 hover:bg-gray-100")} disabled={page >= pages} onClick={() => onPage(pages)} aria-label="Last page"><ChevronsRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// Floats over the table when rows are selected (docks to the bottom on phones).
export function BulkBar({ count, onClear, children }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
          className="fixed z-[800] bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto max-w-3xl"
        >
          <div className="flex items-center gap-2 bg-gray-900 text-white rounded-xl shadow-2xl shadow-gray-900/30 pl-4 pr-2 py-2 overflow-x-auto no-scrollbar">
            <span className="text-[13px] font-medium whitespace-nowrap tabular-nums">{count} selected</span>
            <button onClick={onClear} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10" aria-label="Clear selection">
              <X className="w-4 h-4" />
            </button>
            <span className="w-px h-5 bg-white/15 mx-1" />
            <div className="flex items-center gap-1">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const BulkButton = ({ icon: Icon, children, danger, ...props }) => (
  <button
    className={cx(
      "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
      danger ? "text-red-300 hover:bg-red-500/20 hover:text-red-200" : "text-gray-200 hover:bg-white/10 hover:text-white"
    )}
    {...props}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);
