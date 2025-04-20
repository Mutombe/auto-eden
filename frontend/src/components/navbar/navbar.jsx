// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Car, User, LogIn, UserPlus, LogOut, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@mui/material";
import { logout, login, register } from "../../redux/slices/authSlice";
import {
  Home,
  Bell,
  AlertCircle,
  MapPin,
  AtSign,
  LayoutDashboard,
} from "lucide-react";
import { Lock } from "lucide-react";
import {
  Dialog,
  Button,
  TextField,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Chip,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export const AuthModals = ({ openType, onClose }) => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [view, setView] = useState(openType);
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "info",
    });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const navigate = useNavigate();

  // Update view when openType changes
  useEffect(() => {
    setView(openType);
  }, [openType]);

  useEffect(() => {
    if (openType) {
      setFormData({
        email: "",
        password: "",
        username: "",
      });
    }
  }, [openType]);

  const handleSubmit = () => {
    if (view === "login") {
      dispatch(
        login({ username: formData.username, password: formData.password })
      )
        .unwrap()
        .then(() => {
          setSnackbar({
            open: true,
            message: "You are logged in!",
            severity: "success",
          });
          onClose();
        })
        .catch((err) => {
          console.error("Login Failed:", err);
        });
    } else {
      dispatch(register(formData))
        .unwrap()
        .then(() => {
          setSnackbar({
            open: true,
            message: "Registration successful. Please verify your email !",
            severity: "success",
          });
          onClose();
          navigate("/email-verify");
        })
        .catch((err) => {
          console.error("Registration Failed:", err);
        });
    }
  };

  const getRegistrationError = () => {
    if (!error) return null;

    // Check for specific error messages
    if (typeof error === "object") {
      if (error.username) return error.username[0];
      if (error.email) return error.email[0];
      if (error.detail) return error.detail;
    }

    // Fallback to generic error message
    return error.toString();
  };

  return (
    <>
      <Dialog open={!!openType} onClose={onClose} maxWidth="xs" fullWidth>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="p-6 space-y-6"
        >
          <div className="text-center">
            <div className="animate-bounce mx-auto w-fit p-3 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl mb-4">
              <Car className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {view === "login" ? "Welcome Back!" : "Join Auto Eden"}
            </h2>
            <p className="text-gray-600">
              {view === "login"
                ? "Sign in to continue"
                : "Create your free account"}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 p-3 rounded-lg text-red-700 text-sm"
            >
              {view === "register"
                ? getRegistrationError()
                : typeof error === "object"
                ? error.detail || JSON.stringify(error)
                : error}
            </motion.div>
          )}

          <div className="space-y-4">
            {view === "register" && (
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                InputProps={{
                  startAdornment: <AtSign className="text-gray-400 mr-2" />,
                }}
              />
            )}

            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              InputProps={{
                startAdornment: <User className="text-gray-400 mr-2" />,
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              InputProps={{
                startAdornment: <Lock className="text-gray-400 mr-2" />,
              }}
            />
          </div>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="!rounded-xl !py-3 !text-base !font-semibold !shadow-lg"
          >
            {status === "loading" ? (
              <span className="animate-pulse">Processing...</span>
            ) : view === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>

          <Divider className="!my-6">or</Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => setView(view === "login" ? "register" : "login")}
            className="!rounded-xl !py-2.5 !text-gray-700"
          >
            {view === "login"
              ? "Create New Account"
              : "Already have an account? Sign In"}
          </Button>
        </motion.div>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          className="!items-center"
          iconMapping={{
            error: <AlertCircle className="w-5 h-5" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};


export const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [authModal, setAuthModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Auto Eden
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:ml-10 space-x-8">
              <Link to="/marketplace" className="text-gray-700 hover:text-blue-600">
                Marketplace
              </Link>
              <Link to="/sell" className="text-gray-700 hover:text-blue-600">
                Sell Your Car
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  My Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <IconButton className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="text-gray-600" />
            </IconButton>

            <div className="hidden md:flex items-center gap-4">
              <Search className="text-gray-600 cursor-pointer" />
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2">
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                    <Avatar className="!h-9 !w-9">
                      {user?.username?.[0]?.toUpperCase()}
                      </Avatar>
                    </Link>
                    <Button
                      variant="outlined"
                      startIcon={<LogOut className="w-5 h-5" />}
                      onClick={() => dispatch(logout())}
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<LogIn className="w-5 h-5" />}
                    onClick={() => setAuthModal("login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<UserPlus className="w-5 h-5" />}
                    onClick={() => setAuthModal("register")}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute inset-x-0 top-0 z-50 bg-white shadow-lg"
          >
            <div className="px-4 pt-5 pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold">Auto Eden</span>
                </div>
                <IconButton onClick={() => setMobileMenuOpen(false)}>
                  <X className="text-gray-600" />
                </IconButton>
              </div>
              
              <div className="space-y-4">
                <Link to="/marketplace" className="block text-gray-700 p-2">
                  Marketplace
                </Link>
                <Link to="/sell" className="block text-gray-700 p-2">
                  Sell Your Car
                </Link>
                {isAuthenticated && (
                  <Link to="/dashboard" className="block text-gray-700 p-2">
                    My Dashboard
                  </Link>
                )}
                {!isAuthenticated && (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LogIn />}
                      onClick={() => {
                        setAuthModal("login");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<UserPlus />}
                      onClick={() => {
                        setAuthModal("register");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />
    </nav>
  );
};