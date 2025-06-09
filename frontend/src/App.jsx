import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/homepage/home";
import { Navbar } from "./components/navbar/navbar";
import DashboardPage from "./components/dashboard/userDashboard";
import MarketplacePage from "./components/marketplace/marketplace";
import AboutPage from "./components/about/about";
import BuyMyCarPage from "./components/buymycar/buymycar";
import ProfilePage from "./components/profile/profile";
import AdminDashboard from "./components/dashboard/adminDashboard";
import CarDetailsPage from "./components/marketplace/vehicleDetails";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/vehicles/:vehicleId" element={<CarDetailsPage />} />
        <Route path="/sell" element={<BuyMyCarPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
