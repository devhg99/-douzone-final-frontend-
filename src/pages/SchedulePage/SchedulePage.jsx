import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SchedulePage.css';
import { getMonthlyEvents, getWeeklyEvents, getEventColor } from '../../api/events';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 일정 추가 폼 상태
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_type: '시험/평가',
    date: new Date().toLocaleDateString('sv-SE')
  });
  const [addingEvent, setAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [popupDate, setPopupDate] = useState(null);
  const [popupEvents, setPopupEvents] = useState([]);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  // 이벤트 타입 옵션
  const eventTypes = [
    { value: '시험/평가', label: '시험/평가', color: 'event-red' },
    { value: '행사/활동', label: '행사/활동', color: 'event-green' },
    { value: '상담/회의', label: '상담/회의', color: 'event-orange' },
    { value: '캠페인', label: '캠페인', color: 'event-blue' },
    { value: '예방교육', label: '예방교육', color: 'event-purple' },
    { value: '업무회의', label: '업무회의', color: 'event-indigo' }
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // 날짜 클릭 핸들러 (팝업용)
  const handleDateClick = (date, event) => {
    const rect = event.target.getBoundingClientRect();
    const eventsForDate = getEventsForDate(date);
    
    setPopupDate(date);
    setPopupEvents(eventsForDate);
    setPopupPosition({
      top: rect.top - 10,
      left: rect.right + 10
    });
    setShowDetailPopup(true);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  };

  // 이벤트 데이터 가져오기
  const fetchEvents = async (year, month) => {
    setLoading(true);
    try {
      const eventsData = await getMonthlyEvents(year, month);
      setEvents(eventsData);
    } catch (error) {
      console.error('이벤트 로딩 실패:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // 이번주 이벤트 데이터 가져오기
  const fetchWeeklyEvents = async () => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // 토요일
      
      const startDate = startOfWeek.toLocaleDateString('sv-SE');
      const endDate = endOfWeek.toLocaleDateString('sv-SE');
      
      const weeklyData = await getWeeklyEvents(startDate, endDate);
      setWeeklyEvents(weeklyData);
    } catch (error) {
      console.error('주간 이벤트 로딩 실패:', error);
      setWeeklyEvents([]);
    }
  };

  // 월이 변경될 때 이벤트 데이터 가져오기
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    fetchEvents(year, month);
    fetchWeeklyEvents(); // 이번주 이벤트도 함께 가져오기
  }, [currentMonth]);

  // 날짜별 이벤트 그룹화
  const getEventsForDate = (date) => {
    const dateStr = date.toLocaleDateString('sv-SE'); // YYYY-MM-DD 형식 (로컬 시간 기준)
    return events.filter(event => event.date === dateStr);
  };

  // 캘린더 타일 렌더링
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="calendar-events">
        {dayEvents.map((event, index) => (
          <div key={index} className={`event-dot ${getEventColor(event.event_type)}`}></div>
        ))}
      </div>
    );
  };

  // 일정 추가 핸들러
  const handleAddEvent = async () => {
    if (!newEvent.event_name.trim()) {
      alert('일정명을 입력해주세요.');
      return;
    }

    setAddingEvent(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1'}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: newEvent.event_name,
          event_type: newEvent.event_type,
          date: newEvent.date,
          description: null
        }),
      });

      if (!response.ok) {
        throw new Error('일정 추가에 실패했습니다.');
      }

      // 폼 초기화
      setNewEvent({
        event_name: '',
        event_type: '시험/평가',
        date: new Date().toLocaleDateString('sv-SE')
      });

      // 캘린더 새로고침
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      await fetchEvents(year, month);
      await fetchWeeklyEvents(); // 이번주 이벤트도 새로고침

      alert('일정이 성공적으로 추가되었습니다!');
    } catch (error) {
      console.error('일정 추가 오류:', error);
      alert('일정 추가에 실패했습니다.');
    } finally {
      setAddingEvent(false);
    }
  };

  // 일정 수정 핸들러
  const handleEditEvent = async () => {
    if (!editingEvent.event_name.trim()) {
      alert('일정명을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1'}/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: editingEvent.event_name,
          event_type: editingEvent.event_type,
          date: editingEvent.date,
          description: null
        }),
      });

      if (!response.ok) {
        throw new Error('일정 수정에 실패했습니다.');
      }

      // 수정 모드 종료
      setEditingEvent(null);

      // 캘린더 새로고침
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      await fetchEvents(year, month);
      await fetchWeeklyEvents();

      alert('일정이 성공적으로 수정되었습니다!');
    } catch (error) {
      console.error('일정 수정 오류:', error);
      alert('일정 수정에 실패했습니다.');
    }
  };

  // 일정 삭제 핸들러
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1'}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('일정 삭제에 실패했습니다.');
      }

      // 캘린더 새로고침
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      await fetchEvents(year, month);
      await fetchWeeklyEvents();

      alert('일정이 성공적으로 삭제되었습니다!');
    } catch (error) {
      console.error('일정 삭제 오류:', error);
      alert('일정 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="px-6 pb-6 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">학급 일정</h1>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 캘린더 영역 */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* 캘린더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                onActiveStartDateChange={handleActiveStartDateChange}
                onClickDay={handleDateClick}
                className="w-full border-0 custom-calendar"
                tileClassName={({ date, view }) => {
                  // 기본 스타일만 적용 (CSS에서 처리)
                  return '';
                }}
                tileContent={tileContent}
                formatDay={(locale, date) => date.getDate()}
                showNeighboringMonth={true}
                minDetail="month"
                maxDetail="month"
              />
            </div>


          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 일정 추가 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일정 추가</h3>
            <div className="space-y-4">
              {/* 일정명 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정명 *
                </label>
                <input
                  type="text"
                  value={newEvent.event_name}
                  onChange={(e) => setNewEvent({...newEvent, event_name: e.target.value})}
                  placeholder="일정명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                />
              </div>

              {/* 일정 유형과 날짜 선택 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    일정 유형
                  </label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  />
                </div>
              </div>

              {/* 등록 버튼 */}
              <button
                onClick={handleAddEvent}
                disabled={addingEvent || !newEvent.event_name.trim()}
                className="w-full bg-[#2E86C1] text-white py-2 px-4 rounded-md hover:bg-[#2874A6] focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {addingEvent ? '등록 중...' : '일정 등록'}
              </button>
            </div>
          </div>

          {/* 일정 범례 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일정 범례</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>시험/평가</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>행사/활동</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>상담/회의</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>캠페인</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>예방교육</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-700 rounded-full"></div>
                <span>업무회의</span>
              </div>
            </div>
          </div>

          {/* 이번주 일정 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">이번주 일정</h3>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm text-gray-500">로딩 중...</div>
                ) : weeklyEvents.length > 0 ? (
                  weeklyEvents.map((event, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${getEventColor(event.event_type)}`}></div>
                      <div className="flex-1">
                        {editingEvent && editingEvent.id === event.id ? (
                          // 수정 모드
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingEvent.event_name}
                              onChange={(e) => setEditingEvent({...editingEvent, event_name: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={editingEvent.date}
                                onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={handleEditEvent}
                                  className="px-2 py-1 text-xs bg-[#2E86C1] text-white rounded hover:bg-[#2874A6] transition-colors"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={() => setEditingEvent(null)}
                                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // 일반 모드
                          <>
                            <div className="font-medium text-gray-900 text-sm">{event.event_name}</div>
                            <div className="text-xs text-gray-600">
                              {new Date(event.date).toLocaleDateString('ko-KR', { 
                                month: 'short', 
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </div>
                          </>
                        )}
                      </div>
                      {!editingEvent || editingEvent.id !== event.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingEvent(event)}
                            className="px-3 py-1 text-sm bg-[#2E86C1] text-white rounded hover:bg-[#2874A6] transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">이번주 등록된 일정이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 일정 상세 팝업 */}
      {showDetailPopup && (
        <div className="fixed inset-0 z-50">
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-80 border-2 border-gray-200 shadow-lg absolute"
            style={{ 
              top: `${popupPosition.top}px`, 
              left: `${popupPosition.left}px` 
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">일정 상세</h3>
              <button 
                onClick={() => setShowDetailPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            {popupEvents.length > 0 ? (
              <div className="space-y-4">
                {popupEvents.map((event, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getEventColor(event.event_type)}`}></div>
                      <div className="font-medium text-lg text-gray-900">{event.event_name}</div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 ml-5">
                      <div>
                        {popupDate.toLocaleDateString('ko-KR', { 
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </div>
                      <div>
                        {event.event_type}
                      </div>
                      {event.description && (
                        <div>
                          {event.description}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 ml-5">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowDetailPopup(false);
                        }}
                        className="px-3 py-1 text-sm bg-[#2E86C1] text-white rounded hover:bg-[#2874A6] transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteEvent(event.id);
                          setShowDetailPopup(false);
                        }}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        삭제
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div>선택한 날짜에 등록된 일정이 없습니다.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 