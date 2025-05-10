// src/redux/slices/searchSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchUserSearches = createAsyncThunk(
  'searches/fetchUserSearches',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/core/vehicle-searches/');
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createSearch = createAsyncThunk(
  'searches/createSearch',
  async (searchData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/core/vehicle-searches/', searchData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateSearch = createAsyncThunk(
  'searches/updateSearch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/core/vehicle-searches/${id}/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteSearch = createAsyncThunk(
  'searches/deleteSearch',
  async (searchId, { rejectWithValue }) => {
    try {
      await api.delete(`/core/vehicle-searches/${searchId}/`);
      return searchId;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const searchSlice = createSlice({
  name: "searches",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSearches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserSearches.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserSearches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSearch.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateSearch.fulfilled, (state, action) => {
        const index = state.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteSearch.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload);
      });
  }
});

export default searchSlice.reducer;