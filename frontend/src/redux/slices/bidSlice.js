// features/bids/bidSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const placeBid = createAsyncThunk(
  "bids/place",
  async ({ vehicleId, amount }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/core/bids/", {
        vehicle: vehicleId,
        amount,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


export const fetchUserBids = createAsyncThunk(
  'bids/fetchUserBids',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/core/bids/my-bids/',);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchBidderDetails = createAsyncThunk(
  'bids/fetchBidder',
  async (userId) => {
    const response = await api.get(`/core/users/${userId}/`);
    return response.data;
  }
);

const bidSlice = createSlice({
  name: "bids",
  initialState: {
    items: [],
    biddersCache: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
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
  
  },
});

export default bidSlice.reducer;
