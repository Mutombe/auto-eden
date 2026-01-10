import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from "./components/navbar/navbar";
import Footer from "./components/navbar/footer";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* This is the key for nested routing */}
      </main>
      <Footer />
    </>
  );
}