// Public (marketplace) data layer on TanStack Query.
//
// - Page-aware: only the current page is fetched; the next page is prefetched when idle.
// - Keep previous data: filtering/paging never blanks the grid; skeletons only on first paint.
// - Predictive: hovering/touching a card prefetches that vehicle and the detail page code.
// - Detail pages render instantly from the card data already in cache, then fill in.
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "../utils/api";
import { queryClient } from "./queryClient";
import { whenIdle } from "./progressive";

export const MARKETPLACE_PAGE_SIZE = 12;

// Canonical backend params: drop empties so equivalent filters share one cache entry
// (the homepage and the marketplace's default view reuse the same page-1 response).
export function marketplaceParams(f = {}) {
  const p = {
    page: f.page || 1,
    page_size: f.page_size || MARKETPLACE_PAGE_SIZE,
    min_price: f.minPrice ?? f.min_price,
    max_price: f.maxPrice ?? f.max_price,
    make: f.make,
    year: f.year,
    body_type: f.bodyType ?? f.body_type,
    fuel_type: f.fuelType ?? f.fuel_type,
    transmission: f.transmission,
    search_term: f.searchTerm ?? f.search_term,
    sort_by: (f.sortBy ?? f.sort_by) === "newest" ? undefined : f.sortBy ?? f.sort_by,
  };
  return Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

const marketplaceKey = (params) => ["public", "marketplace", params];
export const vehicleKey = (id) => ["public", "vehicle", String(id)];

const fetchMarketplace = (params) => api.get("/core/marketplace/", { params, skipAuth: true }).then((r) => r.data);
const fetchVehicle = (id) => api.get(`/core/all-vehicles/${id}/`, { skipAuth: true }).then((r) => r.data);

export function useMarketplace(filters) {
  const qc = useQueryClient();
  const params = marketplaceParams(filters);
  const query = useQuery({
    queryKey: marketplaceKey(params),
    queryFn: () => fetchMarketplace(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  // While the user reads this page, quietly fetch the next one so "Next" is instant.
  const hasNext = !!query.data?.next;
  const page = params.page;
  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    if (!hasNext || query.isPlaceholderData) return;
    const next = { ...params, page: page + 1 };
    return whenIdle(() => qc.prefetchQuery({ queryKey: marketplaceKey(next), queryFn: () => fetchMarketplace(next), staleTime: 60_000 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNext, paramsKey, query.isPlaceholderData, qc]);

  return query;
}

// The marketplace card already holds title, price, mileage, photo… use it as the first paint.
function cardFromCache(id) {
  for (const [, data] of queryClient.getQueriesData({ queryKey: ["public", "marketplace"] })) {
    const hit = data?.results?.find((v) => String(v.id) === String(id));
    if (hit) return { ...hit, images: hit.main_image ? [{ id: "main", image: hit.main_image }] : [], __partial: true };
  }
  return undefined;
}

export function useVehicle(id) {
  return useQuery({
    queryKey: vehicleKey(id),
    queryFn: () => fetchVehicle(id),
    placeholderData: () => cardFromCache(id),
    staleTime: 60_000,
    enabled: !!id,
    // A 404 means the car is gone. Anything else (the free-tier backend waking up, a dropped
    // connection) is worth a few more tries before we give up.
    retry: (count, err) => err?.response?.status !== 404 && count < 4,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 10_000),
  });
}

const loadDetailChunk = () => import("../components/marketplace/vehicleDetails");

export function prefetchVehicle(id) {
  loadDetailChunk();
  queryClient.prefetchQuery({ queryKey: vehicleKey(id), queryFn: () => fetchVehicle(id), staleTime: 60_000 });
}
