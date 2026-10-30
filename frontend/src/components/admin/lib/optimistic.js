// Optimistic CRUD on top of TanStack Query.
//
// Every mutation: cancel in-flight refetches -> snapshot every cached page of the
// resource -> patch the cache instantly -> on error restore the snapshot + error toast,
// on success settle the row with the server's version + success toast -> refetch.
// Rows carry two transient flags the table renders:
//   __temp    : placeholder for a record being created (faded, not selectable/actionable)
//   __pending : existing record with a change in flight (faded until confirmed)
import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { errorMessage } from "./adminApi";
import { whenIdle } from "../../../lib/progressive";

export const keys = {
  all: (resource) => ["admin", resource],
  lists: (resource) => ["admin", resource, "list"],
  list: (resource, params) => ["admin", resource, "list", params],
  detail: (resource, id) => ["admin", resource, "detail", id],
  summary: (resource) => ["admin", resource, "summary"],
};

// Previous page stays on screen while the next one loads: no blank flashes when paging/filtering.
// While the user reads a page, the next one is fetched in idle time so "Next" is instant.
export function useList(resource, listFn, params) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: keys.list(resource, params),
    queryFn: () => listFn(params),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });
  const hasNext = !!query.data?.next;
  const settled = !query.isPlaceholderData && !query.isFetching;
  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    if (!hasNext || !settled) return;
    const next = { ...params, page: (params.page || 1) + 1 };
    return whenIdle(() => prefetchList(qc, resource, listFn, next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNext, settled, paramsKey, resource]);
  return query;
}

// Warm a list page (next page, or the tab under the cursor) without touching the screen.
export function prefetchList(qc, resource, listFn, params) {
  return qc.prefetchQuery({ queryKey: keys.list(resource, params), queryFn: () => listFn(params), staleTime: 20_000 });
}

// ---- cache patch helpers (operate on every cached page of a resource) ----
const updatePages = (qc, resource, fn) =>
  qc.setQueriesData({ queryKey: keys.lists(resource) }, (old) => (old?.results ? fn(old) : old));

export function patchRows(qc, resource, ids, patch) {
  const set = new Set(ids);
  updatePages(qc, resource, (old) => ({
    ...old,
    results: old.results.map((row) =>
      set.has(row.id) ? { ...row, ...(typeof patch === "function" ? patch(row) : patch) } : row
    ),
  }));
  ids.forEach((id) =>
    qc.setQueryData(keys.detail(resource, id), (old) =>
      old ? { ...old, ...(typeof patch === "function" ? patch(old) : patch) } : old
    )
  );
}

export function removeRows(qc, resource, ids) {
  const set = new Set(ids);
  updatePages(qc, resource, (old) => {
    const results = old.results.filter((row) => !set.has(row.id));
    return { ...old, results, count: Math.max(0, old.count - (old.results.length - results.length)) };
  });
}

export function prependRow(qc, resource, row) {
  updatePages(qc, resource, (old) =>
    (old.current_page ?? 1) === 1
      ? { ...old, results: [row, ...old.results], count: old.count + 1 }
      : { ...old, count: old.count + 1 }
  );
}

// Once a temp row settles, its real id keeps the temp React key so the row
// updates in place instead of animating out and back in (also across refetches).
const keyAlias = new Map();
export const rowKey = (row) => keyAlias.get(row.id) ?? row.id;

export function replaceRow(qc, resource, id, row) {
  if (id !== row.id) keyAlias.set(row.id, id);
  updatePages(qc, resource, (old) => ({
    ...old,
    results: old.results.map((r) => (r.id === id ? row : r)),
  }));
  qc.setQueryData(keys.detail(resource, row.id), row);
}

export const tempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * useOptimisticMutation({
 *   resource,                    // cache namespace, e.g. "vehicles"
 *   mutationFn,                  // (vars) => Promise
 *   apply(qc, vars, ctx),        // optimistic cache change; may stash values on ctx
 *   settle(qc, data, vars, ctx), // replace placeholder/pending rows with the server's version
 *   success,                     // string | (data, vars) => string  (toast)
 *   failure,                     // string | (vars) => string        (toast prefix)
 *   also: ["stats", ...],        // other namespaces to refresh afterwards
 * })
 */
export function useOptimisticMutation({ resource, mutationFn, apply, settle, success, failure, also = [] }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: keys.all(resource) });
      const ctx = { snapshot: qc.getQueriesData({ queryKey: keys.all(resource) }) };
      apply?.(qc, vars, ctx);
      return ctx;
    },
    onError: (err, vars, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
      const prefix = typeof failure === "function" ? failure(vars) : failure;
      toast.error(prefix ? `${prefix} — ${errorMessage(err)}` : errorMessage(err));
    },
    onSuccess: (data, vars, ctx) => {
      settle?.(qc, data, vars, ctx);
      const message = typeof success === "function" ? success(data, vars) : success;
      if (message) toast.success(message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.all(resource) });
      also.forEach((r) => qc.invalidateQueries({ queryKey: keys.all(r) }));
      qc.invalidateQueries({ queryKey: keys.all("stats") });
      // The public pages (marketplace, car pages) share this cache; don't let them show
      // what the admin just changed for another minute.
      qc.invalidateQueries({ queryKey: ["public"] });
    },
  });
}
