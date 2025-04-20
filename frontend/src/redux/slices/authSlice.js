// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Login Credentials:", credentials);
      const response = await api.post("/core/auth/login/", credentials);
      console.log("Login Response:", response.data);
      return {
        access: response.data.access,
        refresh: response.data.refresh,
        user: response.data.user,
      };
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { detail: err.message || "Login Failed" }
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/register/", userData);
      return {
        email: userData.email,
        detail: response.data?.detail || "Registration Successful",
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: err.message || "Registration Failed" }
      );
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerification",
  async (email, { rejectWithValue }) => {
    try {
      await api.post("core/auth/resend-verification/", { email });
      return { email };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    tokens: JSON.parse(localStorage.getItem("auth")),
    isAuthenticated: !!JSON.parse(localStorage.getItem("auth"))?.access,

    status: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("auth");
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.error = action.payload || { detail: "Registration failed" };
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tokens = action.payload;
        state.user = action.payload.user;
        console.log("User", state.user);
        state.isAuthenticated = true;
        localStorage.setItem(
          "auth",
          JSON.stringify({
            access: action.payload.access,
            refresh: action.payload.refresh,
            user: action.payload.user,
          })
        );
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
