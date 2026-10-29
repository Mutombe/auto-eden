// Table state (page, page size, search, sort, filters) lives in the URL, so views are
// shareable, survive refresh, and the back button works.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useTableState(defaults = {}) {
  const [params, setParams] = useSearchParams();
  const base = useMemo(() => ({ page: 1, page_size: 25, search: "", ordering: "", ...defaults }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const state = useMemo(() => {
    const out = { ...base };
    for (const key of Object.keys(base)) {
      if (params.has(key)) out[key] = params.get(key);
    }
    for (const [k, v] of params.entries()) if (!(k in out)) out[k] = v;
    out.page = Number(out.page) || 1;
    out.page_size = Number(out.page_size) || 25;
    return out;
  }, [params, base]);

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const merged = { ...(resetPage ? { page: 1 } : {}), ...patch };
          for (const [k, v] of Object.entries(merged)) {
            if (v === "" || v === null || v === undefined || String(v) === String(base[k] ?? "")) next.delete(k);
            else next.set(k, String(v));
          }
          return next;
        },
        { replace: true }
      );
    },
    [setParams, base]
  );

  return [state, update];
}

export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const timeAgo = (value) => {
  if (!value) return "Never";
  const s = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(value);
};
