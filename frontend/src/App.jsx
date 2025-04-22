import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/homepage/home';
import { Navbar } from './components/navbar/navbar';
import DashboardPage from './components/dashboard/userDashboard';
import MarketplacePage from './components/marketplace/marketplace';
import AboutPage from './components/about/about';
import BuyMyCarPage from './components/buymycar/buymycar';
import ProfilePage from './components/profile/profile';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path='/sell' element={< BuyMyCarPage />} />
        <Route path='/about' element={< AboutPage />} />
        <Route path='/profile' element={< ProfilePage/>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App
