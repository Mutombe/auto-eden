// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Info,
  User,
  LogIn,
  UserPlus,
  LogOut,
  X,
  LayoutDashboard,
  AtSign,
  Lock,
  AlertCircle,
  FolderDot,
} from "lucide-react";
import { CarFront } from "lucide-react";
import { TiUserAddOutline } from "react-icons/ti";

import {
  Dialog,
  Button,
  TextField,
  Divider,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import { logout, login, register } from "../../redux/slices/authSlice";
import { TbCarSuv } from "react-icons/tb";

/**
 * Auth Modal Component
 * Handles login and registration flows
 */
export const AuthModals = ({ openType, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  useEffect(() => {
    setView(openType);
  }, [openType]);

  useEffect(() => {
    if (openType) {
      setFormData({ email: "", password: "", username: "" });
    }
  }, [openType]);

  const handleSubmit = () => {
    if (view === "login") {
      dispatch(login({ username: formData.username, password: formData.password }))
        .unwrap()
        .then(() => {
          setSnackbar({ open: true, message: "You are logged in!", severity: "success" });
          onClose();
        })
        .catch((err) => console.error("Login Failed:", err));
    } else {
      dispatch(register(formData))
        .unwrap()
        .then(() => {
          setSnackbar({ open: true, message: "Registration successful. Please Login!", severity: "success" });
          onClose();
          navigate("/");
        })
        .catch((err) => console.error("Registration Failed:", err));
    }
  };

  const getRegistrationError = () => {
    if (!error) return null;
    if (typeof error === "object") {
      if (error.username) return error.username[0];
      if (error.email) return error.email[0];
      if (error.detail) return error.detail;
    }
    return error.toString();
  };

  return (
    <>
      <Dialog
        open={!!openType}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#f9fafb !important",
            color: "#1f2937 !important",
          },
        }}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="pacaembu-font p-6 space-y-6"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <div className="text-center">
            <div className="mx-auto w-30 h-20 mb-4">
              <img src="/Auto-eden-favicon.png" alt="Auto Eden Logo" className="rounded-2xl w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {view === "login" ? "Welcome Back!" : "Join Auto Eden"}
            </h2>
            <p className="text-gray-600">
              {view === "login" ? "Sign in to continue" : "Create your free account"}
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
              <>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  InputProps={{ startAdornment: <AtSign className="text-gray-400 mr-2 w-5 h-5" /> }}
                  sx={{
                    "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#dc2626" } },
                    "& .MuiFormLabel-root.Mui-focused": { color: "#dc2626" },
                  }}
                />
                <Divider className="!my-3" />
              </>
            )}

            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              InputProps={{ startAdornment: <User className="text-gray-400 mr-2 w-5 h-5" /> }}
              sx={{
                "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#dc2626" } },
                "& .MuiFormLabel-root.Mui-focused": { color: "#dc2626" },
              }}
            />
            <Divider className="!my-3" />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{ startAdornment: <Lock className="text-gray-400 mr-2 w-5 h-5" /> }}
              sx={{
                "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#dc2626" } },
                "& .MuiFormLabel-root.Mui-focused": { color: "#dc2626" },
              }}
            />
          </div>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="!rounded-lg !py-3 !text-base !font-semibold !shadow-lg"
            sx={{ backgroundColor: "#dc2626", "&:hover": { backgroundColor: "#b91c1c" } }}
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
            className="!rounded-lg !py-2.5"
            sx={{
              color: "#1f2937",
              borderColor: "#d1d5db",
              "&:hover": { borderColor: "#dc2626", backgroundColor: "rgba(220, 38, 38, 0.04)" },
            }}
          >
            {view === "login" ? "Create New Account" : "Already have an account? Sign In"}
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
          iconMapping={{ error: <AlertCircle className="w-5 h-5" /> }}
          sx={{
            backgroundColor: snackbar.severity === "success" ? "#f0fdf4" : undefined,
            color: snackbar.severity === "success" ? "#16a34a" : undefined,
            "& .MuiAlert-icon": { color: snackbar.severity === "success" ? "#16a34a" : undefined },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

/**
 * Logo Component
 * Displays the Auto Eden logo
 */
export function Logo({ variant = "default" }) {
  return (
    <Link to="/" className="flex-shrink-0 flex items-center" aria-label="Auto Eden Home">
      <img
        src={variant === "light" ? "/white-autoeden-logo.png" : "/Auto-Eden-black-logo.png"}
        alt="Auto Eden - Buy & Sell Cars"
        className="h-8 sm:h-10 w-auto"
      />
    </Link>
  );
}

/**
 * Main Navbar Component
 * Slim, transparent navbar that overlays the hero section
 * Features: transparent bg on hero, solid on scroll, full-screen mobile menu
 */
export const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [authModal, setAuthModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = user?.is_superuser;

  // Handle scroll effect - transparent at top, solid when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Navigation items for reusability
  const navItems = [
    { to: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
    { to: "/sell", icon: TbCarSuv, label: "Buy My Car" },
    { to: "/about", icon: Info, label: "About Us" },
  ];

  return (
    <>
      {/* Main Navigation Bar - Slim design */}
      <nav
        className={`pacaembu-font fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Logo variant={scrolled ? "default" : "light"} />

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex md:items-center md:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-red-500 ${
                    scrolled ? "text-gray-800" : "text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`flex items-center text-sm font-medium transition-colors hover:text-red-500 ${
                    scrolled ? "text-gray-800" : "text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center text-sm font-medium transition-colors hover:text-red-500 ${
                    scrolled ? "text-gray-800" : "text-white"
                  }`}
                >
                  <FolderDot className="w-4 h-4 mr-1.5" />
                  Admin
                </Link>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/profile">
                    <Avatar
                      className="!h-8 !w-8 border-2 border-red-600"
                      sx={{ backgroundColor: "#111827", color: "#ffffff", fontSize: "0.875rem" }}
                    >
                      {user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                  </Link>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LogOut className="w-4 h-4" />}
                    onClick={() => dispatch(logout())}
                    sx={{
                      color: scrolled ? "#dc2626" : "#ffffff",
                      borderColor: scrolled ? "#dc2626" : "#ffffff",
                      fontSize: "0.8125rem",
                      padding: "4px 12px",
                      "&:hover": {
                        borderColor: "#b91c1c",
                        backgroundColor: scrolled ? "rgba(220, 38, 38, 0.04)" : "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                    className="!rounded-md !font-medium"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LogIn className="w-4 h-4" />}
                    onClick={() => setAuthModal("login")}
                    sx={{
                      color: scrolled ? "#dc2626" : "#ffffff",
                      borderColor: scrolled ? "#dc2626" : "#ffffff",
                      fontSize: "0.8125rem",
                      padding: "4px 12px",
                      "&:hover": {
                        borderColor: "#b91c1c",
                        backgroundColor: scrolled ? "rgba(220, 38, 38, 0.04)" : "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                    className="!rounded-md !font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<UserPlus className="w-4 h-4" />}
                    onClick={() => setAuthModal("register")}
                    sx={{
                      backgroundColor: "#dc2626",
                      fontSize: "0.8125rem",
                      padding: "4px 12px",
                      "&:hover": { backgroundColor: "#b91c1c" },
                    }}
                    className="!rounded-md !font-medium"
                  >
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button - "Menu" text with border and subtle background */}
            <button
              className={`md:hidden text-sm font-medium px-4 py-1.5 rounded transition-all duration-200 ${
                scrolled
                  ? "text-gray-900 border border-gray-300 bg-gray-50 hover:bg-gray-100"
                  : "text-white border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              }`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative h-full flex flex-col"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
                <Logo variant="default" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Menu Items */}
              <div className="flex-1 overflow-y-auto px-4 py-8">
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        to={item.to}
                        className="flex items-center text-gray-800 px-4 py-4 text-lg font-medium hover:bg-gray-50 hover:text-red-600 rounded-xl transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  {isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center text-gray-800 px-4 py-4 text-lg font-medium hover:bg-gray-50 hover:text-red-600 rounded-xl transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        My Dashboard
                      </Link>
                    </motion.div>
                  )}

                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link
                        to="/admin"
                        className="flex items-center text-gray-800 px-4 py-4 text-lg font-medium hover:bg-gray-50 hover:text-red-600 rounded-xl transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FolderDot className="w-5 h-5 mr-3" />
                        Admin Dashboard
                      </Link>
                    </motion.div>
                  )}
                </nav>
              </div>

              {/* Mobile Menu Footer - Auth Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 py-6 border-t border-gray-100"
              >
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                      <Avatar
                        className="!h-10 !w-10 border-2 border-red-600"
                        sx={{ backgroundColor: "#111827", color: "#ffffff" }}
                      >
                        {user?.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{user?.username}</div>
                        <Link
                          to="/profile"
                          className="text-sm text-red-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LogOut />}
                      onClick={() => {
                        dispatch(logout());
                        setMobileMenuOpen(false);
                      }}
                      sx={{
                        color: "#dc2626",
                        borderColor: "#dc2626",
                        padding: "12px",
                        "&:hover": { borderColor: "#b91c1c", backgroundColor: "rgba(220, 38, 38, 0.04)" },
                      }}
                      className="!rounded-xl !font-medium"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<UserPlus />}
                      onClick={() => {
                        setAuthModal("register");
                        setMobileMenuOpen(false);
                      }}
                      sx={{
                        backgroundColor: "#dc2626",
                        padding: "12px",
                        "&:hover": { backgroundColor: "#b91c1c" },
                      }}
                      className="!rounded-xl !font-medium"
                    >
                      Register
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LogIn />}
                      onClick={() => {
                        setAuthModal("login");
                        setMobileMenuOpen(false);
                      }}
                      sx={{
                        color: "#dc2626",
                        borderColor: "#dc2626",
                        padding: "12px",
                        "&:hover": { borderColor: "#b91c1c", backgroundColor: "rgba(220, 38, 38, 0.04)" },
                      }}
                      className="!rounded-xl !font-medium"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modals */}
      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
};

export default Navbar;