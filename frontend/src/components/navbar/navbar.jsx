// src/components/navbar/navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
  Jeep,
  Menu,
  ChevronRight,
  User,
  Phone,
  ShieldCheck,
} from "../ui/icons";
import { logout } from "../../redux/slices/authSlice";
import NotificationCenter from "../notifications/NotificationCenter";
import { AuthModals } from "../auth/AuthModals";
import Wordmark from "../brand/Wordmark";
import Pattern from "../ui/Pattern";
import { SavedNavButton } from "../vehicles/SaveButton";

// Re-export AuthModals for backward compatibility
export { AuthModals } from "../auth/AuthModals";

/** The Auto Eden logo, linked home. `light` for dark backgrounds. */
export function Logo({ variant = "default" }) {
  return (
    <Link to="/" className="relative flex-shrink-0 flex items-center" aria-label="Auto Eden home">
      <Wordmark light={variant === "light"} />
    </Link>
  );
}

const NAV = [
  { to: "/marketplace", icon: ShoppingCart, label: "Marketplace", hint: "Browse verified cars" },
  { to: "/sell", icon: Jeep, label: "Buy My Car", hint: "Get an offer for your car" },
  { to: "/about", icon: Info, label: "About Us", hint: "How Auto Eden works" },
];

const initial = (user) => user?.username?.[0]?.toUpperCase() || "?";

/**
 * Fixed navbar: transparent over dark page headers, white once scrolled.
 * Phones get a slide-in panel with the account (or sign-in buttons) at the top.
 */
