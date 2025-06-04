import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentView, setCurrentView] = useState('sidebar'); // 'sidebar' or 'chat'

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Reset to sidebar view when switching to mobile and no chat is selected
      if (mobile && currentView === 'chat') {
        setCurrentView('sidebar');
      }
      // On desktop, always show both
      if (!mobile) {
        setCurrentView('both');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentView]);

  const showChat = () => {
    setCurrentView('chat');
  };

  const showSidebar = () => {
    setCurrentView('sidebar');
  };

  return (
    <LayoutContext.Provider
      value={{
        isMobile,
        currentView,
        showChat,
        showSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}; 