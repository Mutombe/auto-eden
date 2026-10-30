// Thin REST layer for the admin console. Every list endpoint is server-paginated:
// { count, total_pages, current_page, page_size, results }.
import api from "../../../utils/api";

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

export const resources = {
  vehicles: {
    list: (params) => api.get("/core/vehicles/", { params: clean(params) }).then((r) => r.data),
    get: (id) => api.get(`/core/vehicles/${id}/`).then((r) => r.data),
    create: (data) => api.post("/core/vehicles/", data).then((r) => r.data),
    update: (id, data) => api.patch(`/core/vehicles/${id}/`, data).then((r) => r.data),
    remove: (id) => api.delete(`/core/vehicles/${id}/`),
    summary: () => api.get("/core/vehicles/summary/").then((r) => r.data),
    verify: (id, flags) => api.patch(`/core/vehicles/${id}/verify/`, flags).then((r) => r.data),
    toggleVisibility: (id) => api.patch(`/core/vehicles/${id}/toggle_visibility/`, {}).then((r) => r.data),
    bulk: (ids, action, extra = {}) =>
      api.post("/core/vehicles/bulk/", { ids, action, ...extra }).then((r) => r.data),
    uploadImage: (id, file, onProgress) => {
      const fd = new FormData();
      fd.append("image", file, file.name);
      return api
        .post(`/core/vehicles/${id}/images/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => onProgress?.(e.total ? e.loaded / e.total : 0),
        })
        .then((r) => r.data);
    },
    deleteImage: (id, imageId) => api.delete(`/core/vehicles/${id}/images/${imageId}/`),
    bids: (id) => api.get(`/core/bids/vehicle-bids/${id}/`, { params: { page_size: 50 } }).then((r) => r.data),
  },
  bids: {
    list: (params) => api.get("/core/bids/all_bids/", { params: clean(params) }).then((r) => r.data),
    setStatus: (id, status) => api.patch(`/core/bids/${id}/set_status/`, { status }).then((r) => r.data),
    remove: (id) => api.delete(`/core/bids/${id}/`),
  },
  quotes: {
    list: (params) => api.get("/core/admin/quotes/", { params: clean(params) }).then((r) => r.data),
    get: (id) => api.get(`/core/admin/quotes/${id}/`).then((r) => r.data),
    update: (id, data) => api.patch(`/core/admin/quotes/${id}/`, data).then((r) => r.data),
    remove: (id) => api.delete(`/core/admin/quotes/${id}/`),
    downloadPdf: (id) =>
      api.get(`/core/quotes/${id}/download/`, { responseType: "blob" }).then((r) => r.data),
  },
  users: {
    list: (params) => api.get("/core/users/", { params: clean(params) }).then((r) => r.data),
    get: (id) => api.get(`/core/users/${id}/`).then((r) => r.data),
    create: (data) => api.post("/core/users/", data).then((r) => r.data),
    update: (id, data) => api.patch(`/core/users/${id}/`, data).then((r) => r.data),
    remove: (id) => api.delete(`/core/users/${id}/`),
  },
  stats: {
    dashboard: () => api.get("/core/stats/dashboard/").then((r) => r.data),
  },
};

// Turn any DRF error shape into one readable sentence for a toast.
export function errorMessage(err, fallback = "Something went wrong") {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  const data = err.response?.data;
  if (!data) {
    if (err.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
    return "Can't reach the server right now. It may be restarting; wait a few seconds and try again.";
    return err.message || fallback;
  }
  if (typeof data === "string") return data.length > 200 ? fallback : data;
  if (data.detail) return String(data.detail);
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(" ");
  const parts = Object.entries(data).map(([field, msgs]) => {
    const text = Array.isArray(msgs) ? msgs.join(" ") : typeof msgs === "object" ? JSON.stringify(msgs) : msgs;
    return `${field.replace(/_/g, " ")}: ${text}`;
  });
  return parts.length ? parts.join(" · ") : fallback;
}
