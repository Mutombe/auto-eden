// redux/slices/aiSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Send message to AI chat
export const sendMessage = createAsyncThunk(
  "ai/sendMessage",
  async ({ message, context = null }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/core/ai/chat/", {
        message,
        context,
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to get AI response" }
      );
    }
  }
);

// Check AI status (if enabled by admin)
export const checkAIStatus = createAsyncThunk(
  "ai/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/ai/status/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: "Failed to check AI status" });
    }
  }
);

// Ask AI about a specific vehicle
export const askAboutVehicle = createAsyncThunk(
  "ai/askAboutVehicle",
  async ({ vehicleId, question }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/core/ai/vehicle/${vehicleId}/ask/`, {
        question,
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to get AI response" }
      );
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    messages: [],
    loading: false,
    error: null,
    isOpen: false,
    isEnabled: true,
    vehicleContext: null, // For "Ask AI about this vehicle" feature
  },
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    setVehicleContext: (state, action) => {
      state.vehicleContext = action.payload;
    },
    clearVehicleContext: (state) => {
      state.vehicleContext = null;
    },
    clearChat: (state) => {
      state.messages = [];
      state.vehicleContext = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: Date.now(),
          role: "assistant",
          content: action.payload.response || action.payload.message,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Failed to get response";
        // Add error message to chat
        state.messages.push({
          id: Date.now(),
          role: "assistant",
          content: "I'm sorry, I couldn't process your request. Please try again.",
          isError: true,
          timestamp: new Date().toISOString(),
        });
      })

      // Check AI status
      .addCase(checkAIStatus.fulfilled, (state, action) => {
        state.isEnabled = action.payload.ai_enabled !== false;
      })
      .addCase(checkAIStatus.rejected, (state) => {
        state.isEnabled = false;
      })

      // Ask about vehicle
      .addCase(askAboutVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(askAboutVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: Date.now(),
          role: "assistant",
          content: action.payload.response || action.payload.message,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(askAboutVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Failed to get response";
      });
  },
});

export const {
  toggleChat,
  openChat,
  closeChat,
  addUserMessage,
  setVehicleContext,
  clearVehicleContext,
  clearChat,
  clearError,
} = aiSlice.actions;

export default aiSlice.reducer;
