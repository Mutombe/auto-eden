// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Info,
  LogIn,
  UserPlus,
  LogOut,
  X,
  LayoutDashboard,
  FolderDot,
} from "lucide-react";
import { Button, Avatar } from "@mui/material";
import { logout } from "../../redux/slices/authSlice";
import { TbCarSuv } from "react-icons/tb";
import NotificationCenter from "../notifications/NotificationCenter";
import { AuthModals } from "../auth/AuthModals";
import { useSidebar } from "../../contexts/SidebarContext";

// Re-export AuthModals for backward compatibility
export { AuthModals } from "../auth/AuthModals";

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
  const { sidebarCollapsed, isDashboardPage } = useSidebar();
  const [authModal, setAuthModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = user?.is_superuser;

  // Calculate navbar left offset for dashboard pages on desktop
  const sidebarWidth = sidebarCollapsed ? "lg:pl-20" : "lg:pl-64 xl:pl-72";

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
        <div className={`transition-all duration-300 px-4 sm:px-6 lg:px-8 ${
          isDashboardPage ? sidebarWidth : "max-w-7xl mx-auto"
        }`}>
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo - Hidden on dashboard pages on desktop since sidebar has logo */}
            <div className={isDashboardPage ? "lg:hidden" : ""}>
              <Logo variant={scrolled ? "default" : "light"} />
            </div>

            {/* Desktop Navigation - Hidden on mobile, with left margin on dashboard pages */}
            <div className={`hidden md:flex md:items-center md:gap-8 ${isDashboardPage ? "lg:ml-4" : ""}`}>
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
                  {/* Notification Center */}
                  <div className={scrolled ? "text-gray-800" : "text-white"}>
                    <NotificationCenter />
                  </div>
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