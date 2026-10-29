import React, { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, Search, X } from "../../ui/icons";
import { toast } from "react-toastify";
import { Button, cx } from "./primitives";
import { Menu } from "./overlays";
import { exportRows, fetchAllRows } from "../lib/exporter";
import { errorMessage } from "../lib/adminApi";
import { useDebounced } from "../lib/useTableState";

export function Toolbar({ children, right }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2 px-4 py-3 border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">{children}</div>
      {right && <div className="flex items-center gap-2 flex-wrap">{right}</div>}
    </div>
  );
}

// Debounced search; "/" focuses it from anywhere on the page.
export function SearchInput({ value, onChange, placeholder = "Search…", className }) {
  const [text, setText] = useState(value || "");
  const debounced = useDebounced(text, 300);
  const ref = useRef(null);

  useEffect(() => {
    setText(value || "");
  }, [value]);
  useEffect(() => {
    if (debounced !== (value || "")) onChange(debounced);
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={cx("relative w-full sm:w-72", className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 pl-8 pr-8 rounded-lg border border-gray-200 bg-white text-[13px] placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-3 focus:ring-red-500/10"
      />
      {text ? (
        <button onClick={() => setText("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-700" aria-label="Clear search">
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <kbd className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 border border-gray-200 rounded px-1.5 py-px">/</kbd>
      )}
    </div>
  );
}

export function FilterSelect({ value, onChange, options, label, icon: Icon }) {
  const active = value !== "" && value !== undefined && value !== null;
  return (
    <label
      className={cx(
        "relative inline-flex items-center h-8 rounded-lg border text-[13px] transition-colors",
        active ? "border-red-200 bg-red-50/60 text-red-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 ml-2.5 -mr-1 opacity-70" />}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-full bg-transparent pl-2.5 pr-7 appearance-none focus:outline-none cursor-pointer font-medium"
        aria-label={label}
      >
        <option value="">{label}: All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label}: {o.label}
          </option>
        ))}
      </select>
      <svg className="absolute right-2 w-3.5 h-3.5 pointer-events-none opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </label>
  );
}

/**
 * Exports the selected rows, or every row matching the current filters (all pages).
 */
export function ExportMenu({ listFn, params, columns, filename, selectedRows = [], total = 0 }) {
  const [busy, setBusy] = useState(null);

  const run = async (format, scope) => {
    setBusy(format);
    const toastId = toast.loading(scope === "selected" ? "Preparing export…" : `Exporting ${total.toLocaleString()} rows…`);
    try {
      const { page, page_size, ...filters } = params;
      const rows = scope === "selected" ? selectedRows : await fetchAllRows(listFn, filters);
      exportRows(rows, columns, { filename, format });
      toast.update(toastId, { render: `Exported ${rows.length.toLocaleString()} rows`, type: "success", isLoading: false, autoClose: 2500 });
    } catch (err) {
      toast.update(toastId, { render: `Export failed — ${errorMessage(err)}`, type: "error", isLoading: false, autoClose: 5000 });
    } finally {
      setBusy(null);
    }
  };

  const hasSel = selectedRows.length > 0;
  return (
    <Menu
      trigger={
        <Button icon={busy ? Loader2 : Download} className={busy ? "[&>svg]:animate-spin" : ""}>
          Export
        </Button>
      }
      items={[
        hasSel && { label: `Selected (${selectedRows.length}) · Excel`, icon: FileSpreadsheet, onClick: () => run("xlsx", "selected") },
        hasSel && { label: `Selected (${selectedRows.length}) · CSV`, icon: FileText, onClick: () => run("csv", "selected") },
        hasSel && { divider: true },
        { label: "All matching · Excel", hint: total.toLocaleString(), icon: FileSpreadsheet, onClick: () => run("xlsx", "all"), disabled: !total },
        { label: "All matching · CSV", hint: total.toLocaleString(), icon: FileText, onClick: () => run("csv", "all"), disabled: !total },
      ]}
    />
  );
}
