import React from 'react';
import { useChat } from '../context/ChatContext';
import { useLayout } from '../context/LayoutContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatLayout = () => {
  const { currentChat, chatList, messages, sendMessage, selectChat } = useChat();
  const { isMobile, currentView, showChat, showSidebar } = useLayout();
  const { isDarkMode } = useTheme();
  const { logout } = useAuth();

  const handleChatSelect = (chat) => {
    selectChat(chat);
    if (isMobile) {
      showChat();
    }
  };

  const handleBack = () => {
    showSidebar();
  };

  return (
    <div
      className={`h-screen flex ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {(!isMobile || currentView === 'sidebar') && (
        <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <ChatList
            chats={chatList}
            selectedChat={currentChat}
            onChatSelect={handleChatSelect}
            onLogout={logout}
          />
        </div>
      )}

      {(!isMobile || currentView === 'chat') && (
        <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
          <ChatWindow
            chat={currentChat}
            messages={messages}
            onSendMessage={sendMessage}
            onBack={isMobile ? handleBack : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default ChatLayout;