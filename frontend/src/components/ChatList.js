import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut } from 'react-feather';

const ChatList = ({ chats, selectedChat, onChatSelect, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <div className={`p-4 flex justify-between items-center border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h1 className="text-xl font-semibold">Chats</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats available
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedChat?.id === chat.id
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {chat.name[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium truncate">
                      {chat.name}
                    </p>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-500">
                        {new Date(chat.lastMessage.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 