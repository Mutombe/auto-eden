// "Saved for later" cars. Works signed in or not: the list lives in this browser's
// localStorage, so it survives reloads and restarts, and stays in sync across open tabs.
// Each entry keeps a small snapshot of the card, so the Saved page renders without a request.
import { useSyncExternalStore } from "react";

const KEY = "ae_saved_cars_v1";
const listeners = new Set();
let cache = load();

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function commit(next) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode / full storage: keep it for this visit at least.
  }
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      cache = load();
      listeners.forEach((l) => l());
    }
  });
}

const subscribe = (l) => (listeners.add(l), () => listeners.delete(l));
const snapshot = () => cache;

const SNAPSHOT_FIELDS = [
  "id", "make", "model", "year", "price", "proposed_price", "listing_type", "mileage", "fuel_type",
  "transmission", "body_type", "location", "verification_state",
];

export const isSaved = (id) => cache.some((v) => String(v.id) === String(id));

export function toggleSaved(vehicle) {
  if (isSaved(vehicle.id)) {
    commit(cache.filter((v) => String(v.id) !== String(vehicle.id)));
    return false;
  }
  const entry = Object.fromEntries(SNAPSHOT_FIELDS.map((k) => [k, vehicle[k] ?? null]));
  entry.main_image = vehicle.main_image || vehicle.images?.find((i) => i.id !== "main")?.image || vehicle.images?.[0]?.image || null;
  entry.saved_at = new Date().toISOString();
  commit([entry, ...cache]);
  return true;
}

export const removeSaved = (id) => commit(cache.filter((v) => String(v.id) !== String(id)));
export const clearSaved = () => commit([]);

/** The saved list, newest first. Re-renders when anything is saved or removed (any tab). */
export function useSaved() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
