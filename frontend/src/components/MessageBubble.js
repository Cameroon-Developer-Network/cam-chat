import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const { content, timestamp, isOwn } = message;

  return (
    <div className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg shadow-sm
          ${isOwn 
            ? 'bg-whatsapp-message-sent text-gray-900 rounded-br-none' 
            : 'bg-white dark:bg-whatsapp-message-received-dark text-gray-900 dark:text-white rounded-bl-none'
          }
        `}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp}
          </span>
          
          {isOwn && (
            <div className="text-gray-500">
              {Math.random() > 0.5 ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;