// src/redux/slices/analyticsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchMarketplaceStats = createAsyncThunk(
  "analytics/fetchMarketplaceStats",
  async () => {
    try {
      const { data } = await api.get("/core/analytics/marketplace-stats/");
      return data;
    } catch (err) {
      throw err.response.data;
    }
  }
);

export const fetchVehicleViews = createAsyncThunk(
  "analytics/fetchVehicleViews",
  async (vehicleId) => {
    try {
      const { data } = await api.get(`/core/analytics/vehicle-views/${vehicleId}/`);
      return data;
    } catch (err) {
      throw err.response.data;
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    marketplaceStats: null,
    vehicleViews: {},
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketplaceStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMarketplaceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.marketplaceStats = action.payload;
      })
      .addCase(fetchMarketplaceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchVehicleViews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicleViews.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleViews[action.meta.arg] = action.payload;
      })
      .addCase(fetchVehicleViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default analyticsSlice.reducer;