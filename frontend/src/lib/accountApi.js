// Signed-in user's own data (dashboard + profile) on TanStack Query, with the same optimistic
// CRUD helpers as the admin console: every change shows instantly and rolls back on error.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import { keys, patchRows, prependRow, removeRows, replaceRow, tempId, useList, useOptimisticMutation } from "../components/admin/lib/optimistic";
import { resources } from "../components/admin/lib/adminApi";
import { usePhotoUploader, vehicleLabel } from "../components/admin/pages/vehicles/useVehicleMutations";
import { updateUser } from "../redux/slices/authSlice";

// Owners rarely have more than a handful of records, so one page of 100 covers everything
// and lets the dashboard count, filter and sort locally.
const ALL = { page_size: 100 };
const list = (url) => () => api.get(url, { params: ALL }).then((r) => (Array.isArray(r.data) ? { results: r.data, count: r.data.length } : r.data));

export const ME = {
  vehicles: "me-vehicles",
  bids: "me-bids",
  offers: "me-offers",
  searches: "me-searches",
};

const fetchers = {
  [ME.vehicles]: list("/core/vehicles/my_vehicles/"),
  [ME.bids]: list("/core/bids/my_bids/"),
  [ME.offers]: list("/core/bids/received/"),
  [ME.searches]: list("/core/vehicle-searches/"),
};

export function useMine(resource) {
  const q = useList(resource, fetchers[resource], ALL);
  return { ...q, rows: q.data?.results || [] };
}

// Warm every section while the user reads the first one, so switching tabs never waits.
export function prefetchMine(qc) {
  Object.entries(fetchers).forEach(([resource, fn]) =>
    qc.prefetchQuery({ queryKey: keys.list(resource, ALL), queryFn: fn, staleTime: 20_000 })
  );
}

// ---------- vehicles ----------
export function useMyVehicleMutations() {
  const me = useSelector((s) => s.auth.user);
  const uploadPhotos = usePhotoUploader(ME.vehicles);
  const R = ME.vehicles;

  const localImages = (previews) => (previews || []).map((url, i) => ({ id: `local-${i}`, image: url, __local: true }));

  const create = useOptimisticMutation({
    resource: R,
    mutationFn: ({ data }) => resources.vehicles.create(data),
    apply: (qc, { data, previews }, ctx) => {
      ctx.tempId = tempId();
      prependRow(qc, R, {
        ...data,
        id: ctx.tempId,
        owner: { username: me?.username },
        verification_state: "pending",
        is_visible: true,
        created_at: new Date().toISOString(),
        images: localImages(previews),
        __temp: true,
      });
    },
    settle: (qc, vehicle, { files, previews }, ctx) => {
      replaceRow(qc, R, ctx.tempId, { ...vehicle, images: localImages(previews) });
      uploadPhotos(vehicle, files);
    },
    success: (v) => `${vehicleLabel(v)} submitted for review`,
    failure: ({ data }) => `Couldn't submit ${vehicleLabel(data)}`,
  });

  const update = useOptimisticMutation({
    resource: R,
    mutationFn: async ({ id, data, removedImageIds = [] }) => {
      await Promise.all(removedImageIds.map((imageId) => resources.vehicles.deleteImage(id, imageId)));
      return resources.vehicles.update(id, data);
    },
    apply: (qc, { id, data, removedImageIds = [] }) =>
      patchRows(qc, R, [id], (row) => ({
        ...data,
        images: (row.images || []).filter((img) => !removedImageIds.includes(img.id)),
        __pending: true,
      })),
    settle: (qc, vehicle, { files }) => {
      replaceRow(qc, R, vehicle.id, vehicle);
      uploadPhotos(vehicle, files);
    },
    success: (v) => `${vehicleLabel(v)} saved`,
    failure: "Couldn't save your changes",
  });

  const toggleVisibility = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id }) => resources.vehicles.toggleVisibility(id),
    apply: (qc, { id, visible }) => patchRows(qc, R, [id], { is_visible: visible, __pending: true }),
    settle: (qc, vehicle) => replaceRow(qc, R, vehicle.id, vehicle),
    success: (v) => (v.is_visible ? `${vehicleLabel(v)} is showing on the marketplace` : `${vehicleLabel(v)} is hidden from the marketplace`),
    failure: "Couldn't change visibility",
  });

  const remove = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id }) => resources.vehicles.remove(id),
    apply: (qc, { id }) => removeRows(qc, R, [id]),
    success: (_, { label }) => `${label} deleted`,
    failure: ({ label }) => `Couldn't delete ${label}`,
    also: [ME.offers],
  });

  return { create, update, toggleVisibility, remove };
}

// ---------- bids I placed ----------
export function useWithdrawBid() {
  return useOptimisticMutation({
    resource: ME.bids,
    mutationFn: ({ id }) => api.delete(`/core/bids/${id}/`),
    apply: (qc, { id }) => removeRows(qc, ME.bids, [id]),
    success: "Offer withdrawn",
    failure: "Couldn't withdraw the offer",
  });
}

// ---------- saved searches ----------
export function useSearchMutations() {
  const R = ME.searches;
  const create = useOptimisticMutation({
    resource: R,
    mutationFn: (data) => api.post("/core/vehicle-searches/", data).then((r) => r.data),
    apply: (qc, data, ctx) => {
      ctx.tempId = tempId();
      prependRow(qc, R, { ...data, id: ctx.tempId, status: "active", match_count: 0, created_at: new Date().toISOString(), __temp: true });
    },
    settle: (qc, search, _, ctx) => replaceRow(qc, R, ctx.tempId, search),
    success: "Search saved. We'll email you when a match is listed",
    failure: "Couldn't save the search",
  });
  const setActive = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id, active }) => api.post(`/core/vehicle-searches/${id}/${active ? "activate" : "pause"}/`),
    apply: (qc, { id, active }) => patchRows(qc, R, [id], { status: active ? "active" : "paused", __pending: true }),
    success: (_, { active }) => (active ? "Alerts resumed" : "Alerts paused"),
    failure: "Couldn't update the search",
  });
  const remove = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id }) => api.delete(`/core/vehicle-searches/${id}/`),
    apply: (qc, { id }) => removeRows(qc, R, [id]),
    success: "Saved search deleted",
    failure: "Couldn't delete the search",
  });
  return { create, setActive, remove };
}

// ---------- profile ----------
const PROFILE_KEY = ["me", "profile"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => api.get("/core/profile/").then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  return {
    async save({ fields, photo }) {
      const previous = qc.getQueryData(PROFILE_KEY);
      // Show the new details (and photo) straight away.
      qc.setQueryData(PROFILE_KEY, (old) => ({ ...old, ...fields, ...(photo ? { profile_picture: URL.createObjectURL(photo) } : {}) }));
      const body = new FormData();
      Object.entries(fields).forEach(([k, v]) => body.append(k, v ?? ""));
      if (photo) body.append("profile_picture", photo);
      try {
        const { data } = await api.put("/core/profile/", body, { headers: { "Content-Type": "multipart/form-data" } });
        qc.setQueryData(PROFILE_KEY, data);
        if (fields.username) dispatch(updateUser({ username: data.username }));
        return data;
      } catch (err) {
        qc.setQueryData(PROFILE_KEY, previous);
        throw err;
      }
    },
  };
}
