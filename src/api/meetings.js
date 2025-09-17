import api from './client';

// 이번 주 상담 통계 조회
export const fetchWeeklyMeetingStats = async () => {
  try {
    const response = await api.get('/meetings/stats/weekly');
    return response.data;
  } catch (error) {
    console.error('이번 주 상담 통계 조회 실패:', error);
    throw error;
  }
};
