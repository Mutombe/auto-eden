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

export function AuthHeader({ view }) {
  return (
    <div className="text-center">
      <div className="mx-auto w-20 h-20 mb-4">
        <img 
          src="/logo.png" 
          alt="Auto Eden Logo" 
          className="rounded-2xl w-full h-full"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {view === "login" ? "Welcome Back!" : "Join Zim-Rec"}
      </h2>
      <p className="text-gray-600">
        {view === "login"
          ? "Sign in to continue to your account"
          : "Create your free REC trading account"}
      </p>
    </div>
  );
}

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
            message: "Registration successful. Please Login !",
            severity: "success",
          });
          onClose();
          navigate("/");
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
          style={{ backgroundColor: "#f9fafb" }}
        >
          <div className="text-center">
          <div className="mx-auto w-30 h-20 mb-4">
        <img 
          src="/logo.png" 
          alt="Auto Eden Logo" 
          className="rounded-2xl w-full h-full"
        />
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
              <>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#dc2626',
                    },
                  },
                  '& .MuiFormLabel-root.Mui-focused': {
                    color: '#dc2626',
                  },
                }}
              />
              <Divider className="!my-3"></Divider></>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                  },
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#dc2626',
                },
              }}
            />
            <Divider className="!my-3"></Divider>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                  },
                },
                '& .MuiFormLabel-root.Mui-focused': {
                  color: '#dc2626',
                },
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
            sx={{
              backgroundColor: "#dc2626",
              '&:hover': {
                backgroundColor: "#b91c1c",
              },
            }}
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
              '&:hover': {
                borderColor: "#dc2626",
                backgroundColor: "rgba(220, 38, 38, 0.04)",
              },
            }}
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
          sx={{
            backgroundColor: snackbar.severity === 'success' ? '#f0fdf4' : undefined,
            color: snackbar.severity === 'success' ? '#16a34a' : undefined,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? '#16a34a' : undefined,
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export function Logo() {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex-shrink-0 flex items-center">
        <div className="w-40 h-40 mr-2 mt-25">
          <img 
            src="/logo.png" 
            alt="Auto Eden Logo" 
            className="rounded-sm"
          />
        </div>
      </Link>
    </div>
  );
}

export const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [authModal, setAuthModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = user?.is_superuser;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? "bg-white shadow-md" : "bg-gray-100"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Left Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:ml-10 space-x-8">
              <Link to="/marketplace" className={`hover:text-red-600 font-medium transition-colors ${
                scrolled ? "text-gray-800" : "text-gray-900"
              }`}>
                Marketplace
              </Link>
              <Link to="/sell" className={`hover:text-red-600 font-medium transition-colors ${
                scrolled ? "text-gray-800" : "text-gray-900"
              }`}>
                Buy My Car(Right Now)
              </Link>
              <Link to="/about" className={`hover:text-red-600 font-medium transition-colors ${
                scrolled ? "text-gray-800" : "text-gray-900"
              }`}>
                About Us
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className={`hover:text-red-600 font-medium transition-colors ${
                  scrolled ? "text-gray-800" : "text-gray-900"
                }`}>
                  My Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={`hover:text-red-600 font-medium transition-colors ${
                  scrolled ? "text-gray-800" : "text-gray-900"
                }`}>
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
{/* Right Section - Mobile Menu Button */}
<button
  className="block md:hidden" // Show on mobile, hide on desktop
  onClick={() => setMobileMenuOpen(true)}
>
  <Menu className="h-6 w-6 text-gray-900" />
</button>

            <div className="hidden md:flex items-center gap-3">
              {/*<IconButton 
                sx={{
                  color: scrolled ? "#1f2937" : "#ffffff",
                  '&:hover': {
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  }
                }}
              >
                <Search />
              </IconButton>*/}
              
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3">
                    <Link to="/profile">
                      <Avatar 
                        className="!h-10 !w-10 border-2 border-red-600"
                        sx={{
                          backgroundColor: '#111827',
                          color: '#ffffff'
                        }}
                      >
                        {user?.username?.[0]?.toUpperCase()}
                      </Avatar>
                    </Link>
                    <Button
                      variant="outlined"
                      startIcon={<LogOut className="w-5 h-5" />}
                      onClick={() => dispatch(logout())}
                      sx={{
                        color: scrolled ? "#dc2626" : "#dc2626",
                        borderColor: scrolled ? "#dc2626" : "#dc2626",
                        '&:hover': {
                          borderColor: "#b91c1c",
                          backgroundColor: scrolled ? "rgba(220, 38, 38, 0.04)" : "rgba(255, 255, 255, 0.1)",
                        }
                      }}
                      className="!rounded-lg !font-medium"
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
                    sx={{
                      color: scrolled ? "#dc2626" : "#dc2626",
                      borderColor: scrolled ? "#dc2626" : "#dc2626",
                      '&:hover': {
                        borderColor: "#b91c1c",
                        backgroundColor: scrolled ? "rgba(220, 38, 38, 0.04)" : "rgba(255, 255, 255, 0.1)",
                      }
                    }}
                    className="!rounded-lg !font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<UserPlus className="w-5 h-5" />}
                    onClick={() => setAuthModal("register")}
                    sx={{
                      backgroundColor: "#dc2626",
                      '&:hover': {
                        backgroundColor: "#b91c1c",
                      }
                    }}
                    className="!rounded-lg !font-medium"
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
            className="md:hidden fixed inset-x-0 top-0 z-50 bg-white shadow-lg"
            style={{ display: { xs: 'block', md: 'none' } }} // Ensure it's hidden on desktop
          >
            <div className="px-4 pt-5 pb-6">
              <div className="flex items-center justify-between mb-6">
  
                <Link to="/" className="flex items-center">
              <Logo />
            </Link>
                <IconButton onClick={() => setMobileMenuOpen(false)}>
                  <X className="text-gray-600" />
                </IconButton>
              </div>
              
              <div className="space-y-4">
                <Link 
                  to="/marketplace" 
                  className="block text-gray-800 p-2 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link 
                  to="/sell" 
                  className="block text-gray-800 p-2 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sell Your Car
                </Link>
                <Link 
                  to="/about" 
                  className="block text-gray-800 p-2 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                {isAuthenticated && (
                  <Link 
                    to="/dashboard" 
                    className="block text-gray-800 p-2 font-medium hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                )}
                
                <div className="pt-2 mt-2 border-t border-gray-200">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center p-2 gap-3">
                        <Avatar 
                          className="!h-10 !w-10 border-2 border-red-600"
                          sx={{
                            backgroundColor: '#111827',
                            color: '#ffffff'
                          }}
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
                          '&:hover': {
                            borderColor: "#b91c1c",
                            backgroundColor: "rgba(220, 38, 38, 0.04)",
                          }
                        }}
                        className="!rounded-lg !mt-2 !font-medium"
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
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
                          '&:hover': {
                            borderColor: "#b91c1c",
                            backgroundColor: "rgba(220, 38, 38, 0.04)",
                          },
                          marginBottom: "12px"
                        }}
                        className="!rounded-lg !font-medium"
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
                        sx={{
                          backgroundColor: "#dc2626",
                          '&:hover': {
                            backgroundColor: "#b91c1c",
                          }
                        }}
                        className="!rounded-lg !font-medium"
                      >
                        Register
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />
    </nav>
  );
};