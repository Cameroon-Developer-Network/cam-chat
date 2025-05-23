import React, { createContext, useContext, useState } from 'react';

// Mock data
const mockChats = [
  {
    id: '1',
    name: 'Alice Johnson',
    lastMessage: 'Hey! How are you doing?',
    timestamp: '10:30 AM',
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    online: true,
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '9:45 AM',
    unreadCount: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    online: false,
  },
  {
    id: '3',
    name: 'Team Project',
    lastMessage: 'Meeting at 3 PM today',
    timestamp: '8:20 AM',
    unreadCount: 5,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop&crop=face',
    online: true,
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    lastMessage: 'Can you send me the documents?',
    timestamp: 'Yesterday',
    unreadCount: 1,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    online: false,
  },
];

const mockMessages = {
  '1': [
    {
      id: '1',
      content: 'Hey! How are you doing?',
      sender: 'Alice Johnson',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: '2',
      content: 'I\'m doing great! Just working on some projects. How about you?',
      sender: 'You',
      timestamp: '10:32 AM',
      isOwn: true,
    },
    {
      id: '3',
      content: 'That sounds awesome! I\'d love to hear more about what you\'re working on.',
      sender: 'Alice Johnson',
      timestamp: '10:33 AM',
      isOwn: false,
    },
  ],
  '2': [
    {
      id: '1',
      content: 'Thanks for the help yesterday!',
      sender: 'Bob Smith',
      timestamp: '9:45 AM',
      isOwn: false,
    },
    {
      id: '2',
      content: 'No problem at all! Happy to help.',
      sender: 'You',
      timestamp: '9:46 AM',
      isOwn: true,
    },
  ],
  '3': [
    {
      id: '1',
      content: 'Meeting at 3 PM today',
      sender: 'Team Project',
      timestamp: '8:20 AM',
      isOwn: false,
    },
    {
      id: '2',
      content: 'I\'ll be there!',
      sender: 'You',
      timestamp: '8:25 AM',
      isOwn: true,
    },
    {
      id: '3',
      content: 'Great! See you all then.',
      sender: 'Team Project',
      timestamp: '8:26 AM',
      isOwn: false,
    },
  ],
  '4': [
    {
      id: '1',
      content: 'Can you send me the documents?',
      sender: 'Sarah Wilson',
      timestamp: 'Yesterday',
      isOwn: false,
    },
  ],
};

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats] = useState(mockChats);
  const [messages] = useState(mockMessages);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const selectedChat = selectedChatId ? chats.find(chat => chat.id === selectedChatId) : null;
  const chatMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  const selectChat = (chatId) => {
    setSelectedChatId(chatId);
    if (isMobileView) {
      setShowSidebar(false);
    }
  };

  const goBackToSidebar = () => {
    setShowSidebar(true);
    if (isMobileView) {
      setSelectedChatId(null);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const value = {
    chats,
    messages,
    selectedChatId,
    selectedChat,
    chatMessages,
    isDarkMode,
    isMobileView,
    showSidebar,
    isTyping,
    selectChat,
    goBackToSidebar,
    toggleDarkMode,
    setIsMobileView,
    setIsTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};