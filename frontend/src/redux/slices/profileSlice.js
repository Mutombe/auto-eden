import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("core/profile/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to fetch profile" }
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      if (profileData.username) formData.append("username", profileData.username);
      if (profileData.first_name) formData.append("first_name", profileData.first_name);
      if (profileData.last_name) formData.append("last_name", profileData.last_name);
      
      // Add profile picture if it exists and is a File object
      if (profileData.profile_picture && profileData.profile_picture instanceof File) {
        formData.append("profile_picture", profileData.profile_picture);
      }
      
      const response = await api.put("core/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Failed to update profile" }
      );
    }
  }
);

const initialState = {
  profileData: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;