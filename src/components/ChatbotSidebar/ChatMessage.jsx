import React from 'react';

const ChatMessage = ({ message, isUser = false }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white' 
          : 'bg-white text-slate-800 border border-slate-200'
      }`}>
        <div className="flex items-start gap-2">
          {!isUser && (
            <div className="w-6 h-6 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{message || '안녕하세요! 무엇을 도와드릴까요?'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 