// features/bids/bidSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchBids = createAsyncThunk(
  "bids/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/bids/all_bids/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteBid = createAsyncThunk(
  "bids/delete",
  async (bidId, { rejectWithValue }) => {
    try {
      await api.delete(`/core/bids/${bidId}/`);
      return bidId;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const placeBid = createAsyncThunk(
  "bids/place",
  async ({ vehicleId, amount, message }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/core/bids/", {
        vehicle_id: vehicleId, // Changed from 'vehicle' to 'vehicle_id'
        amount,
        message: message || "No message provided",
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchUserBids = createAsyncThunk(
  "bids/fetchUserBids",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/bids/my-bids/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchBidderDetails = createAsyncThunk(
  "bids/fetchBidder",
  async (userId) => {
    const response = await api.get(`/core/users/${userId}/`);
    return response.data;
  }
);

const bidSlice = createSlice({
  name: "bids",
  initialState: {
    items: [],
    allBids: [],
    biddersCache: {},
    placing: false,

    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBids.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.loading = false;
        //state.items = action.payload;
        state.allBids = action.payload;
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placeBid.pending, (state) => {
        state.placing = true; // Set placing to true when bid starts
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.placing = false; // Reset when bid succeeds
        state.items.push(action.payload);
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.placing = false; // Reset when bid fails
        state.error = action.payload;
      })
      .addCase(fetchUserBids.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBids.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBidderDetails.fulfilled, (state, action) => {
        state.biddersCache[action.meta.arg] = action.payload;
      })
      .addCase(deleteBid.fulfilled, (state, action) => {
        state.allBids = state.allBids.filter(
          (bid) => bid.id !== action.payload
        );
      });
  },
});

export default bidSlice.reducer;
