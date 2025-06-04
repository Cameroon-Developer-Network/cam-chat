import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LayoutProvider } from './context/LayoutContext';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LayoutProvider>
            <ChatProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/chat/*"
                  element={
                    <PrivateRoute>
                      <ChatLayout />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/chat" replace />} />
              </Routes>
            </ChatProvider>
          </LayoutProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;