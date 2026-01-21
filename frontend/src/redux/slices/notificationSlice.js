// redux/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Fetch all notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/notifications/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch notifications");
    }
  }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/core/notifications/unread_count/");
      return data.unread_count;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch unread count");
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/core/notifications/${notificationId}/read/`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to mark as read");
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/core/notifications/read_all/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to mark all as read");
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/core/notifications/${notificationId}/`);
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete notification");
    }
  }
);

// Clear all read notifications
export const clearAllRead = createAsyncThunk(
  "notifications/clearAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/core/notifications/clear_all/");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to clear notifications");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
  },
  reducers: {
    // Add a notification from WebSocket
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    // Clear all notifications
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    // Reset error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Handle paginated response
        if (action.payload.results) {
          state.items = action.payload.results;
          state.hasMore = action.payload.next !== null;
        } else {
          state.items = action.payload;
          state.hasMore = false;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find((n) => n.id === action.payload.id);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((notification) => {
          notification.is_read = true;
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload);
        if (index !== -1) {
          const wasUnread = !state.items[index].is_read;
          state.items.splice(index, 1);
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })

      // Clear all read
      .addCase(clearAllRead.fulfilled, (state) => {
        state.items = state.items.filter((n) => !n.is_read);
      });
  },
});

export const { addNotification, clearNotifications, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
