import React from 'react';
import Layout from './Layout'; 
import HomePage from "./components/homepage/home";
import MarketplacePage from "./components/marketplace/marketplace";
import CarDetailsPage from "./components/marketplace/vehicleDetails";

// IMPORTANT: Export as DEFAULT
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'vehicles/:vehicleId', element: <CarDetailsPage /> },
    ],
  },
];

export default routes;