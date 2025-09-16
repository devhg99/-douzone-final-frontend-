import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage?.(message);
      setMessage('');
      // 메시지 전송 후 입력창에 포커스 유지
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 컴포넌트 마운트 시 입력창에 자동 포커스
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "AI가 응답 중입니다..." : "메시지를 입력하세요..."}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667EEA] focus:border-transparent bg-white shadow-sm transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-400'
          }`}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white rounded-lg hover:from-[#5A67D8] hover:to-[#6B46C1] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 