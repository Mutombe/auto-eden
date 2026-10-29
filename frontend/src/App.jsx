//App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { IconProvider } from "./components/ui/icons";
import HomePage from "./components/homepage/home";
import { Navbar } from "./components/navbar/navbar";
import Footer from "./components/navbar/footer";
import ErrorBoundary from "./components/error/ErrorBoundary";
import ChatWidget from './components/ai/ChatWidget';
import CookieConsent from './components/legal/CookieConsent';
import {
  AdminConsoleSkeleton,
  GenericPageSkeleton,
  MarketplacePageSkeleton,
  VehicleDetailSkeleton,
} from "./components/skeletons/PageSkeletons";

// Every route except the landing page is its own chunk, so the homepage doesn't download
// the admin console, spreadsheet exporter, dashboards, etc.
const DashboardPage = lazy(() => import("./components/dashboard/userDashboard"));
const MarketplacePage = lazy(() => import("./components/marketplace/marketplace"));
const AboutPage = lazy(() => import("./components/about/about"));
const BuyMyCarPage = lazy(() => import("./components/buymycar/buymycar"));
const LearnPage = lazy(() => import("./pages/learn"));
const SuggestionsPage = lazy(() => import("./pages/suggestion-box"));
const HiringPage = lazy(() => import("./pages/hiring"));
const ReviewsPage = lazy(() => import("./pages/reviews"));
const ArticlePage = lazy(() => import("./pages/articles"));
const NewsPage = lazy(() => import("./pages/new-page"));
const ProfilePage = lazy(() => import("./components/profile/profile"));
const AdminConsole = lazy(() => import("./components/admin/AdminConsole"));
const CarDetailsPage = lazy(() => import("./components/marketplace/vehicleDetails"));
const ContactPage = lazy(() => import("./pages/contact"));
const PrivacyPolicyPage = lazy(() => import("./pages/legal/PrivacyPolicy"));
const CookiePolicyPage = lazy(() => import("./pages/legal/CookiePolicy"));

// Likely next stops from the landing page: fetch their code once the browser is idle.
const warmRoutes = () => {
  import("./components/marketplace/marketplace");
  import("./components/marketplace/vehicleDetails");
};
import { SidebarProvider } from "./contexts/SidebarContext";
import { setLogoutCallback } from "./utils/api";
import { logout } from "./redux/slices/authSlice";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// The admin console has its own full-screen layout: no public navbar/footer/chat there.
const SiteChrome = ({ children }) => {
  const { pathname } = useLocation();
  return pathname.startsWith("/admin") ? null : children;
};

// Scoped loading: only the page area waits for a route's code; the navbar/footer stay put.
// The fallback is shaped like the page being opened.
const RouteFallback = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return <AdminConsoleSkeleton />;
  if (pathname.startsWith("/marketplace")) return <MarketplacePageSkeleton />;
  if (pathname.startsWith("/vehicles/")) return <VehicleDetailSkeleton />;
  return <GenericPageSkeleton />;
};

// Component to set up auth logout callback for session expiry
const AuthSetup = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Set the logout callback so api.js can dispatch logout on session expiry
    setLogoutCallback(() => {
      dispatch(logout());
    });

    // Cleanup on unmount
    return () => {
      setLogoutCallback(null);
    };
  }, [dispatch]);

  return null;
};

function App() {
  useEffect(() => {
    const id = "requestIdleCallback" in window ? window.requestIdleCallback(warmRoutes, { timeout: 4000 }) : setTimeout(warmRoutes, 2500);
    return () => ("cancelIdleCallback" in window ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <IconProvider>
    <div className="pacaembu-font">
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />
      <BrowserRouter>
        <SidebarProvider>
          <ScrollToTop />
          <AuthSetup />
          <SiteChrome><Navbar /></SiteChrome>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/hiring" element={<HiringPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/vehicles/:vehicleId" element={<CarDetailsPage />} />
          <Route path="/learn/:articleId" element={<ArticlePage />} />
          <Route path="/sell" element={<BuyMyCarPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/*" element={<ErrorBoundary><AdminConsole /></ErrorBoundary>} />
          </Routes>
          </Suspense>
          <SiteChrome>
            <Footer />
            <ChatWidget />
            <CookieConsent />
          </SiteChrome>
        </SidebarProvider>
      </BrowserRouter>
    </>
    </div>
    </IconProvider>
    </QueryClientProvider>
  );
}
export default App;
