// Auto Eden admin console: ERP-style back office for vehicles, bids, quotes and users.
import React, { Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Car, FileText, Gavel, LayoutDashboard, LogOut, Menu as MenuIcon, ExternalLink, ShieldAlert, Users, X,
} from "../ui/icons";
import { login, logout } from "../../redux/slices/authSlice";
import { resources } from "./lib/adminApi";
import { keys } from "./lib/optimistic";
import { Avatar, Button, Card, cx, Field, Input } from "./ui/primitives";
import { whenIdle } from "../../lib/progressive";
import { IconProvider } from "../ui/icons";
import { AdminPageSkeleton } from "../skeletons/PageSkeletons";

// Each page is its own chunk; hovering its nav item (or idle time) loads it ahead of the click.
const pageLoaders = {
  overview: () => import("./pages/OverviewPage"),
  vehicles: () => import("./pages/VehiclesPage"),
  bids: () => import("./pages/BidsPage"),
  quotes: () => import("./pages/QuotesPage"),
  users: () => import("./pages/UsersPage"),
};
const OverviewPage = lazy(pageLoaders.overview);
const VehiclesPage = lazy(pageLoaders.vehicles);
const BidsPage = lazy(pageLoaders.bids);
const QuotesPage = lazy(pageLoaders.quotes);
const UsersPage = lazy(pageLoaders.users);

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true, page: "overview" },
  { to: "/admin/vehicles", label: "Vehicles", icon: Car, badge: "pending", page: "vehicles" },
  { to: "/admin/bids", label: "Bids", icon: Gavel, page: "bids" },
  { to: "/admin/quotes", label: "Quote requests", icon: FileText, page: "quotes" },
  { to: "/admin/users", label: "Users", icon: Users, page: "users" },
];

function Sidebar({ onNavigate }) {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const user = useSelector((s) => s.auth.user);
  const { data: summary } = useQuery({ queryKey: keys.summary("vehicles"), queryFn: resources.vehicles.summary });

  return (
    <div className="flex flex-col h-full">
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-200/80 shrink-0">
        <img src="/Auto-eden-favicon.png" alt="" className="w-7 h-7 rounded-md" onError={(e) => (e.currentTarget.style.display = "none")} />
        <div className="leading-tight">
          <div className="text-[14px] font-semibold text-gray-900">Auto Eden</div>
          <div className="text-[11px] text-gray-500">Admin console</div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        <div className="px-2 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Workspace</div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            onMouseEnter={() => pageLoaders[item.page]()}
            onFocus={() => pageLoaders[item.page]()}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
                isActive ? "bg-white text-gray-900 shadow-xs ring-1 ring-gray-200" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cx("w-[18px] h-[18px]", isActive ? "text-red-600" : "text-gray-400")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && summary?.[item.badge] > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-md bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center tabular-nums">
                    {summary[item.badge]}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2.5 border-t border-gray-200/80 space-y-0.5">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13.5px] font-medium text-gray-600 hover:bg-gray-200/50 hover:text-gray-900">
          <ExternalLink className="w-[18px] h-[18px] text-gray-400" /> View website
        </a>
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <Avatar name={user?.username} size={30} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[13px] font-semibold text-gray-900 truncate">{user?.username}</div>
            <div className="text-[11.5px] text-gray-500 truncate">{user?.email}</div>
          </div>
          <Button variant="ghost" size="iconSm" icon={LogOut} aria-label="Sign out" onClick={() => { qc.removeQueries({ queryKey: ["admin"] }); dispatch(logout()); }} />
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  const current = [...NAV].reverse().find((n) => location.pathname.startsWith(n.to)) || NAV[0];

  // After the first page settles, fetch the other pages' code in the background.
  useEffect(() => whenIdle(() => Object.values(pageLoaders).forEach((load) => load()), 3000), []);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 bg-gray-100/80 border-r border-gray-200/80 z-30">
        <Sidebar />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-2 h-14 px-3 bg-white/90 backdrop-blur border-b border-gray-200">
        <Button variant="ghost" size="icon" icon={MenuIcon} onClick={() => setMobileNav(true)} aria-label="Open menu" />
        <current.icon className="w-[18px] h-[18px] text-red-600" />
        <span className="text-[15px] font-semibold">{current.label}</span>
      </header>
      <AnimatePresence>
        {mobileNav && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div className="absolute inset-0 bg-gray-950/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 bg-gray-50 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <button className="absolute right-3 top-4 p-1 rounded-md text-gray-500 hover:bg-gray-200" onClick={() => setMobileNav(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
              <Sidebar onNavigate={() => setMobileNav(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="lg:pl-60">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-24">
          {/* Scoped loading: only this area waits; the sidebar and header never unmount. */}
          <Suspense fallback={<AdminPageSkeleton />}>
          <Routes>
            <Route index element={<OverviewPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="bids" element={<BidsPage />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function AdminSignIn() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dispatch(login(form)).unwrap();
    } catch (err) {
      setError(err?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-lg bg-white ring-1 ring-gray-200 shadow-sm grid place-items-center mb-4 overflow-hidden">
          <img src="/Auto-eden-favicon.png" alt="Auto Eden" className="w-9 h-9 object-contain" />
        </div>
        <h1 className="text-lg font-semibold">Admin sign in</h1>
        <p className="text-sm text-gray-500 mb-5">Auto Eden back office</p>
        <form onSubmit={submit} className="space-y-3.5">
          <Field label="Username">
            <Input autoFocus value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" />
          </Field>
          <Field label="Password" error={error}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
          </Field>
          <Button type="submit" variant="primary" size="md" className="w-full justify-center" loading={loading}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}

function NoAccess() {
  const dispatch = useDispatch();
  return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 text-center">
        <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h1 className="text-lg font-semibold">No admin access</h1>
        <p className="text-sm text-gray-500 mt-1 mb-5">This account isn't a staff account. Sign in with an admin account to continue.</p>
        <div className="flex gap-2 justify-center">
          <Link to="/"><Button>Back to site</Button></Link>
          <Button variant="primary" onClick={() => dispatch(logout())}>Switch account</Button>
        </div>
      </Card>
    </div>
  );
}

// The back office uses single-tone icons; the public site keeps duotone.
export default function AdminConsole() {
  return (
    <IconProvider weight="regular">
      <AdminGate />
    </IconProvider>
  );
}

function AdminGate() {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <AdminSignIn />;
  if (!user.is_staff && !user.is_superuser) return <NoAccess />;
  return <Shell />;
}
