import React from 'react';
import { useChat } from '../context/ChatContext';

const ChatItem = ({ chat }) => {
  const { selectedChatId, selectChat } = useChat();
  const isSelected = selectedChatId === chat.id;

  return (
    <div
      onClick={() => selectChat(chat.id)}
      className={`
        p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors
        ${isSelected ? 'bg-whatsapp-green/10 dark:bg-whatsapp-green/20' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {chat.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {chat.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {chat.timestamp}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {chat.lastMessage}
            </p>
            {chat.unreadCount > 0 && (
              <span className="bg-whatsapp-green text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;