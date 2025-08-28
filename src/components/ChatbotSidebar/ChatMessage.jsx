import React from 'react';

const ChatMessage = ({ message, isUser = false }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white' 
          : 'bg-white text-slate-800 border border-slate-200'
      }`}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap overflow-hidden">{message || '안녕하세요! 무엇을 도와드릴까요?'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 