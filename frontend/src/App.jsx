//App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./components/homepage/home";
import { Navbar } from "./components/navbar/navbar";
import Footer from "./components/navbar/footer";
import DashboardPage from "./components/dashboard/userDashboard";
import MarketplacePage from "./components/marketplace/marketplace";
import AboutPage from "./components/about/about";
import BuyMyCarPage from "./components/buymycar/buymycar";
import LearnPage from "./pages/learn";
import SuggestionsPage from "./pages/suggestion-box";
import HiringPage from "./pages/hiring";
import ReviewsPage from './pages/reviews'
import ArticlePage from './pages/articles'
import NewsPage from './pages/new-page'
import ProfilePage from "./components/profile/profile";
import AdminDashboard from "./components/dashboard/adminDashboard";
import CarDetailsPage from "./components/marketplace/vehicleDetails";
import ContactPage from './pages/contact';
import ChatWidget from './components/ai/ChatWidget';
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
  return (
    <div className="pacaembu-font">
                <style jsx>{`
            /* Pacaembu Font Faces */
            @font-face {
              font-family: "Pacaembu";
              src: url("./fonts/Pacaembu-Thin-Trial.ttf") format("truetype");
              font-weight: 100;
              font-style: normal;
              font-display: swap;
            }

            @font-face {
              font-family: "Pacaembu";
              src: url("./fonts/Pacaembu-Light-Trial.ttf") format("truetype");
              font-weight: 300;
              font-style: normal;
              font-display: swap;
            }

            @font-face {
              font-family: "Pacaembu";
              src: url("./fonts/Pacaembu-Regular-Trial.ttf") format("truetype");
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }

            @font-face {
              font-family: "Pacaembu";
              src: url("./fonts/Pacaembu-Medium-Trial.ttf") format("truetype");
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }

            @font-face {
              font-family: "Pacaembu";
              src: url("./fonts/Pacaembu-Bold-Trial.ttf") format("truetype");
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }

            @font-face {
              font-family: "Pacaembu";
              src: url("./fonts/Pacaembu-Black-Trial.ttf") format("truetype");
              font-weight: 900;
              font-style: normal;
              font-display: swap;
            }

            @font-face {
              font-family: "Pacaembu";
              src: url("./fonts/Pacaembu-Ultra-Trial.ttf") format("truetype");
              font-weight: 950;
              font-style: normal;
              font-display: swap;
            }

            .pacaembu-font {
              font-family: "Pacaembu", "Inter", "Segoe UI", Tahoma, Geneva,
                Verdana, sans-serif;
            }
          `}</style>
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
          <Navbar />
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/hiring" element={<HiringPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/vehicles/:vehicleId" element={<CarDetailsPage />} />
          <Route path="/learn/:articleId" element={<ArticlePage />} />
          <Route path="/sell" element={<BuyMyCarPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Footer />
          <ChatWidget />
        </SidebarProvider>
      </BrowserRouter>
    </>
    </div>
  );
}
export default App;
