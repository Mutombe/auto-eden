import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
  clearProfileError,
} from "../../redux/slices/profileSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Badge,
  Chip,
  CircularProgress,
  useMediaQuery,
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import {
  User,
  Car,
  Edit,
  Check,
  X,
  Camera,
  Lock,
  Mail,
  Calendar,
  Phone,
  BriefcaseBusiness,
  ArrowBigUp,
  Settings,
  Shield,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Custom theme with brand colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#e60000", // Red
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#333333", // Dark gray/black
    },
    error: {
      main: "#e60000", // Red
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#e60000",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#cc0000",
          },
        },
        outlined: {
          borderColor: "#e60000",
          color: "#e60000",
          "&:hover": {
            borderColor: "#cc0000",
            backgroundColor: "rgba(230, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#e60000",
        },
        colorSuccess: {
          backgroundColor: "#2e7d32",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#e60000",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#e60000",
          },
        },
      },
    },
  },
});

const ProfilePage = () => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { profileData, loading, error } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Form validation schema
  const profileSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    first_name: Yup.string().max(50, "Too long"),
    last_name: Yup.string().max(50, "Too long"),
    phone: Yup.string().matches(/^[0-9]{10,15}$/, "Phone number is not valid"),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      username: "",
      first_name: "",
      last_name: "",
      phone: "",
      profile_picture: null,
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("username", values.username);
        formData.append("first_name", values.first_name);
        formData.append("last_name", values.last_name);
        formData.append("phone", values.phone);
        if (selectedFile) {
          formData.append("profile_picture", selectedFile);
        }

        await dispatch(updateProfile(formData)).unwrap();
        setSnackbar({
          open: true,
          message: "Profile updated successfully!",
          severity: "success",
        });
        setEditMode(false);
        setSelectedFile(null);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.detail || "Failed to update profile",
          severity: "error",
        });
      }
    },
  });

  // Load profile data
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update form values when profile data changes
  useEffect(() => {
    if (profileData) {
      formik.setValues({
        username: profileData.username || user?.username || "",
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone: profileData.phone || "",
        profile_picture: profileData.profile_picture || null,
      });
      setPreviewUrl(profileData.profile_picture || "");
    }
  }, [profileData, user]);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle error snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
    dispatch(clearProfileError());
  };

  // Tab content components
  const ProfileTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Box
        sx={{
          bgcolor: "rgba(230, 0, 0, 0.05)",
          borderRadius: "16px",
          p: { xs: 2, md: 4 },
          mb: 4,
        }}
      >
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                editMode && (
                  <IconButton
                    component="label"
                    sx={{
                      bgcolor: "background.paper",
                      border: "2px solid #e60000",
                      "&:hover": { bgcolor: "rgba(230, 0, 0, 0.1)" },
                    }}
                  >
                    <Camera className="w-4 h-4 text-red-600" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </IconButton>
                )
              }
            >
              <Avatar
                src={previewUrl || "/default-avatar.png"}
                sx={{
                  width: { xs: 100, md: 128 },
                  height: { xs: 100, md: 128 },
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
                alt="Profile"
              />
            </Badge>
            {editMode && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Click camera icon to change photo
              </Typography>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full mt-4 md:mt-0 space-y-4">
            {editMode ? (
              <>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                  InputProps={{
                    startAdornment: <User className="text-gray-400 mr-2" />,
                    sx: { borderRadius: 2 },
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.first_name &&
                      Boolean(formik.errors.first_name)
                    }
                    helperText={
                      formik.touched.first_name && formik.errors.first_name
                    }
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.last_name &&
                      Boolean(formik.errors.last_name)
                    }
                    helperText={
                      formik.touched.last_name && formik.errors.last_name
                    }
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                </div>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  InputProps={{
                    startAdornment: <Phone className="text-gray-400 mr-2" />,
                    sx: { borderRadius: 2 },
                  }}
                />
              </>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {profileData?.first_name || profileData?.last_name
                      ? `${profileData.first_name} ${profileData.last_name}`
                      : profileData?.username || user?.username}
                  </Typography>
                  <Chip
                    label="Verified"
                    color="success"
                    size="small"
                    icon={<Check className="w-4 h-4" />}
                    sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                  />
                </div>

                <Divider sx={{ my: 2, borderColor: "rgba(0, 0, 0, 0.1)" }} />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-red-600" />
                    <Typography>
                      {profileData?.username || user?.username}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-600" />
                    <Typography>{user?.email}</Typography>
                  </div>
                  {profileData?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-red-600" />
                      <Typography>{profileData.phone}</Typography>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <Typography>
                      Member since{" "}
                      {new Date(profileData?.created_at).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Box>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        {editMode ? (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setEditMode(false);
                formik.resetForm();
                setSelectedFile(null);
                setPreviewUrl(profileData?.profile_picture || "");
              }}
              startIcon={<X className="w-5 h-5" />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={formik.handleSubmit}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  <Check className="w-5 h-5" />
                )
              }
              sx={{ borderRadius: 2, px: 3 }}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => setEditMode(true)}
            startIcon={<Edit className="w-5 h-5" />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </motion.div>
  );

  const SettingsTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={1}>
        <Typography
          variant="h6"
          className="font-bold flex items-center gap-2 mb-3"
        >
          <Settings className="w-5 h-5 text-red-600" />
          Account Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <div className="space-y-3">
          <Button
            fullWidth
            variant="outlined"
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              borderRadius: 2,
              mb: 2,
            }}
            startIcon={<Lock className="w-5 h-5" />}
          >
            Change Password
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              borderRadius: 2,
              mb: 2,
            }}
            startIcon={<Mail className="w-5 h-5" />}
          >
            Change Email
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              borderRadius: 2,
            }}
            startIcon={<Bell className="w-5 h-5" />}
          >
            Notification Preferences
          </Button>
        </div>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={1}>
        <Typography
          variant="h6"
          className="font-bold flex items-center gap-2 mb-3"
        >
          <Shield className="w-5 h-5 text-red-600" />
          Privacy & Security
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <div className="space-y-3">
          <Button
            fullWidth
            variant="outlined"
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              borderRadius: 2,
              mb: 2,
            }}
            startIcon={<User className="w-5 h-5" />}
          >
            Privacy Settings
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              justifyContent: "flex-start",
              py: 1.5,
              borderRadius: 2,
            }}
            startIcon={<CreditCard className="w-5 h-5" />}
          >
            Payment Methods
          </Button>
        </div>
      </Paper>

      <Button
        fullWidth
        variant="contained"
        color="error"
        sx={{
          mt: 4,
          py: 1.5,
          borderRadius: 2,
          bgcolor: "#333333",
          "&:hover": { bgcolor: "#000000" },
        }}
        startIcon={<LogOut className="w-5 h-5" />}
      >
        Logout
      </Button>
    </motion.div>
  );

  const StyledTab = (props) => (
    <Tab
      {...props}
      sx={{
        borderRadius: "8px",
        minHeight: "48px",
        textTransform: "none",
        fontWeight: 600,
        "&.Mui-selected": {
          color: "#e60000",
        },
      }}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <div className="bg-gradient-to-b from-gray-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              My User Profile
            </h1>
            <p className="text-gray-200 max-w-2xl">
              Manage your user credentials, password changing, password reset and your uploaded data.
            </p>
          </motion.div>
        </div>
      </div>
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        {/* Header with branded gradient background */}
        <Paper
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            backgroundImage: "linear-gradient(to right, #e60000, #990000)",
            color: "white",
            borderRadius: 3,
          }}
          elevation={2}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: { xs: 2, md: 0 } }}
            >
              My Profile
            </Typography>
            <Chip
              label={user?.is_superuser ? "Admin" : "Standard User"}
              sx={{
                bgcolor: user?.is_superuser
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.15)",
                color: "white",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "white" },
              }}
              icon={
                user?.is_superuser ? (
                  <Shield className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )
              }
            />
          </div>
        </Paper>

        {/* Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              "& .MuiTabs-flexContainer": {
                gap: 2,
              },
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <StyledTab
              label={
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </div>
              }
              value="profile"
            />
            <StyledTab
              label={
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicles
                </div>
              }
              value="tasks"
            />
            <StyledTab
              label={
                <div className="flex items-center gap-2">
                  <ArrowBigUp className="w-5 h-5" />
                  Bid
                </div>
              }
              value="applications"
            />
            <StyledTab
              label={
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </div>
              }
              value="settings"
            />
          </Tabs>
        </Box>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              }}
              elevation={2}
            >
              {loading && !profileData ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress sx={{ color: "#e60000" }} />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                  {error.detail || "Failed to load profile"}
                </Alert>
              ) : (
                <>
                  {activeTab === "profile" && <ProfileTab />}
                  {activeTab === "settings" && <SettingsTab />}
                  {activeTab === "tasks" && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <BriefcaseBusiness className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <Typography variant="h6" gutterBottom>
                        No Tasks Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your tasks will appear here once assigned
                      </Typography>
                    </Box>
                  )}
                  {activeTab === "applications" && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <ArrowBigUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <Typography variant="h6" gutterBottom>
                        No Applications Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your applications will appear here
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <Box
          sx={{ mt: 4, textAlign: "center", color: "text.secondary", py: 2 }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} AutoEden. All Rights Reserved.
          </Typography>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{
              alignItems: "center",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            onClose={handleCloseSnackbar}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ProfilePage;
