import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const requestQuote = createAsyncThunk(
  "quote/request",
  async (quoteData, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `core/vehicles/${quoteData.vehicleId}/request-quote/`,
        quoteData
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const quoteSlice = createSlice({
  name: "quote",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestQuote.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Failed to request quote";
      });
  },
});

export default quoteSlice.reducer;