// features/selectors.js
import { createSelector } from "@reduxjs/toolkit";

// Base selectors
const selectVehicles = (state) => state.vehicles.items;
const selectUserVehicles = (state) => state.vehicles.userVehicles;
const selectBids = (state) => state.bids.items;
const selectPendingVehicles = (state) => state.admin.pendingVehicles;

// Memoized selectors
export const selectAllVehicles = createSelector(
  [selectVehicles],
  (vehicles) => vehicles
);

export const selectVerifiedVehicles = createSelector(
  [selectAllVehicles],
  (vehicles) =>
    vehicles.filter((v) =>
      ["digitally_verified", "physically_verified"].includes(v.status)
    )
);

export const selectMarketplaceVehicles = createSelector(
  [selectVerifiedVehicles],
  (vehicles) => vehicles.filter((v) => v.listing_type === "marketplace")
);

export const selectInstantSaleVehicles = createSelector(
  [selectVerifiedVehicles],
  (vehicles) => vehicles.filter((v) => v.listing_type === "instant_sale")
);

export const selectUserVehicleStats = createSelector(
  [selectUserVehicles],
  (vehicles) => ({
    total: vehicles.length,
    pending: vehicles.filter((v) => v.status === "pending").length,
    verified: vehicles.filter((v) =>
      ["digitally_verified", "physically_verified"].includes(v.status)
    ).length,
    rejected: vehicles.filter((v) => v.status === "rejected").length,
  })
);

export const selectVehicleById = createSelector(
  [selectAllVehicles, (_, vehicleId) => vehicleId],
  (vehicles, vehicleId) => vehicles.find((v) => v.id === vehicleId)
);

export const selectBidsForVehicle = createSelector(
  [selectBids, (_, vehicleId) => vehicleId],
  (bids, vehicleId) => bids.filter((bid) => bid.vehicle === vehicleId)
);

export const selectHighestBid = createSelector([selectBidsForVehicle], (bids) =>
  bids.reduce((max, bid) => (bid.amount > max ? bid.amount : max), 0)
);

export const selectPendingVerification = createSelector(
  [selectPendingVehicles],
  (vehicles) => vehicles.filter((v) => v.status === "pending")
);

export const selectRejectedVehicles = createSelector(
  [selectUserVehicles],
  (vehicles) => vehicles.filter((v) => v.status === "rejected")
);

export const selectVehicleStatusHistory = createSelector(
  [selectVehicleById],
  (vehicle) => ({
    verificationStatus: vehicle.status,
    lastUpdated: vehicle.updated_at,
    rejectionReason: vehicle.rejection_reason,
  })
);

export const selectVehiclesWithBids = createSelector(
  [selectAllVehicles, selectBids],
  (vehicles, bids) =>
    vehicles.filter((vehicle) => bids.some((bid) => bid.vehicle === vehicle.id))
);

// Admin-specific selectors
export const selectAdminDashboardStats = createSelector(
  [selectPendingVehicles, selectAllVehicles],
  (pending, all) => ({
    pendingCount: pending.length,
    verifiedCount: all.filter((v) => v.status === "physically_verified").length,
    totalListings: all.length,
    instantSaleRequests: all.filter((v) => v.listing_type === "instant_sale")
      .length,
  })
);

// Bid management selectors
export const selectUserBids = createSelector([selectBids], (bids) =>
  bids.map((bid) => ({
    ...bid,
    status: bid.status.charAt(0).toUpperCase() + bid.status.slice(1),
  }))
);

export const selectActiveBids = createSelector([selectUserBids], (bids) =>
  bids.filter((bid) => bid.status === "Pending")
);

// Complex selector combining multiple data sources
export const selectVehicleWithBidInfo = createSelector(
  [selectVehicleById, selectBidsForVehicle, selectHighestBid],
  (vehicle, bids, highestBid) => ({
    ...vehicle,
    bidCount: bids.length,
    highestBid,
    hasBids: bids.length > 0,
  })
);

// Timeline selector for vehicle verification process
export const selectVerificationTimeline = createSelector(
  [selectVehicleById],
  (vehicle) =>
    [
      { status: "Submitted", date: vehicle.created_at, completed: true },
      {
        status: "Digital Verification",
        date: vehicle.digital_verification_date,
        completed: ["digitally_verified", "physically_verified"].includes(
          vehicle.status
        ),
      },
      {
        status: "Physical Verification",
        date: vehicle.physical_verification_date,
        completed: vehicle.status === "physically_verified",
      },
    ].filter((step) => step.date || step.completed)
);
