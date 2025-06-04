import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Send, Check, CheckCheck } from 'react-feather';
import { useChat } from '../context/ChatContext';
import debounce from 'lodash/debounce';

const MessageStatus = ({ status }) => {
  switch (status) {
    case 'sent':
      return <Check size={16} className="text-gray-400" />;
    case 'delivered':
      return <CheckCheck size={16} className="text-gray-400" />;
    case 'seen':
      return <CheckCheck size={16} className="text-blue-500" />;
    default:
      return null;
  }
};

const ChatWindow = ({ chat, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();
  const {
    messages,
    loading,
    loadingMore,
    hasMore,
    typingUsers,
    messageStatuses,
    sendMessage,
    sendTypingStatus,
    loadMoreMessages,
    isConnected,
  } = useChat();
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastScrollHeightRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loadingMore) {
      scrollToBottom();
    }
  }, [messages, loadingMore]);

  // Preserve scroll position when loading more messages
  useEffect(() => {
    if (loadingMore && messagesContainerRef.current) {
      const scrollDiff = messagesContainerRef.current.scrollHeight - lastScrollHeightRef.current;
      messagesContainerRef.current.scrollTop += scrollDiff;
    }
  }, [messages, loadingMore]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMore) return;

    if (container.scrollTop <= 100) {
      lastScrollHeightRef.current = container.scrollHeight;
      loadMoreMessages();
    }
  }, [loadingMore, hasMore, loadMoreMessages]);

  const debouncedTypingStatus = useCallback(
    debounce((isTyping) => {
      sendTypingStatus(isTyping);
    }, 500),
    [sendTypingStatus]
  );

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    debouncedTypingStatus(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected()) return;

    try {
      setError(null);
      await sendMessage(newMessage.trim());
      setNewMessage('');
      debouncedTypingStatus(false);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className={`p-4 flex items-center space-x-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            {chat.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{chat.name}</h2>
            {chat.online && (
              <p className="text-xs text-green-500">online</p>
            )}
            {typingUsers.size > 0 && (
              <p className="text-xs text-gray-500">typing...</p>
            )}
          </div>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {loading && !loadingMore ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        ) : (
          <>
            {loadingMore && (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isSelf ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isSelf
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <p className="text-xs opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                    {message.isSelf && (
                      <MessageStatus status={messageStatuses[message.id]} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && (
        <div className="p-2 text-center text-red-500 text-sm bg-red-100 dark:bg-red-900">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={isConnected() ? "Type a message" : "Connecting..."}
            disabled={!isConnected()}
            className={`flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 text-white disabled:bg-gray-800'
                : 'bg-gray-100 text-gray-900 disabled:bg-gray-200'
            } disabled:cursor-not-allowed`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected()}
            className={`p-2 rounded-full ${
              newMessage.trim() && isConnected()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 