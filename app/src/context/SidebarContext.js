import React, { createContext, useState, useContext } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Default to collapsed on mobile devices (width < 768px)
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  return (
    <SidebarContext.Provider value={{ isSidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};
