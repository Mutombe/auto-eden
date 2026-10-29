// All vehicle writes, optimistic. Photos upload after the record exists, compressed,
// three at a time, one request each — the row shows live progress meanwhile.
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { resources, errorMessage } from "../../lib/adminApi";
import { compressImage, runPool } from "../../lib/compressImage";
import { keys, patchRows, prependRow, removeRows, replaceRow, tempId, useOptimisticMutation } from "../../lib/optimistic";
import { uploadStore } from "../../lib/uploadStore";

const R = "vehicles";
const api = resources.vehicles;

const STATE_FLAGS = {
  digital: { is_digitally_verified: true },
  physical: { is_physically_verified: true },
  rejected: { is_rejected: true },
};

export const vehicleLabel = (v) => [v?.year, v?.make, v?.model].filter(Boolean).join(" ") || "Vehicle";

// Shared with the seller dashboard, which caches its own vehicles under another resource name.
export function usePhotoUploader(resource = R) {
  const qc = useQueryClient();
  return async function uploadPhotos(vehicle, files) {
    if (!files?.length) return;
    const id = vehicle.id;
    uploadStore.start(id, files.length);
    const results = await runPool(files, 3, async (file) => {
      const compressed = await compressImage(file);
      const image = await api.uploadImage(id, compressed);
      uploadStore.tick(id, true);
      // Each landed photo replaces one local preview, so thumbnails never blank out
      patchRows(qc, resource, [id], (row) => {
        const imgs = row.images || [];
        const locals = imgs.filter((i) => i.__local);
        return { images: [...imgs.filter((i) => !i.__local), image, ...locals.slice(1)] };
      });
      return image;
    }).then((res) => {
      res.forEach((r) => !r.ok && uploadStore.tick(id, false));
      return res;
    });
    uploadStore.finish(id);
    const failed = results.filter((r) => !r.ok);
    if (failed.length) {
      toast.error(
        `${failed.length} of ${files.length} photos for ${vehicleLabel(vehicle)} failed to upload — ${errorMessage(failed[0].error)}. Open Edit to retry.`,
        { autoClose: 8000 }
      );
    } else {
      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded for ${vehicleLabel(vehicle)}`);
    }
    qc.invalidateQueries({ queryKey: keys.all(resource) });
  };
}

export function useVehicleMutations({ onCreateFailed } = {}) {
  const me = useSelector((s) => s.auth.user);
  const uploadPhotos = usePhotoUploader();

  const create = useOptimisticMutation({
    resource: R,
    mutationFn: ({ data }) => api.create(data),
    apply: (qc, { data, previews }, ctx) => {
      ctx.tempId = tempId();
      prependRow(qc, R, {
        ...data,
        id: ctx.tempId,
        owner: { username: me?.username, email: me?.email },
        verification_state: data.verification_state || "pending",
        is_visible: true,
        created_at: new Date().toISOString(),
        images: (previews || []).map((url, i) => ({ id: `local-${i}`, image: url, __local: true })),
        __temp: true,
      });
    },
    settle: (qc, vehicle, { files, previews }, ctx) => {
      replaceRow(qc, R, ctx.tempId, {
        ...vehicle,
        images: (previews || []).map((url, i) => ({ id: `local-${i}`, image: url, __local: true })),
      });
      uploadPhotos(vehicle, files);
    },
    success: (v) => `${vehicleLabel(v)} added`,
    failure: (vars) => {
      onCreateFailed?.(vars);
      return `Couldn't add ${vehicleLabel(vars.data)}`;
    },
  });

  const update = useOptimisticMutation({
    resource: R,
    mutationFn: async ({ id, data, removedImageIds = [] }) => {
      await Promise.all(removedImageIds.map((imageId) => api.deleteImage(id, imageId)));
      return api.update(id, data);
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
    failure: "Couldn't save changes",
  });

  // Single-vehicle status change via the verify endpoint (sends notification emails).
  const setStatus = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id, state, reason }) =>
      api.verify(id, { ...STATE_FLAGS[state], ...(state === "rejected" ? { rejection_reason: reason } : {}) }),
    apply: (qc, { id, state, reason }) =>
      patchRows(qc, R, [id], {
        verification_state: state,
        ...(state === "rejected" ? { rejection_reason: reason } : {}),
        __pending: true,
      }),
    settle: (qc, vehicle) => replaceRow(qc, R, vehicle.id, vehicle),
    success: (v) =>
      v.verification_state === "rejected" ? `${vehicleLabel(v)} rejected` : `${vehicleLabel(v)} marked ${v.verification_state === "physical" ? "physically" : "digitally"} verified`,
    failure: "Status change failed",
  });

  const toggleVisibility = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id }) => api.toggleVisibility(id),
    apply: (qc, { id, visible }) => patchRows(qc, R, [id], { is_visible: visible, __pending: true }),
    settle: (qc, vehicle) => replaceRow(qc, R, vehicle.id, vehicle),
    success: (v) => (v.is_visible ? `${vehicleLabel(v)} is visible on the marketplace` : `${vehicleLabel(v)} hidden from the marketplace`),
    failure: "Visibility change failed",
  });

  const remove = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id }) => api.remove(id),
    apply: (qc, { id }) => removeRows(qc, R, [id]),
    success: (_, { label }) => `${label} deleted`,
    failure: ({ label }) => `Couldn't delete ${label}`,
  });

  const BULK_PATCH = {
    digital: { verification_state: "digital" },
    physical: { verification_state: "physical" },
    reject: { verification_state: "rejected" },
    show: { is_visible: true },
    hide: { is_visible: false },
  };
  const BULK_DONE = {
    digital: "marked digitally verified", physical: "marked physically verified", reject: "rejected",
    show: "made visible", hide: "hidden", delete: "deleted",
  };

  const bulk = useOptimisticMutation({
    resource: R,
    mutationFn: ({ ids, action, reason }) => api.bulk(ids, action, reason ? { reason } : {}),
    apply: (qc, { ids, action, reason }) => {
      if (action === "delete") removeRows(qc, R, ids);
      else patchRows(qc, R, ids, { ...BULK_PATCH[action], ...(reason ? { rejection_reason: reason } : {}), __pending: true });
    },
    success: (res, { ids, action }) => `${res?.affected ?? ids.length} vehicle${ids.length > 1 ? "s" : ""} ${BULK_DONE[action]}`,
    failure: "Bulk action failed",
  });

  return { create, update, setStatus, toggleVisibility, remove, bulk };
}
