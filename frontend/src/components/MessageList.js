import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';

const MessageList = () => {
  const { chatMessages, isTyping } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      {/* WhatsApp-style background pattern */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30v60c16.569 0 30-13.431 30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative z-10">
        {chatMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white dark:bg-whatsapp-message-received-dark rounded-lg p-3 max-w-xs shadow-sm">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-500 text-sm ml-2">Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;