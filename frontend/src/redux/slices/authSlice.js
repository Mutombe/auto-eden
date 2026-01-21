// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/login/", credentials);
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/resend-verification/");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: "Failed to send verification email" });
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/password-reset/", { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to request password reset" }
      );
    }
  }
);

export const confirmPasswordReset = createAsyncThunk(
  "auth/confirmPasswordReset",
  async ({ token, new_password, confirm_password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/password-reset/confirm/", {
        token,
        new_password,
        confirm_password,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to reset password" }
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ current_password, new_password, confirm_password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/change-password/", {
        current_password,
        new_password,
        confirm_password,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to change password" }
      );
    }
  }
);

export const changeEmail = createAsyncThunk(
  "auth/changeEmail",
  async ({ new_email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/change-email/", {
        new_email,
        password,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to change email" }
      );
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async ({ access_token, id_token }, { rejectWithValue }) => {
    try {
      const response = await api.post("/core/auth/google/", {
        access_token,
        id_token,
      });
      return {
        access: response.data.access,
        refresh: response.data.refresh,
        user: response.data.user,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Google login failed" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("auth"))?.user || null,
    tokens: JSON.parse(localStorage.getItem("auth")),
    isAuthenticated: !!JSON.parse(localStorage.getItem("auth"))?.access,
    status: "idle",
    error: null,
    passwordResetStatus: "idle",
    passwordResetError: null,
    passwordChangeStatus: "idle",
    passwordChangeError: null,
    emailChangeStatus: "idle",
    emailChangeError: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("auth");
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetStatus = "idle";
      state.passwordResetError = null;
    },
    clearPasswordChangeStatus: (state) => {
      state.passwordChangeStatus = "idle";
      state.passwordChangeError = null;
    },
    clearEmailChangeStatus: (state) => {
      state.emailChangeStatus = "idle";
      state.emailChangeError = null;
    },
    updateUserEmail: (state, action) => {
      if (state.user) {
        state.user.email = action.payload;
        const auth = JSON.parse(localStorage.getItem("auth"));
        if (auth) {
          auth.user.email = action.payload;
          localStorage.setItem("auth", JSON.stringify(auth));
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.error = action.payload || { detail: "Registration failed" };
      })
      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tokens = action.payload;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
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
      // Resend Verification
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordResetStatus = "loading";
        state.passwordResetError = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.passwordResetStatus = "succeeded";
        state.passwordResetError = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordResetStatus = "failed";
        state.passwordResetError = action.payload;
      })
      // Confirm Password Reset
      .addCase(confirmPasswordReset.pending, (state) => {
        state.passwordResetStatus = "loading";
        state.passwordResetError = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.passwordResetStatus = "succeeded";
        state.passwordResetError = null;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.passwordResetStatus = "failed";
        state.passwordResetError = action.payload;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeStatus = "loading";
        state.passwordChangeError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordChangeStatus = "succeeded";
        state.passwordChangeError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeStatus = "failed";
        state.passwordChangeError = action.payload;
      })
      // Change Email
      .addCase(changeEmail.pending, (state) => {
        state.emailChangeStatus = "loading";
        state.emailChangeError = null;
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.emailChangeStatus = "succeeded";
        state.emailChangeError = null;
        if (state.user && action.payload.email) {
          state.user.email = action.payload.email;
          const auth = JSON.parse(localStorage.getItem("auth"));
          if (auth) {
            auth.user.email = action.payload.email;
            localStorage.setItem("auth", JSON.stringify(auth));
          }
        }
      })
      .addCase(changeEmail.rejected, (state, action) => {
        state.emailChangeStatus = "failed";
        state.emailChangeError = action.payload;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tokens = action.payload;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem(
          "auth",
          JSON.stringify({
            access: action.payload.access,
            refresh: action.payload.refresh,
            user: action.payload.user,
          })
        );
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const {
  logout,
  clearError,
  clearPasswordResetStatus,
  clearPasswordChangeStatus,
  clearEmailChangeStatus,
  updateUserEmail,
} = authSlice.actions;
export default authSlice.reducer;
