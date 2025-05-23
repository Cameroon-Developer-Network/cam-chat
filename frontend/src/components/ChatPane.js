import React from 'react';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatPane = () => {
  const { selectedChat, goBackToSidebar, isMobileView } = useChat();

  if (!selectedChat) return null;

  return (
    <div className="h-full flex flex-col bg-whatsapp-chat-bg dark:bg-whatsapp-chat-bg-dark">
      {/* Chat Header */}
      <div className="bg-whatsapp-header dark:bg-whatsapp-header-dark p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {isMobileView && (
            <button
              onClick={goBackToSidebar}
              className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          
          <div className="relative">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedChat.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div>
            <h2 className="text-white font-medium">{selectedChat.name}</h2>
            <p className="text-white/70 text-sm">
              {selectedChat.online ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Video className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatPane;