
import { AuthProvider } from './context/AuthContext.js';
import React from 'react';
import AppContent from './AppContent';
import { HashRouter } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext.js';
import { WebSocketProvider } from './context/WebSocketContext.js';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <WebSocketProvider>
          <SidebarProvider> {/* Wrap AppContent with SidebarProvider */}
            <AppContent />
          </SidebarProvider>
        </WebSocketProvider>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
