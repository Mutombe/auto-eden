// store/slices/quoteSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunk for requesting a quote
export const requestQuote = createAsyncThunk(
  "quote/request",
  async (quoteData, { rejectWithValue }) => {
    try {
      const { vehicleId, ...formData } = quoteData;
      
      console.log('Submitting quote request:', { vehicleId, formData });
      
      const { data } = await api.post(
        `core/vehicles/${vehicleId}/request-quote/`,
        {
          full_name: formData.fullName,
          email: formData.email,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          telephone: formData.telephone,
          note: formData.note,
          status: 'pending', 
          priority: 'medium' 
        }
      );
      
      console.log('Quote request successful:', data);
      return data;
    } catch (err) {
      console.error('Quote request failed:', err.response?.data || err.message);
      
      // Handle different error formats
      if (err.response?.data) {
        // If there are field-specific errors
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
          const fieldErrors = Object.entries(err.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          return rejectWithValue({ detail: `Validation errors: ${fieldErrors}` });
        }
        return rejectWithValue(err.response.data);
      }
      
      return rejectWithValue({ 
        detail: err.message || "Network error occurred while submitting quote request" 
      });
    }
  }
);

// Async thunk for downloading quote PDF (optional feature)
export const downloadQuotePDF = createAsyncThunk(
  "quote/downloadPDF",
  async (quoteId, { rejectWithValue }) => {
    try {
      const response = await api.get(`core/quotes/${quoteId}/download/`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AutoEden_Quote_${quoteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { quoteId, success: true };
    } catch (err) {
      console.error('PDF download failed:', err);
      return rejectWithValue(err.response?.data || { detail: "Failed to download PDF" });
    }
  }
);

const quoteSlice = createSlice({
  name: "quote",
  initialState: {
    // Request state
    loading: false,
    error: null,
    success: false,
    
    // Quote data
    currentQuote: null,
    quoteHistory: [],
    
    // PDF download state
    downloadLoading: false,
    downloadError: null,
    
    // UI state
    lastSubmittedEmail: null,
    submissionTimestamp: null
  },
  reducers: {
    // Clear error messages
    clearError: (state) => {
      state.error = null;
      state.downloadError = null;
    },
    
    // Clear success state
    clearSuccess: (state) => {
      state.success = false;
    },
    
    // Reset entire quote state
    resetQuoteState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentQuote = null;
      state.downloadLoading = false;
      state.downloadError = null;
    },
    
    // Add quote to history (for user's quote tracking)
    addToHistory: (state, action) => {
      const quote = action.payload;
      state.quoteHistory.unshift(quote);
      // Keep only last 10 quotes
      if (state.quoteHistory.length > 10) {
        state.quoteHistory = state.quoteHistory.slice(0, 10);
      }
    },
    
    // Update quote status (for admin features)
    updateQuoteStatus: (state, action) => {
      const { quoteId, status } = action.payload;
      const quote = state.quoteHistory.find(q => q.id === quoteId);
      if (quote) {
        quote.is_processed = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Request Quote Cases
      .addCase(requestQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(requestQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentQuote = action.payload;
        state.lastSubmittedEmail = action.payload.email;
        state.submissionTimestamp = new Date().toISOString();
        
        // Add to history if we have quote data
        if (action.payload.quote_id || action.payload.id) {
          state.quoteHistory.unshift({
            id: action.payload.quote_id || action.payload.id,
            email: action.payload.email,
            created_at: new Date().toISOString(),
            is_processed: false,
            ...action.payload
          });
        }
      })
      .addCase(requestQuote.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload?.detail || "Failed to submit quote request";
        
        // Log detailed error for debugging
        console.error('Quote request rejected:', action.payload);
      })
      
      // Download PDF Cases
      .addCase(downloadQuotePDF.pending, (state) => {
        state.downloadLoading = true;
        state.downloadError = null;
      })
      .addCase(downloadQuotePDF.fulfilled, (state, action) => {
        state.downloadLoading = false;
        // Optional: track download success
        const quote = state.quoteHistory.find(q => q.id === action.payload.quoteId);
        if (quote) {
          quote.lastDownloaded = new Date().toISOString();
        }
      })
      .addCase(downloadQuotePDF.rejected, (state, action) => {
        state.downloadLoading = false;
        state.downloadError = action.payload?.detail || "Failed to download PDF";
      });
  },
});

// Export actions
export const {
  clearError,
  clearSuccess,
  resetQuoteState,
  addToHistory,
  updateQuoteStatus
} = quoteSlice.actions;

// Selectors
export const selectQuoteState = (state) => state.quote;
export const selectQuoteLoading = (state) => state.quote.loading;
export const selectQuoteError = (state) => state.quote.error;
export const selectQuoteSuccess = (state) => state.quote.success;
export const selectCurrentQuote = (state) => state.quote.currentQuote;
export const selectQuoteHistory = (state) => state.quote.quoteHistory;
export const selectDownloadLoading = (state) => state.quote.downloadLoading;
export const selectLastSubmittedEmail = (state) => state.quote.lastSubmittedEmail;

export default quoteSlice.reducer;