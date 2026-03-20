import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [environment, setEnvironment] = useState(localStorage.getItem('selectedEnv') || 'production');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedEnv', environment);
    setRefreshTrigger(prev => prev + 1); // Trigger Refresh
  }, [environment]);

  const updateEnvironment = (newEnv) => {
    setEnvironment(newEnv);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AppContext.Provider value={{ 
      environment, 
      updateEnvironment, 
      refreshTrigger,
      isSidebarOpen,
      toggleSidebar,
      closeSidebar
    }}>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => useContext(AppContext);
