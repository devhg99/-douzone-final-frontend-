import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SchedulePage.css';
import { getMonthlyEvents, getEventColor } from '../../api/events';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 일정 추가 폼 상태
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_type: '시험/평가',
    date: new Date().toLocaleDateString('sv-SE')
  });
  const [addingEvent, setAddingEvent] = useState(false);

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

  // 월이 변경될 때 이벤트 데이터 가져오기
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    fetchEvents(year, month);
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

      alert('일정이 성공적으로 추가되었습니다!');
    } catch (error) {
      console.error('일정 추가 오류:', error);
      alert('일정 추가에 실패했습니다.');
    } finally {
      setAddingEvent(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">일정 관리</h1>
        <p className="text-gray-600">학급 내 주요 일정을 캘린더 형태로 관리합니다.</p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 캘린더 영역 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* 캘린더 */}
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              onActiveStartDateChange={handleActiveStartDateChange}
              className="w-full border-0 custom-calendar"
              tileClassName={({ date, view }) => {
                // 기본 스타일만 적용 (CSS에서 처리)
                return '';
              }}
              tileContent={tileContent}
              formatDay={(locale, date) => date.getDate()}
              showNeighboringMonth={false}
              minDetail="month"
              maxDetail="month"
            />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 일정 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정 유형
                </label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 날짜 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 등록 버튼 */}
              <button
                onClick={handleAddEvent}
                disabled={addingEvent || !newEvent.event_name.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {addingEvent ? '등록 중...' : '일정 등록'}
              </button>
            </div>
          </div>

          {/* 선택된 날짜 일정 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('ko-KR', { 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })} 일정
            </h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-gray-500">로딩 중...</div>
              ) : getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getEventColor(event.event_type)}`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{event.event_name}</div>
                      <div className="text-sm text-gray-600">{event.event_type}</div>
                      {event.description && (
                        <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">등록된 일정이 없습니다.</div>
              )}
            </div>
          </div>

          {/* 일정 범례 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일정 범례</h3>
            <div className="space-y-2 text-sm">
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
        </div>
      </div>
    </div>
  );
} 