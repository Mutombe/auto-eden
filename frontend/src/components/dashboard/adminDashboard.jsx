import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  deleteVehicle,
  fetchPendingReview,
  fetchVehicles,
  reviewVehicle,
  createVehicle,
  updateVehicle,
  fetchAllVehicles,
} from "../../redux/slices/vehicleSlice";
import { fetchBids, deleteBid } from "../../redux/slices/bidSlice";
import {
  CheckCircle,
  XCircle,
  Search,
  Sliders,
  Car,
  AlertCircle,
  ChevronDown,
  Filter,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  X,
  Plus,
  Info,
  Check,
  AlertTriangle,
} from "lucide-react";
import VehicleDialog from "./vehiclemodal";
import { Box, Typography, Button } from "@mui/material";

const DashboardHero = ({ onAddVehicle }) => {
  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #1a1a1a, #e41c38)",
        color: "white",
        pt: { xs: 6, sm: 8, md: 10 },
        pb: { xs: 4, sm: 5, md: 6 },
        mb: 4,
      }}
    >
      <Box
        className="max-w-7xl mx-auto pt-10"
        sx={{
          px: { xs: 2, sm: 4 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            }}
          >
            Auto Eden Admin Dashboard
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.85)",
              maxWidth: "700px",
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
              mb: 2,
            }}
          >
            Manage all the vehicles and offers in real-time. Digitally &
            physically verify uploaded vehicles, approve or reject offers.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                size="large"
                onClick={onAddVehicle}
                sx={{
                  bgcolor: "white",
                  color: "#e41c38",
                  borderRadius: "8px",
                  px: 3,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                Add New Vehicle
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const [selectedDetailsVehicle, setSelectedDetailsVehicle] = useState(null);
  const { pendingVehicles, allVehicles, items, status, error } = useSelector(
    (state) => state.vehicles
  );
  const { allBids } = useSelector((state) => state.bids);

  const [activeTab, setActiveTab] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editVehicle, setEditVehicle] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showActions, setShowActions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    listingType: "all",
    status: "pending",
  });

  console.log("all vehicles component", allVehicles);
  console.log("vehicles", items);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    dispatch(fetchPendingReview());
    dispatch(fetchVehicles());
    dispatch(fetchAllVehicles());
    dispatch(fetchBids());
  }, [dispatch]);

  const handleReview = (action) => {
    dispatch(
      reviewVehicle({
        id: selectedVehicle.id,
        data: {
          status: action === "approve" ? "physically_verified" : "rejected",
          rejection_reason: action === "reject" ? rejectionReason : null,
        },
      })
    ).then(() => {
      setSelectedVehicle(null);
      setRejectionReason("");
    });
  };

  console.log("all vehicles component", allVehicles);

  const handleSubmit = (formData) => {
    if (editVehicle) {
      dispatch(updateVehicle({ id: editVehicle.id, data: formData }));
    } else {
      dispatch(createVehicle(formData));
    }
    setShowAddModal(false);
    setEditVehicle(null);
  };

  const handleDialogClose = () => {
    setShowAddModal(false);
    setEditVehicle(null);
  };

  const handleEditClick = (vehicle) => {
    setEditVehicle(vehicle);
    setShowAddModal(true);
  };

  const handleStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-gray-200 text-gray-700";
      case "digitally_verified":
        return "bg-blue-100 text-blue-700";
      case "physically_verified":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const handlebidStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const handleListingTypeClass = (type) => {
    return type === "marketplace"
      ? "bg-black text-white"
      : "bg-red-600 text-white";
  };

  const getDisplayData1 = () => {
    // Get base data (pending vehicles or all items)
    let displayData = activeTab === 0 ? pendingVehicles || [] : items || [];

    // Only apply filters for the "All Vehicles" tab (activeTab === 1)
    if (activeTab === 1) {
      displayData = displayData.filter((vehicle) => {
        // Search filter only
        const matchesSearch =
          filters.search === "" ||
          `${vehicle.make} ${vehicle.model}`
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        // No listing_type filtering - show both marketplace and instant_sale
        return matchesSearch;
      });
    }

    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const tabCounts = {
    pending: pendingVehicles?.length || 0,
    dVerified:
      items?.filter((v) => v.status === "digitally_verified").length || 0,
    pVerified:
      items?.filter((v) => v.status === "physically_verified").length || 0,
    rejected: items?.filter((v) => v.status === "rejected").length || 0,
    all: items?.length || 0,
    bids: allBids?.length || 0, // Placeholder for bids count
  };

  const tabs = [
    { label: "PENDING", value: "pending" },
    { label: "D-VERIFIED", value: "digitally_verified" },
    { label: "P-VERIFIED", value: "physically_verified" },
    { label: "REJECTED", value: "rejected" },
    { label: "ALL", value: "all" },
    { label: "BIDS", value: "bids" },
    { label: "MATCHES", value: "matches" },
  ];

  const getDisplayData = () => {
    let displayData = [];
    switch (activeTab) {
      case 0: // PENDING REVIEW
        displayData = pendingVehicles || [];
        break;
      case 1: // D-VERIFIED
        displayData =
          items?.filter((v) => v.status === "digitally_verified") || [];
        break;
      case 2: // P-VERIFIED
        displayData =
          items?.filter((v) => v.status === "physically_verified") || [];
        break;
      case 3: // REJECTED
        displayData = items?.filter((v) => v.status === "rejected") || [];
        break;
      case 4: // ALL VEHICLES
        displayData = items || [];
        break;
      case 5: // BIDS
        displayData = allBids || [];
        break;
      default:
        displayData = [];
    }

    // Apply search filter
    if (activeTab !== 5) {
      displayData = displayData.filter((vehicle) => {
        const searchTerm = filters.search.toLowerCase();
        return (
          vehicle.make.toLowerCase().includes(searchTerm) ||
          vehicle.model.toLowerCase().includes(searchTerm) ||
          vehicle.vin.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const VerificationModal = ({ vehicle, onClose }) => {
    const [digitalVerified, setDigitalVerified] = useState(
      vehicle.status === "digitally_verified" ||
        vehicle.status === "physically_verified"
    );
    const [physicalVerified, setPhysicalVerified] = useState(
      vehicle.status === "physically_verified"
    );

    const handleSave = () => {
      let newStatus = "pending";
      if (physicalVerified) {
        newStatus = "physically_verified";
      } else if (digitalVerified) {
        newStatus = "digitally_verified";
      }

      dispatch(
        updateVehicle({
          id: vehicle.id,
          data: { status: newStatus },
        })
      ).then(() => {
        onClose();
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {vehicle.make} {vehicle.model}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">VIN</label>
                <p className="p-2 bg-gray-100 rounded">{vehicle.vin}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mileage
                </label>
                <p className="p-2 bg-gray-100 rounded">{vehicle.mileage} km</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-4">
                Verification Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={digitalVerified}
                    onChange={(e) => {
                      setDigitalVerified(e.target.checked);
                      if (!e.target.checked) setPhysicalVerified(false);
                    }}
                    className="form-checkbox h-4 w-4 text-red-600"
                  />
                  <span>Digitally Verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={physicalVerified}
                    onChange={(e) => {
                      setPhysicalVerified(e.target.checked);
                      if (e.target.checked) setDigitalVerified(true);
                    }}
                    disabled={!digitalVerified}
                    className={`form-checkbox h-4 w-4 text-red-600 ${
                      !digitalVerified ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                  <span>Physically Verified</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top header */}

      <DashboardHero onAddVehicle={() => setShowAddModal(true)} />
      <div className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Auto Eden Admin</h1>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">Administrator</span>
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="font-semibold">A</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">
            Vehicle Management Dashboard
          </h1>

          <div className="flex gap-2 self-end md:self-auto">
            <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50">
              <Download size={16} />
              <span className="hidden md:inline">Export</span>
            </button>
            <button
              className="bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-red-700"
              onClick={() => setShowAddModal(true)}
            >
              <Car size={16} />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Vehicles"
            value={items?.length || 0}
            icon={<Car size={20} />}
            bgColor="bg-white"
            textColor="text-black"
            borderColor="border-l-4 border-black"
          />
          <StatCard
            title="Pending Review"
            value={pendingVehicles?.length || 0}
            icon={<AlertCircle size={20} />}
            bgColor="bg-white"
            textColor="text-red-600"
            borderColor="border-l-4 border-red-600"
          />
          <StatCard
            title="Verified"
            value={
              items?.filter((v) => v.status === "physically_verified").length ||
              0
            }
            icon={<CheckCircle size={20} />}
            bgColor="bg-white"
            textColor="text-green-600"
            borderColor="border-l-4 border-green-600"
          />
          <StatCard
            title="Rejected"
            value={items?.filter((v) => v.status === "rejected").length || 0}
            icon={<XCircle size={20} />}
            bgColor="bg-white"
            textColor="text-gray-600"
            borderColor="border-l-4 border-gray-400"
          />
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-gray-200">
            <div className="flex gap-4 mb-4 md:mb-0 overflow-x-auto w-full md:w-auto">
              {tabs.map((tab, index) => (
                <TabButton
                  key={index}
                  active={activeTab === index}
                  onClick={() => setActiveTab(index)}
                  count={tabCounts[tab.value]}
                >
                  {tab.label}
                </TabButton>
              ))}
            </div>

            <div className="relative w-full md:w-auto">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                  />
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              {/* Filter dropdown */}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 m-4">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-2" size={16} />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Custom Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Owner
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {status === "loading" ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : getDisplayData().length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  getDisplayData().map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <Car size={20} className="text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {vehicle.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicle.owner?.username || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${handleListingTypeClass(
                            vehicle.listing_type
                          )}`}
                        >
                          {vehicle.listing_type === "marketplace"
                            ? "Marketplace"
                            : "Instant Sale"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${handleStatusClass(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status === "physically_verified"
                            ? "Verified"
                            : vehicle.status === "digitally_verified"
                            ? "Digitally Verified"
                            : vehicle.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        $
                        {vehicle.price?.toLocaleString() ||
                          vehicle.proposed_price?.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 relative">
                          {activeTab === 0 && (
                            <>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-end gap-2"
                                onClick={() =>
                                  setSelectedDetailsVehicle(vehicle)
                                }
                              >
                                <Eye size={14} />
                                View Details
                              </button>
                            </>
                          )}
                          {/*<button
                            onClick={() =>
                              setShowActions(
                                showActions === vehicle.id ? null : vehicle.id
                              )
                            }
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {showActions === vehicle.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                              <ul className="py-1">
                                <li>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() =>
                                      setSelectedDetailsVehicle(vehicle)
                                    }
                                  >
                                    <Eye size={14} />
                                    View Details
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => handleEditClick(vehicle)}
                                  >
                                    <Edit size={14} />
                                    Edit
                                  </button>
                                </li>
                              </ul>
                            </div>
)}*/}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {activeTab === 5 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Bids</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Vehicle
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Bidder
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allBids?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        No bids found
                      </td>
                    </tr>
                  ) : (
                    allBids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                              <Car size={20} className="text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {bid.vehicle?.make} {bid.vehicle?.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {bid.vehicle?.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {bid.bidder?.username || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${bid.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${handlebidStatusClass(
                              bid.status
                            )}`}
                          >
                            {bid.status.charAt(0).toUpperCase() +
                              bid.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2 relative">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => setSelectedDetailsVehicle(bid)}
                            >
                              <MoreVertical size={16} />
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => dispatch(deleteBid(bid.id))}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      (activeTab === 0
                        ? pendingVehicles?.length
                        : allVehicles?.length) || 0
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      (activeTab === 0
                        ? pendingVehicles?.length
                        : allVehicles?.length) || 0
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {(activeTab === 0
                      ? pendingVehicles?.length
                      : allVehicles?.length) || 0}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      currentPage * ITEMS_PER_PAGE >=
                      (activeTab === 0
                        ? pendingVehicles?.length
                        : allVehicles?.length)
                    }
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage * ITEMS_PER_PAGE >=
                      (activeTab === 0
                        ? pendingVehicles?.length
                        : allVehicles?.length)
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
            <div className="flex items-center justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <div className="text-sm text-gray-700">Page {currentPage}</div>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={
                  currentPage * ITEMS_PER_PAGE >=
                  (activeTab === 0
                    ? pendingVehicles?.length
                    : allVehicles?.length)
                }
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage * ITEMS_PER_PAGE >=
                  (activeTab === 0
                    ? pendingVehicles?.length
                    : allVehicles?.length)
                    ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Review {selectedVehicle?.make} {selectedVehicle?.model}
                </h2>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium">
                    {selectedVehicle?.owner?.username || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Type:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${handleListingTypeClass(
                      selectedVehicle?.listing_type
                    )}`}
                  >
                    {selectedVehicle?.listing_type === "marketplace"
                      ? "Marketplace"
                      : "Instant Sale"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold">
                    $
                    {selectedVehicle?.price?.toLocaleString() ||
                      selectedVehicle?.proposed_price?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (required for rejection)
                </label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason for rejection"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview("reject")}
                  disabled={!rejectionReason}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    !rejectionReason
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => handleReview("approve")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDetailsVehicle && (
        <VerificationModal
          vehicle={selectedDetailsVehicle}
          onClose={() => setSelectedDetailsVehicle(null)}
        />
      )}

      <VehicleDialog
        open={showAddModal}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        editVehicle={editVehicle}
        isSubmitting={status === "loading"}
      />
    </div>
  );
}

const StatCard = ({ title, value, icon, bgColor, textColor, borderColor }) => (
  <div className={`${bgColor} ${borderColor} shadow-sm rounded-lg p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-bold ${textColor} mt-1`}>{value}</p>
      </div>
      <div className={`${textColor} p-2 rounded-full`}>{icon}</div>
    </div>
  </div>
);

const TabButton = ({ children, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
      active
        ? "text-red-600 border-b-2 border-red-600 font-medium"
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    {children}
    {count !== undefined && (
      <span
        className={`text-xs rounded-full px-2 py-0.5 ${
          active ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);
