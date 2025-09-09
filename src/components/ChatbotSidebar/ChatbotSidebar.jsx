import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendChatMessage } from '../../api/chatbot';
import useUIStore from '../../store/useUIStore';

const ChatbotSidebar = ({ isOpen, onClose }) => {
  const messagesEndRef = useRef(null);
  const { triggerEventRefresh } = useUIStore();
  const location = useLocation();
  
  // URL 경로에 따른 초기 탭 설정
  const getInitialTab = useCallback(() => {
    switch (location.pathname) {
      case '/schedule':
        return 'schedule';
      case '/problem-writing':
        return 'exam';
      case '/dashboard':
      default:
        return 'attendance';
    }
  }, [location.pathname]);
  
  // 슬라이드 탭 상태 관리
  const [sidebarWidth, setSidebarWidth] = useState(700);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  
  // 각 탭별로 메시지를 별도 관리
  const [tabMessages, setTabMessages] = useState({
    attendance: [{
      id: 1,
      message: "출결 관리 업무를 도와드리겠습니다! 출석 현황 확인, 결석자 추출, 출결 통계 생성, 출결 관리 등 출결 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    consultation: [{
      id: 1,
      message: "상담 업무를 도와드리겠습니다! 학생 상담, 학부모 상담, 상담일지 작성 등 무엇이든 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    schedule: [{
      id: 1,
      message: "일정 관리 업무를 도와드리겠습니다! 오늘 일정 확인, 일정 추가, 수정, 삭제 등 일정 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    exam: [{
      id: 1,
      message: "시험지 관련 업무를 도와드리겠습니다! 문제지 생성, 시험지 관리, 문제 수정, 정답 확인 등 시험지 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    notice: [{
      id: 1,
      message: "공지사항 관리 업무를 도와드리겠습니다! 공지사항 조회, 공지사항 작성, 공지사항 수정, 공지사항 관리 등 공지사항 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }],
    grades: [{
      id: 1,
      message: "성적 관리 업무를 도와드리겠습니다! 성적 입력, 성적 분석, 성적 통계 생성, 성적 리포트 작성, 성적 관리 등 성적 관련 모든 업무를 도와드릴 수 있습니다.",
      isUser: false,
      timestamp: new Date()
    }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // 현재 탭의 메시지 가져오기 (useMemo로 최적화)
  const messages = useMemo(() => {
    return tabMessages[activeTab] || [];
  }, [tabMessages, activeTab]);

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // URL 경로가 변경될 때 탭도 업데이트
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [getInitialTab]);

  // 드래그 리사이징 기능
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 400;
    const maxWidth = 1200;
    
    // 즉시 DOM 업데이트로 반응성 향상
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      // 실시간 DOM 업데이트
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    }
  }, [isResizing]);

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove]);

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
      
      setTabMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), userMsg]
      }));
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
      
      setTabMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), aiMsg]
      }));
      
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
      
      setTabMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), errorMsg]
      }));
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
      <div 
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform ${isResizing ? '' : 'transition-all duration-300 ease-in-out'} ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50 border-l border-slate-200 flex ${isResizing ? 'select-none' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        
        {/* 드래그 핸들 */}
        <div 
          className="w-2 bg-slate-200 hover:bg-slate-300 cursor-col-resize transition-colors duration-200 flex-shrink-0 relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-12 bg-slate-400 rounded-full group-hover:bg-slate-600 transition-colors duration-200"></div>
          </div>
          {/* 드래그 영역 확장 */}
          <div className="absolute inset-0 w-4 -left-1 cursor-col-resize"></div>
        </div>

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
                  onClick={() => setActiveTab('attendance')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'attendance'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  출결
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
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'schedule'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  일정
                </button>
                <button
                  onClick={() => setActiveTab('exam')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'exam'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  시험지
                </button>
                <button
                  onClick={() => setActiveTab('notice')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'notice'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  공지사항
                </button>
                <button
                  onClick={() => setActiveTab('grades')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'grades'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  성적
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
                 {activeTab === 'attendance' ? '출결 도우미' : 
                  activeTab === 'consultation' ? '상담 도우미' : 
                  activeTab === 'schedule' ? '일정 도우미' : 
                  activeTab === 'exam' ? '시험지 도우미' : 
                  activeTab === 'notice' ? '공지사항 도우미' : '성적 도우미'}
               </h2>
               <p className="text-sm text-gray-600 mt-1">
                 {activeTab === 'attendance'
                   ? '출석 현황 확인, 결석자 추출, 출결 통계 생성, 출결 관리'
                   : activeTab === 'consultation'
                   ? '학생 상담, 학부모 상담, 상담일지 작성'
                   : activeTab === 'schedule'
                   ? '오늘 일정 확인, 일정 추가, 수정, 삭제, 일정 관리'
                   : activeTab === 'exam'
                   ? '문제지 생성, 시험지 관리, 문제 수정, 정답 확인, 시험지 관련 업무'
                   : activeTab === 'notice'
                   ? '공지사항 조회, 공지사항 작성, 공지사항 수정, 공지사항 관리'
                   : '성적 입력, 성적 분석, 성적 통계 생성, 성적 리포트 작성, 성적 관리'
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
                  timestamp={msg.timestamp}
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