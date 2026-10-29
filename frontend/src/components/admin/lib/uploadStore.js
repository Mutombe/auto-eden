// Tracks background photo uploads per vehicle so table rows and the drawer can show
// "Uploading 3/8" while the admin keeps working.
import { useSyncExternalStore } from "react";

let state = {};
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const uploadStore = {
  start(vehicleId, total) {
    state = { ...state, [vehicleId]: { total, done: 0, failed: 0 } };
    emit();
  },
  tick(vehicleId, ok) {
    const cur = state[vehicleId];
    if (!cur) return;
    state = {
      ...state,
      [vehicleId]: { ...cur, done: cur.done + (ok ? 1 : 0), failed: cur.failed + (ok ? 0 : 1) },
    };
    emit();
  },
  finish(vehicleId) {
    const { [vehicleId]: _, ...rest } = state;
    state = rest;
    emit();
  },
  move(fromId, toId) {
    if (!state[fromId]) return;
    const { [fromId]: entry, ...rest } = state;
    state = { ...rest, [toId]: entry };
    emit();
  },
};

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useUpload(vehicleId) {
  return useSyncExternalStore(subscribe, () => state[vehicleId]);
}
