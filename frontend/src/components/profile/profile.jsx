import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfile,
  updateProfile,
  clearProfileError,
} from "../../redux/slices/profileSlice";
import { logout } from "../../redux/slices/authSlice";
import { fetchUserVehicles } from "../../redux/slices/vehicleSlice";
import { fetchUserBids } from "../../redux/slices/bidSlice";
import { motion, AnimatePresence } from "framer-motion";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";
import NotificationPreferences from "./NotificationPreferences";
import { toast } from "react-toastify";
import {
  User,
  Car,
  Edit3,
  Check,
  X,
  Camera,
  Lock,
  Mail,
  Calendar,
  Phone,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Eye,
  DollarSign,
  Clock,
  TrendingUp,
  MapPin,
  Fuel,
  Gauge,
} from "lucide-react";

// Quick Stats Card
const StatCard = ({ icon: Icon, label, value, color = "red" }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

// Vehicle Card Component
const VehicleCard = ({ vehicle, onClick }) => {
  const firstImage = vehicle.images?.[0]?.image || vehicle.images?.[0] || "/placeholder-car.jpg";
  const statusColors = {
    physical: "bg-emerald-100 text-emerald-700",
    digital: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-40 h-32 sm:h-auto bg-gray-100 flex-shrink-0">
          <img
            src={firstImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-lg font-bold text-red-600 mt-1">
                ${Number(vehicle.price || vehicle.proposed_price || 0).toLocaleString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.verification_state] || statusColors.pending}`}>
              {vehicle.verification_state === "physical" ? "Verified" :
               vehicle.verification_state === "digital" ? "Digital" :
               vehicle.verification_state === "rejected" ? "Rejected" : "Pending"}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              {Number(vehicle.mileage || 0).toLocaleString()} km
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="w-4 h-4" />
              {vehicle.fuel_type || "N/A"}
            </span>
            {vehicle.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {vehicle.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Bid Card Component
const BidCard = ({ bid }) => {
  const statusColors = {
    accepted: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            <span className="text-xl font-bold text-gray-900">
              ${Number(bid.amount).toLocaleString()}
            </span>
          </div>
          {bid.vehicle && (
            <p className="text-sm text-gray-600 mt-1">
              {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
            </p>
          )}
          {bid.message && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{bid.message}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {new Date(bid.created_at).toLocaleDateString()}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bid.status] || statusColors.pending}`}>
          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

// Settings Button Component
const SettingsButton = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
      danger
        ? "border-red-200 hover:bg-red-50 text-red-600"
        : "border-gray-100 hover:bg-gray-50 text-gray-700"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profileData, loading, error } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);
  const { userVehicles, userVehiclesLoading } = useSelector((state) => state.vehicles);
  const { items: userBids, status: bidsStatus } = useSelector((state) => state.bids);

  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "vehicles", label: "My Vehicles", icon: Car },
    { id: "bids", label: "My Bids", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Load profile data
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Load vehicles and bids when switching tabs
  useEffect(() => {
    if (activeTab === "vehicles") {
      dispatch(fetchUserVehicles());
    }
    if (activeTab === "bids") {
      dispatch(fetchUserBids());
    }
  }, [activeTab, dispatch]);

  // Update form values when profile data changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.username || user?.username || "",
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone: profileData.phone || "",
      });
      setPreviewUrl(profileData.profile_picture || "");
    }
  }, [profileData, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("first_name", formData.first_name);
      submitData.append("last_name", formData.last_name);
      submitData.append("phone", formData.phone);
      if (selectedFile) {
        submitData.append("profile_picture", selectedFile);
      }

      await dispatch(updateProfile(submitData)).unwrap();
      toast.success("Profile updated successfully!");
      setEditMode(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.detail || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedFile(null);
    setPreviewUrl(profileData?.profile_picture || "");
    setFormData({
      username: profileData?.username || user?.username || "",
      first_name: profileData?.first_name || "",
      last_name: profileData?.last_name || "",
      phone: profileData?.phone || "",
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Calculate stats
  const totalVehicles = userVehicles?.length || 0;
  const verifiedVehicles = userVehicles?.filter(v => v.verification_state === "physical" || v.verification_state === "digital").length || 0;
  const totalBids = userBids?.length || 0;
  const acceptedBids = userBids?.filter(b => b.status === "accepted").length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900">
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            {/* Profile Info */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/10 backdrop-blur-sm p-1">
                  <img
                    src={previewUrl || "/default-avatar.png"}
                    alt="Profile"
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
                {user?.is_superuser && (
                  <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    Admin
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {profileData?.first_name && profileData?.last_name
                    ? `${profileData.first_name} ${profileData.last_name}`
                    : profileData?.username || user?.username}
                </h1>
                <p className="text-gray-300 mt-1">{user?.email}</p>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profileData?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalVehicles}</p>
                <p className="text-gray-400 text-sm">Vehicles</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalBids}</p>
                <p className="text-gray-400 text-sm">Bids</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">{acceptedBids}</p>
                <p className="text-gray-400 text-sm">Accepted</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="pb-12"
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-6">
                    {/* Profile Picture Edit */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={previewUrl || "/default-avatar.png"}
                          alt="Profile"
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                          <Camera className="w-4 h-4 text-white" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Profile Photo</p>
                        <p className="text-sm text-gray-500">Click camera to change</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="font-medium text-gray-900">{profileData?.username || user?.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Phone className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{profileData?.phone || "Not set"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium text-gray-900">
                            {new Date(profileData?.created_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vehicles Tab */}
            {activeTab === "vehicles" && (
              <div className="space-y-4">
                {userVehiclesLoading ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading vehicles...</p>
                  </div>
                ) : !userVehicles || userVehicles.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Listed</h3>
                    <p className="text-gray-500 mb-6">You haven't listed any vehicles yet</p>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Your Vehicles ({userVehicles.length})
                      </h2>
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Manage in Dashboard →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {userVehicles.map((vehicle) => (
                        <VehicleCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Bids Tab */}
            {activeTab === "bids" && (
              <div className="space-y-4">
                {bidsStatus === "loading" ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading bids...</p>
                  </div>
                ) : !userBids || userBids.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bids Yet</h3>
                    <p className="text-gray-500 mb-6">You haven't placed any bids on vehicles</p>
                    <button
                      onClick={() => navigate("/marketplace")}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Your Bids ({userBids.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userBids.map((bid) => (
                        <BidCard key={bid.id} bid={bid} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-red-600" />
                    Account Settings
                  </h2>
                  <div className="space-y-3">
                    <SettingsButton
                      icon={Lock}
                      label="Change Password"
                      onClick={() => setPasswordModalOpen(true)}
                    />
                    <SettingsButton
                      icon={Mail}
                      label="Change Email"
                      onClick={() => setEmailModalOpen(true)}
                    />
                    <SettingsButton
                      icon={Bell}
                      label="Notification Preferences"
                      onClick={() => setNotificationModalOpen(true)}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Danger Zone</h2>
                  <SettingsButton
                    icon={LogOut}
                    label="Logout"
                    onClick={handleLogout}
                    danger
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
      <ChangeEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
      <NotificationPreferences
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
