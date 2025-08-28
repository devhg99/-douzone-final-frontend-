import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendChatMessage } from '../../api/chatbot';

const ChatbotSidebar = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "안녕하세요! 교사 업무를 도와드릴 수 있는 AI 어시스턴트입니다. 무엇을 도와드릴까요?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userMessage, silent = false) => {
    if (!userMessage.trim()) return;

    // 사용자 메시지 추가 (silent 모드가 아닐 때만)
    if (!silent) {
      const userMsg = {
        id: Date.now(),
        message: userMessage,
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMsg]);
    }
    
    setIsLoading(true);

    try {
      // AI 응답 요청
      const response = await sendChatMessage(userMessage);
      
      // AI 응답 추가
      const aiMsg = {
        id: Date.now() + 1,
        message: response.response || "죄송합니다. 응답을 생성할 수 없습니다.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('챗봇 응답 오류:', error);
      
      // 에러 메시지 추가
      const errorMsg = {
        id: Date.now() + 1,
        message: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

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
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id}
                message={msg.message} 
                isUser={msg.isUser}
                onSendMessage={handleSendMessage}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#667EEA] to-[#764BA2] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white p-6">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </>
  );
};

export default ChatbotSidebar; 