// src/contexts/SidebarContext.jsx
import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
  sidebarCollapsed: true,
  setSidebarCollapsed: () => {},
  isDashboardPage: false,
  setIsDashboardPage: () => {},
});

export const SidebarProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDashboardPage, setIsDashboardPage] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        isDashboardPage,
        setIsDashboardPage,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export default SidebarContext;
