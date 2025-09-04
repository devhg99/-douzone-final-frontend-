import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendChatMessage } from '../../api/chatbot';
import useUIStore from '../../store/useUIStore';

const ChatbotSidebar = ({ isOpen, onClose }) => {
  const messagesEndRef = useRef(null);
  const { triggerEventRefresh } = useUIStore();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "안녕하세요! AI 업무 도우미입니다. 현재 제공하는 주요 기능들을 소개해드리겠습니다:\n\n문제지 생성: 과목별 맞춤형 문제지 자동 생성\n출결 관리: 출석 현황 정리, 결석자 추출, 통계 생성\n상담일지: 학생/학부모 상담 기록 및 관리\n성적 관리: 성적 입력, 분석, 리포트 생성\n일정 관리: 학교 행사, 시험 일정 등 관리\n\n어떤 업무를 도와드릴까요?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // 탭 변경 시 메시지 초기화
  useEffect(() => {
    const initialMessage = activeTab === 'consultation' 
      ? "상담 업무를 도와드리겠습니다! 학생 상담, 학부모 상담, 상담일지 작성 등 무엇이든 도와드릴 수 있습니다."
      : "안녕하세요! AI 업무 도우미입니다. 현재 제공하는 주요 기능들을 소개해드리겠습니다:\n\n문제지 생성: 과목별 맞춤형 문제지 자동 생성\n출결 관리: 출석 현황 정리, 결석자 추출, 통계 생성\n상담일지: 학생/학부모 상담 기록 및 관리\n성적 관리: 성적 입력, 분석, 리포트 생성\n일정 관리: 학교 행사, 시험 일정 등 관리\n\n어떤 업무를 도와드릴까요?";
    
    setMessages([{
      id: 1,
      message: initialMessage,
      isUser: false,
      timestamp: new Date()
    }]);
  }, [activeTab]);

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      // 일정 관련 작업인지 확인하고 프론트엔드 업데이트 트리거
      const isEventRelated = checkIfEventRelated(userMessage, response.response);
      if (isEventRelated) {
        triggerEventRefresh();
      }
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

  // 일정 관련 작업인지 확인하는 함수
  const checkIfEventRelated = (userMessage, aiResponse) => {
    const eventKeywords = ['일정', '추가', '등록', '삭제', '수정', '변경', '체육대회', '시험', '행사', '회의'];
    const successKeywords = ['성공', '추가되었습니다', '등록되었습니다', '삭제되었습니다', '수정되었습니다'];
    
    const hasEventKeyword = eventKeywords.some(keyword => 
      userMessage.includes(keyword) || (aiResponse && aiResponse.includes(keyword))
    );
    
    const hasSuccessKeyword = successKeywords.some(keyword => 
      aiResponse && aiResponse.includes(keyword)
    );
    
    return hasEventKeyword && hasSuccessKeyword;
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50 border-l border-slate-200 flex`}>
        
        {/* Left Sub Sidebar */}
        <div className="w-48 bg-[#667EEA] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-6 text-white">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="#667EEA" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold">AI 업무 도우미</h2>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 px-4">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/80 mb-3 px-2">주요 업무</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  주요 업무
                </button>
                <button
                  onClick={() => setActiveTab('consultation')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'consultation'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  상담
                </button>
              </div>
            </div>

            {/* Recent Conversations */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3 px-2">최근 대화</h3>
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs text-white/60 hover:text-white/80 cursor-pointer">
                  상담일지 작성 도움
                </div>
                <div className="px-3 py-2 text-xs text-white/60 hover:text-white/80 cursor-pointer">
                  학부모 상담 가이드
                </div>
                <div className="px-3 py-2 text-xs text-white/60 hover:text-white/80 cursor-pointer">
                  학생 상담 기록
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 bg-white border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview' ? 'AI 업무 도우미' : '상담 도우미'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'overview' 
                  ? '문제지 생성, 출결 관리, 상담일지, 성적 관리, 일정 관리' 
                  : '학생 상담, 학부모 상담, 상담일지 작성'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                      <div className="w-6 h-6 bg-[#667EEA] rounded-full flex items-center justify-center">
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
              {/* 스크롤을 위한 빈 div */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-white p-6">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotSidebar; 