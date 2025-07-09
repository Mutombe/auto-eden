import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/vehicles/");
      console.log("vehicles slice", data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchPendingReview = createAsyncThunk(
  "vehicles/fetchPendingReview",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/vehicles/pending_review/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchAllVehicles = createAsyncThunk(
  "vehicles/fetchAllVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/vehicles/");
      console.log("all vehicles", data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchVehicleDetails = createAsyncThunk(
  "vehicles/fetchDetails",
  async (vehicleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/core/all-vehicles/${vehicleId}/`);
      return response.data;
    } catch (err) {
      // Handle 500 errors specifically
      if (err.response?.status === 500) {
        return rejectWithValue("Server error loading vehicle details");
      }
      return rejectWithValue(err.response?.data || 'Vehicle not found');
    }
  }
);

export const reviewVehicle = createAsyncThunk(
  "vehicles/review",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/core/vehicles/${id}/review/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchMarketplace = createAsyncThunk(
  "vehicles/fetchMarketplace",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      
      // Add all filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Set default pagination if missing
      if (!params.has('page')) params.append('page', '1');
      if (!params.has('page_size')) params.append('page_size', '12');
      
      const { data } = await api.get(`/core/marketplace/?${params}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Unknown error');
    }
  }
);

export const fetchInstantSaleVehicles = createAsyncThunk(
  "vehicles/fetchInstantSale",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/vehicles/instant-sales/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createVehicle = createAsyncThunk(
  "vehicles/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/core/vehicles/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateVehicleStatus = createAsyncThunk(
  "vehicles/updateStatus",
  async ({ vehicleId, statusData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/core/vehicles/${vehicleId}/verify/`,
        statusData
      );
      return data; // This should be the full vehicle object
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicles/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/core/vehicles/${id}/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const toggleVisibility = createAsyncThunk(
  "vehicles/toggleVisibility",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/core/vehicles/${id}/toggle_visibility/`,
        {}
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchUserVehicles = createAsyncThunk(
  "vehicles/fetchUserVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/vehicles/my_vehicles/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "vehicles/delete",
  async (vehicleId, { rejectWithValue }) => {
    try {
      await api.delete(`/core/vehicles/${vehicleId}/`);
      return vehicleId;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const vehicleSlice = createSlice({
  name: "vehicles",
  initialState: {
    items: [],
    userVehicles: [],
    allVehicles: [],
    pendingVehicles: [],
    loading: false,
    error: null,
    marketplace: {  // Add this marketplace object
      results: [],
      count: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize: 12,
    },
    currentVehicle: null,
    loadingDetails: false,
  },
  reducers: {
    setAllVehicles: (state, action) => {
      state.allVehicles = Array.isArray(action.payload)
        ? action.payload.results
        : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        console.log("vehicles reducer", action.payload);
        state.items = action.payload.results || action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicleDetails.pending, (state) => {
        state.loadingDetails = true;
        state.currentVehicle = null;
      })
      .addCase(fetchVehicleDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.currentVehicle = action.payload;
      })
      .addCase(fetchVehicleDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })
      .addCase(fetchMarketplace.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMarketplace.fulfilled, (state, action) => {
        state.loading = false;
        state.marketplace = {
          results: action.payload.results,
          count: action.payload.count,
          currentPage: action.payload.current_page || 1,
          totalPages: Math.ceil(action.payload.count / (action.payload.page_size || 12)),
          pageSize: action.payload.page_size || 12,
        };
      })
      .addCase(fetchMarketplace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInstantSaleVehicles.fulfilled, (state, action) => {
        state.instantSaleVehicles = action.payload;
      })
      .addCase(fetchPendingReview.fulfilled, (state, action) => {
        state.pendingVehicles = action.payload;
      })
      .addCase(fetchAllVehicles.fulfilled, (state, action) => {
        state.allVehicles = Array.isArray(action.payload)
          ? action.payload.results
          : [];
        console.log("all vehicles payload", state.allVehicles);
      })
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVehicleStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }

        // Also update in pendingVehicles if exists
        if (state.pendingVehicles) {
          const pendingIndex = state.pendingVehicles.findIndex(
            (v) => v.id === action.payload.id
          );
          if (pendingIndex !== -1) {
            state.pendingVehicles[pendingIndex] = action.payload;
          }
        }
      })

      // User vehicles
      .addCase(fetchUserVehicles.fulfilled, (state, action) => {
        state.userVehicles = action.payload;
      })

      // Delete vehicle
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.items = state.items.filter((v) => v.id !== action.payload);
        if (state.userVehicles) {
          state.userVehicles = state.userVehicles.filter(
            (v) => v.id !== action.payload
          );
        }
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.userVehicles.findIndex(
          (v) => v.id === action.payload.id
        );
        if (index !== -1) {
          state.userVehicles[index] = action.payload;
        }
      })
      .addCase(toggleVisibility.fulfilled, (state, action) => {
        const index = state.userVehicles.findIndex(
          (v) => v.id === action.payload.id
        );
        if (index !== -1) {
          state.userVehicles[index] = action.payload;
        }
      });
  },
});

export default vehicleSlice.reducer;
