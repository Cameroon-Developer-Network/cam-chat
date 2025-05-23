import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout';
import './App.css';

function App() {
  return (
    <ChatProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<ChatLayout />} />
            <Route path="/chat/:chatId" element={<ChatLayout />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ChatProvider>
  );
}

export default App;