// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import vehicleReducer from '../slices/vehicleSlice';
import bidReducer from '../slices/bidSlice';
import profileReducer from '../slices/profileSlice';
import searchReducer from '../slices/searchSlice';
import quoteReducer from '../slices/quoteSlice';
import analyticsReducer from '../slices/analyticsSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    bids: bidReducer,
    profile: profileReducer,
    searches: searchReducer,
    quotes: quoteReducer,
    analytics: analyticsReducer
  },
});