import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const { setIsTyping, selectedChat } = useChat();
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Mock send message (would integrate with backend here)
      console.log('Sending message:', message);
      setMessage('');
      setIsUserTyping(false);
      setIsTyping(false);
      
      // Clear any existing typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    if (e.target.value.trim()) {
      // User is typing
      if (!isUserTyping) {
        setIsUserTyping(true);
        setIsTyping(true);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsUserTyping(false);
        setIsTyping(false);
      }, 2000);
    } else {
      // User stopped typing
      setIsUserTyping(false);
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Reset typing when chat changes
  useEffect(() => {
    setIsUserTyping(false);
    setIsTyping(false);
    setMessage('');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [selectedChat?.id, setIsTyping]);

  return (
    <div className="bg-whatsapp-sidebar dark:bg-whatsapp-sidebar-dark border-t border-gray-200 dark:border-gray-700">
      {/* Typing Indicator */}
      {isUserTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-whatsapp-green rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-whatsapp-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-whatsapp-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>You are typing...</span>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          {/* Attach Button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-whatsapp-green dark:text-gray-400 dark:hover:text-whatsapp-green hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-all duration-200"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent transition-all duration-200"
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-whatsapp-green dark:text-gray-400 dark:hover:text-whatsapp-green transition-all duration-200"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className={`
              p-3 rounded-full transition-all duration-200 transform
              ${message.trim() 
                ? 'bg-whatsapp-green hover:bg-whatsapp-green-dark text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;