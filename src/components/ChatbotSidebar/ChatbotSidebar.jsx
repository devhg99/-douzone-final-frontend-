import React from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatbotSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50 border-l border-slate-200 flex flex-col`}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">AI 교사 어시스턴트</h2>
              <p className="text-sm opacity-90">업무 지원 챗봇</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 space-y-4">
            <ChatMessage message="안녕하세요! 교사 업무를 도와드릴 수 있는 AI 어시스턴트입니다. 무엇을 도와드릴까요?" isUser={false} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white p-6">
          <ChatInput />
        </div>
      </div>
    </>
  );
};

export default ChatbotSidebar; 