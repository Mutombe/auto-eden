import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/vehicles/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchMarketplace = createAsyncThunk(
  'vehicles/fetchMarketplace',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);
      const { data } = await api.get(`/core/marketplace/?${params}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchInstantSaleVehicles = createAsyncThunk(
  'vehicles/fetchInstantSale',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/core/vehicles/instant-sales/');
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createVehicle1 = createAsyncThunk(
  "vehicles/create",
  async (vehicleData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/core/vehicles/", vehicleData);
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
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateVehicleStatus = createAsyncThunk(
  'vehicles/updateStatus',
  async ({ vehicleId, statusData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/core/vehicles/${vehicleId}/verify/`,
        statusData
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/update',
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
  'vehicles/toggleVisibility',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/core/vehicles/${id}/toggle_visibility/`, {});
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


export const fetchUserVehicles = createAsyncThunk(
  'vehicles/fetchUserVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/core/vehicles/my_vehicles/');
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
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
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMarketplace.fulfilled, (state, action) => {
        state.items = action.payload;
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
        const index = state.items.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // User vehicles
      .addCase(fetchUserVehicles.fulfilled, (state, action) => {
        state.userVehicles = action.payload;
      })
      
      // Delete vehicle
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.items = state.items.filter(v => v.id !== action.payload);
        if (state.userVehicles) {
          state.userVehicles = state.userVehicles.filter(v => v.id !== action.payload);
        }
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.userVehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.userVehicles[index] = action.payload;
        }
      })
      .addCase(toggleVisibility.fulfilled, (state, action) => {
        const index = state.userVehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.userVehicles[index] = action.payload;
        }
      });
  },
});

export default vehicleSlice.reducer;
