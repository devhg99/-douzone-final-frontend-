const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1';

/**
 * 전체 이벤트 조회
 * @returns {Promise<Array>} 이벤트 목록
 */
export const getEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('이벤트 조회 중 오류:', error);
    throw error;
  }
};

/**
 * 월별 이벤트 조회
 * @param {number} year - 연도
 * @param {number} month - 월
 * @returns {Promise<Array>} 해당 월의 이벤트 목록
 */
export const getMonthlyEvents = async (year, month) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/monthly?year=${year}&month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('월별 이벤트 조회 중 오류:', error);
    throw error;
  }
};

/**
 * 주간 이벤트 조회
 * @param {string} startDate - 시작일 (YYYY-MM-DD)
 * @param {string} endDate - 종료일 (YYYY-MM-DD)
 * @returns {Promise<Array>} 해당 주의 이벤트 목록
 */
export const getWeeklyEvents = async (startDate, endDate) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/weekly?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('주간 이벤트 조회 중 오류:', error);
    throw error;
  }
};

/**
 * 이벤트 타입에 따른 색상 매핑
 * @param {string} eventType - 이벤트 타입
 * @returns {string} CSS 클래스명
 */
export const getEventColor = (eventType) => {
  const colorMap = {
    '시험/평가': 'event-red',
    '행사/활동': 'event-green',
    '상담/회의': 'event-orange',
    '캠페인': 'event-blue',
    '예방교육': 'event-purple',
    '업무회의': 'event-indigo',
  };
  
  return colorMap[eventType] || 'event-blue';
}; 