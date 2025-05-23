import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const { setIsTyping } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Mock send message (would integrate with backend here)
      console.log('Sending message:', message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Simulate typing indicator
    if (e.target.value.trim()) {
      setIsTyping(true);
      // Clear typing after a delay
      setTimeout(() => setIsTyping(false), 2000);
    } else {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-whatsapp-sidebar dark:bg-whatsapp-sidebar-dark p-4 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Attach Button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message"
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className={`
            p-3 rounded-full transition-all duration-200
            ${message.trim() 
              ? 'bg-whatsapp-green hover:bg-whatsapp-green-dark text-white shadow-md hover:shadow-lg' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;