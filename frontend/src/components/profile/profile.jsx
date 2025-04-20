import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, clearProfileError } from '../../redux/slices/profileSlice';
import { motion, AnimatePresence } from 'framer-motion';
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
  Paper
} from '@mui/material';
import {
  User,
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
  LogOut
} from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { profileData, loading, error } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Form validation schema
  const profileSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    first_name: Yup.string().max(50, 'Too long'),
    last_name: Yup.string().max(50, 'Too long'),
    phone: Yup.string().matches(/^[0-9]{10,15}$/, 'Phone number is not valid')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      username: '',
      first_name: '',
      last_name: '',
      phone: '',
      profile_picture: null
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('first_name', values.first_name);
        formData.append('last_name', values.last_name);
        formData.append('phone', values.phone);
        if (selectedFile) {
          formData.append('profile_picture', selectedFile);
        }

        await dispatch(updateProfile(formData)).unwrap();
        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        setEditMode(false);
        setSelectedFile(null);
      } catch (error) {
        setSnackbar({ open: true, message: error.detail || 'Failed to update profile', severity: 'error' });
      }
    }
  });

  // Load profile data
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update form values when profile data changes
  useEffect(() => {
    if (profileData) {
      formik.setValues({
        username: profileData.username || user?.username || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        profile_picture: profileData.profile_picture || null
      });
      setPreviewUrl(profileData.profile_picture || '');
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
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              editMode && (
                <IconButton
                  component="label"
                  className="!bg-indigo-100 hover:!bg-indigo-200"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
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
              src={previewUrl || '/default-avatar.png'}
              className="!w-32 !h-32 !border-4 !border-white !shadow-lg"
              alt="Profile"
            />
          </Badge>
          {editMode && (
            <Typography variant="caption" className="text-gray-500">
              Click camera icon to change photo
            </Typography>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 w-full space-y-4">
          {editMode ? (
            <>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                InputProps={{
                  startAdornment: <User className="text-gray-400 mr-2" />
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
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
                  startAdornment: <Phone className="text-gray-400 mr-2" />
                }}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Typography variant="h5" className="font-bold">
                  {profileData?.first_name || profileData?.last_name
                    ? `${profileData.first_name} ${profileData.last_name}`
                    : profileData?.username || user?.username}
                </Typography>
                <Chip
                  label="Verified"
                  color="success"
                  size="small"
                  icon={<Check className="w-4 h-4" />}
                  className="!text-xs"
                />
              </div>

              <Divider className="!my-4" />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <Typography>{profileData?.username || user?.username}</Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <Typography>{user?.email}</Typography>
                </div>
                {profileData?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <Typography>{profileData.phone}</Typography>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <Typography>
                    Member since {new Date(profileData?.created_at).toLocaleDateString()}
                  </Typography>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {editMode ? (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setEditMode(false);
                formik.resetForm();
                setSelectedFile(null);
                setPreviewUrl(profileData?.profile_picture || '');
              }}
              startIcon={<X className="w-5 h-5" />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={formik.handleSubmit}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} className="!text-white" />
                ) : (
                  <Check className="w-5 h-5" />
                )
              }
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => setEditMode(true)}
            startIcon={<Edit className="w-5 h-5" />}
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
      <Paper className="p-4 space-y-4">
        <Typography variant="h6" className="font-bold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Account Settings
        </Typography>
        <Divider />
        <div className="space-y-3">
          <Button
            fullWidth
            variant="outlined"
            className="!justify-start !py-3"
            startIcon={<Lock className="w-5 h-5" />}
          >
            Change Password
          </Button>
          <Button
            fullWidth
            variant="outlined"
            className="!justify-start !py-3"
            startIcon={<Mail className="w-5 h-5" />}
          >
            Change Email
          </Button>
          <Button
            fullWidth
            variant="outlined"
            className="!justify-start !py-3"
            startIcon={<Bell className="w-5 h-5" />}
          >
            Notification Preferences
          </Button>
        </div>
      </Paper>

      <Paper className="p-4 space-y-4">
        <Typography variant="h6" className="font-bold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy & Security
        </Typography>
        <Divider />
        <div className="space-y-3">
          <Button
            fullWidth
            variant="outlined"
            className="!justify-start !py-3"
            startIcon={<User className="w-5 h-5" />}
          >
            Privacy Settings
          </Button>
          <Button
            fullWidth
            variant="outlined"
            className="!justify-start !py-3"
            startIcon={<CreditCard className="w-5 h-5" />}
          >
            Payment Methods
          </Button>
        </div>
      </Paper>

      <Button
        fullWidth
        variant="outlined"
        color="error"
        className="!mt-6 !py-3"
        startIcon={<LogOut className="w-5 h-5" />}
      >
        Logout
      </Button>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Typography variant="h4" className="font-bold">
          My Profile
        </Typography>
        <Chip
          label={user?.is_superuser ? 'Admin' : 'Standard User'}
          color={user?.is_superuser ? 'primary' : 'default'}
          icon={user?.is_superuser ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant={isMobile ? 'fullWidth' : 'standard'}
        className="mb-6"
      >
        <Tab
          label="Profile"
          value="profile"
          icon={<User className="w-5 h-5" />}
          iconPosition="start"
        />
        <Tab
          label="Tasks"
          value="tasks"
          icon={<BriefcaseBusiness className="w-5 h-5" />}
          iconPosition="start"
        />
        <Tab
          label="Applications"
          value="applications"
          icon={<ArrowBigUp className="w-5 h-5" />}
          iconPosition="start"
        />
      </Tabs>

      {/* Content */}
      <Paper className="p-4 md:p-6 rounded-2xl shadow-sm">
        {loading && !profileData ? (
          <div className="flex justify-center py-12">
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity="error" className="mb-4">
            {error.detail || 'Failed to load profile'}
          </Alert>
        ) : (
          <>
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'tasks' && (
              <Typography>Your tasks will appear here</Typography>
            )}
            {activeTab === 'applications' && (
              <Typography>Your applications will appear here</Typography>
            )}
          </>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          severity={snackbar.severity}
          className="!items-center"
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProfilePage;