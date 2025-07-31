import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentDate] = useState('2025년 7월 29일 (화)');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      navigate('/');
    }
  };

  const handleQuickAction = (action) => {
    console.log(`${action} 클릭됨`);
    setIsChatOpen(true);
    // AI 챗봇 열기 로직
  };

  const sidebarMenus = [
    {
      category: '학사 관리',
      items: [
        { icon: '📊', name: '출결 관리', path: '/attendance' },
        { icon: '📈', name: '성적 평가', path: '/grades' },
        { icon: '📝', name: '진도 및 과제 관리', path: '/homework' },
        { icon: '📋', name: '보고서 작성', path: '/reports' }
      ]
    },
    {
      category: '생활·상담',
      items: [
        { icon: '💬', name: '상담 관리', path: '/counseling' },
        { icon: '⚖️', name: '생활지도', path: '/behavior' },
        { icon: '👥', name: '학생 특이사항', path: '/students' }
      ]
    },
    {
      category: '소통',
      items: [
        { icon: '📋', name: '가정통신문', path: '/letter' },
        { icon: '📢', name: '공지사항', path: '/notices' },
        { icon: '📞', name: '학부모 연락', path: '/parent-contact' }
      ]
    },
    {
      category: '일정 관리',
      items: [
        { icon: '📅', name: '학급 일정', path: '/schedule' },
        { icon: '🕐', name: '시간표 관리', path: '/timetable' },
        { icon: '🎉', name: '교내 행사', path: '/events' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <div className="w-64 bg-slate-700 text-white">
        {/* 학교 정보 */}
        <div className="p-6 border-b border-slate-600">
          <h1 className="text-xl font-bold">티볼초등학교</h1>
          <p className="text-slate-300 text-sm">6학년 2반</p>
        </div>

        {/* 대시보드 메뉴 (현재 활성화) */}
        <div className="p-4">
          <div className="bg-blue-600 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <span className="text-lg mr-3">🏠</span>
              <span className="font-medium">대시보드</span>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="px-4 pb-4">
          {sidebarMenus.map((menu, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
                {menu.category}
              </h3>
              {menu.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => console.log(`${item.name} 클릭`)}
                  className="w-full flex items-center px-3 py-2 text-slate-300 hover:bg-slate-600 hover:text-white rounded-lg transition-colors duration-200 mb-1"
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
              <p className="text-gray-600 mt-1">6학년 2반 - {currentDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <span className="mr-2">👤</span>
                <span className="font-medium">김선생님</span>
              </div>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg"
              >
                🤖
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                설정
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 p-8">
          {/* 환영 섹션 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-8 shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">6학년 2반 김선생님 환영합니다! 👋</h2>
              <p className="text-blue-100 mb-6">AI 교사 업무 지원 시스템으로 업무 효율성을 높여보세요</p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-white bg-opacity-20 border-2 border-white text-white px-6 py-3 rounded-full hover:bg-opacity-30 transition-all duration-200 font-medium"
              >
                💬 AI 챗봇과 대화 시작하기
              </button>
            </div>
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-3 gap-6">
            {/* 학급 정보 카드 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-blue-500 text-xl mr-3">📚</span>
                  <h3 className="text-lg font-semibold text-gray-800">학급 정보</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-2xl mr-2">📋</span>
                    </div>
                    <div className="text-sm text-gray-600">학급</div>
                    <div className="text-lg font-semibold text-gray-800">6학년 2반</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-2xl mr-2">📊</span>
                    </div>
                    <div className="text-sm text-gray-600">출석률</div>
                    <div className="text-lg font-semibold text-gray-800">96.4%</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-2xl mr-2">💬</span>
                    </div>
                    <div className="text-sm text-gray-600">이번 주 상담</div>
                    <div className="text-lg font-semibold text-gray-800">5건</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 빠른 업무 처리 카드 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <span className="text-purple-500 text-xl mr-3">⚡</span>
                  <h3 className="text-lg font-semibold text-gray-800">빠른 업무 처리</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleQuickAction('상담일지 작성')}
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm font-medium text-gray-700">상담일지 작성</div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('시험지 출제')}
                    className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm font-medium text-gray-700">시험지 출제</div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('가정통신문 작성')}
                    className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <div className="text-2xl mb-2">✉️</div>
                    <div className="text-sm font-medium text-gray-700">가정통신문 작성</div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('생활기록부 작성')}
                    className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-medium text-gray-700">생활기록부 작성</div>
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 및 공지사항 카드 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <span className="text-orange-500 text-xl mr-3">🔔</span>
                  <h3 className="text-lg font-semibold text-gray-800">알림 및 공지사항</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="font-medium text-gray-800 mb-1">새로운 기능 업데이트</div>
                    <div className="text-sm text-gray-600">생활기록부 문구 추천 기능이 추가되었습니다.</div>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <div className="font-medium text-gray-800 mb-1">사용법 가이드</div>
                    <div className="text-sm text-gray-600">AI 챗봇 활용 가이드를 확인해보세요.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI 챗봇 오버레이 (임시) */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI 챗봇</h3>
              <p className="text-gray-600 mb-6">AI 챗봇 기능이 준비 중입니다.</p>
              <button
                onClick={() => setIsChatOpen(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;