export const Navbar = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [authModal, setAuthModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The homepage hero sits in a white frame; at the top the bar drops into that frame with it.
  const insetHero = pathname === "/";
  const isAdmin = user?.is_superuser;

  // Passive listener; state only changes when crossing the threshold, so scrolling stays smooth.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation; lock page scroll and listen for Escape while it's open.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const links = [
    ...NAV,
    ...(isAuthenticated ? [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }] : []),
    ...(isAdmin ? [{ to: "/admin", icon: FolderDot, label: "Admin" }] : []),
  ];
  const openAuth = (type) => {
    setMenuOpen(false);
    setAuthModal(type);
  };
  const signOut = () => {
    setMenuOpen(false);
    dispatch(logout());
  };

  const tone = scrolled ? "text-gray-800" : "text-white";

  return (
    <>
      <nav
        className={`pacaembu-font fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,padding] duration-200 ${
          scrolled ? "bg-white/95 backdrop-blur shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_16px_-8px_rgba(0,0,0,0.12)]" : `bg-transparent ${insetHero ? "pt-2 sm:pt-3 lg:pt-4" : ""}`
        }`}
        aria-label="Main navigation"
      >
        <div className={`max-w-7xl mx-auto transition-[padding] duration-200 ${insetHero && !scrolled ? "px-5 sm:px-9 lg:px-12" : "px-4 sm:px-6 lg:px-8"}`}>
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Logo variant={scrolled ? "default" : "light"} />

            {/* Desktop links */}
            <div className="hidden md:flex md:items-center md:gap-7">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-red-500 ${isActive ? "text-red-500" : tone}`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop account */}
            <div className="hidden md:flex items-center gap-2.5">
              <SavedNavButton light={!scrolled} className="mr-1" />
              {isAuthenticated ? (
                <>
                  <div className={tone}>
                    <NotificationCenter />
                  </div>
                  <Link
                    to="/profile"
                    title="Your profile"
                    className="grid place-items-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-semibold ring-2 ring-red-600 ring-offset-1 ring-offset-transparent"
                  >
                    {initial(user)}
                  </Link>
                  <button
                    onClick={signOut}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium border transition-colors ${
                      scrolled ? "border-gray-200 text-gray-700 hover:bg-gray-50" : "border-white/30 text-white hover:bg-white/10"
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuth("login")}
                    className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md text-[13px] font-medium border transition-colors ${
                      scrolled ? "border-gray-200 text-gray-800 hover:bg-gray-50" : "border-white/30 text-white hover:bg-white/10"
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuth("register")}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md text-[13px] font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create account
                  </button>
                </>
              )}
            </div>

            {/* Mobile: notifications + saved + menu button */}
            <div className="md:hidden flex items-center gap-2">
              {isAuthenticated && (
                <div className={tone}>
                  <NotificationCenter />
                </div>
              )}
              <SavedNavButton light={!scrolled} />
              <button
                className={`inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-lg text-[13px] font-medium transition-colors ${
                  scrolled ? "text-gray-900 bg-gray-100 hover:bg-gray-200" : "text-white bg-white/10 ring-1 ring-inset ring-white/25 backdrop-blur-sm hover:bg-white/20"
                }`}
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu className="w-[18px] h-[18px]" />
                Menu
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu: panel slides in from the right */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden pacaembu-font" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.div
              className="absolute inset-0 bg-gray-950/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 right-0 w-full max-w-[400px] bg-white flex flex-col shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
            >
              {/* Header: brand + account / sign-in */}
              <div className="relative isolate overflow-hidden bg-gray-950 text-white px-5 pt-[max(env(safe-area-inset-top),0.75rem)] pb-5">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_100%_at_100%_0%,rgba(220,38,38,0.35),transparent_60%)]" />
                <Pattern variant="circuit" fade="corner" className="-z-10 text-white/[0.12]" />
                <div className="flex items-center justify-between h-12">
                  <Link to="/" aria-label="Auto Eden home">
                    <Wordmark light markClassName="h-7" textClassName="text-[22px]" />
                  </Link>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="grid place-items-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isAuthenticated ? (
                  <Link to="/profile" className="mt-5 flex items-center gap-3 p-3 rounded-lg bg-white/[0.07] ring-1 ring-inset ring-white/10 hover:bg-white/[0.12] transition-colors">
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-red-600 text-white text-lg font-semibold shrink-0">{initial(user)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium truncate">{user?.username}</span>
                      <span className="block text-[13px] text-white/55 truncate">{user?.email || "View your profile"}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </Link>
                ) : (
                  <div className="mt-5">
                    <p className="text-[17px] font-medium leading-snug">Buy and sell verified cars in Zimbabwe</p>
                    <p className="text-[13px] text-white/55 mt-1">Free to list. Every car checked by our team.</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openAuth("login")}
                        className="inline-flex items-center justify-center gap-1.5 h-11 rounded-lg bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign in
                      </button>
                      <button
                        onClick={() => openAuth("register")}
                        className="inline-flex items-center justify-center gap-1.5 h-11 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create account
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Explore</p>
                {NAV.map((item, i) => (
                  <MenuRow key={item.to} item={item} index={i} />
                ))}

                {isAuthenticated && (
                  <>
                    <p className="px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Your account</p>
                    <MenuRow item={{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", hint: "Listings, offers and alerts" }} index={3} />
                    <MenuRow item={{ to: "/profile", icon: User, label: "Profile", hint: "Details, password and settings" }} index={4} />
                    {isAdmin && <MenuRow item={{ to: "/admin", icon: FolderDot, label: "Admin console", hint: "Manage the marketplace" }} index={5} />}
                  </>
                )}
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)]">
                {isAuthenticated && (
                  <button
                    onClick={signOut}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 mb-3 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                )}
                <div className="flex items-center justify-between text-[12.5px] text-gray-500">
                  <Link to="/contact" className="inline-flex items-center gap-1.5 hover:text-gray-900">
                    <Phone className="w-3.5 h-3.5" />
                    Contact us
                  </Link>
                  <Link to="/privacy" className="inline-flex items-center gap-1.5 hover:text-gray-900">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Privacy
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AuthModals openType={authModal} onClose={() => setAuthModal(null)} />
    </>
  );
};

function MenuRow({ item, index }) {
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 + index * 0.035, duration: 0.22 }}>
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-red-50" : "hover:bg-gray-50"}`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`grid place-items-center w-10 h-10 rounded-lg shrink-0 transition-colors ${
                isActive ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[15px] font-medium ${isActive ? "text-red-700" : "text-gray-900"}`}>{item.label}</span>
              {item.hint && <span className="block text-[12.5px] text-gray-500 truncate">{item.hint}</span>}
            </span>
            <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? "text-red-500" : "text-gray-300"}`} />
          </>
        )}
      </NavLink>
    </motion.div>
  );
}

export default Navbar;
