import api from './client';

// 학생 목록 조회
export const fetchStudents = async () => {
  try {
    console.log('학생 목록 조회 요청');
    const response = await api.get('/students/');
    console.log('학생 목록 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('학생 목록 조회 실패:', error);
    console.error('에러 상세:', error.response?.data || error.message);
    throw error;
  }
};

// 특정 반의 학생 목록 조회
export const fetchStudentsByClass = async (classId) => {
  try {
    const response = await api.get(`/students/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error('반별 학생 목록 조회 실패:', error);
    throw error;
  }
};

// 특정 날짜의 출석 데이터 조회
export const fetchAttendanceByDate = async (date) => {
  try {
    const response = await api.get(`/attendance/daily-summary?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('출석 데이터 조회 실패:', error);
    throw error;
  }
};

// 전체 출석 기록 조회
export const fetchAllAttendance = async () => {
  try {
    const response = await api.get('/attendance/');
    return response.data;
  } catch (error) {
    console.error('전체 출석 기록 조회 실패:', error);
    throw error;
  }
};

// 상태값 변환 (한글 → 영어)
const convertStatusToEnglish = (koreanStatus) => {
  const statusMap = {
    "출석": "present",
    "결석": "absent", 
    "지각": "late",
    "조퇴": "checkin"
  };
  return statusMap[koreanStatus] || koreanStatus;
};

// 상태값 변환 (영어 → 한글)
const convertStatusToKorean = (englishStatus) => {
  const statusMap = {
    "present": "출석",
    "absent": "결석",
    "late": "지각", 
    "checkin": "조퇴"
  };
  return statusMap[englishStatus] || englishStatus;
};

// 출석 상태 생성/업데이트
export const createOrUpdateAttendance = async (attendanceData) => {
  try {
    // 한글 상태를 그대로 전송
    console.log('API 요청 데이터:', attendanceData);
    const response = await api.post('/attendance/', attendanceData);
    console.log('API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('출석 데이터 생성/업데이트 실패:', error);
    console.error('에러 상세:', error.response?.data || error.message);
    throw error;
  }
};

// 출석 상태 수정
export const updateAttendance = async (attendanceId, attendanceData) => {
  try {
    // 한글 상태를 그대로 전송
    const response = await api.put(`/attendance/${attendanceId}`, attendanceData);
    return response.data;
  } catch (error) {
    console.error('출석 데이터 수정 실패:', error);
    throw error;
  }
};

// 출석 기록 삭제
export const deleteAttendance = async (attendanceId) => {
  try {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  } catch (error) {
    console.error('출석 데이터 삭제 실패:', error);
    throw error;
  }
};

// 특정 학생의 출석 요약 조회
export const fetchStudentAttendanceSummary = async (studentId) => {
  try {
    const response = await api.get(`/attendance/student/${studentId}/summary`);
    return response.data;
  } catch (error) {
    console.error('학생 출석 요약 조회 실패:', error);
    throw error;
  }
};

// 특정 반의 출석 요약 조회
export const fetchClassAttendanceSummary = async (classId) => {
  try {
    const response = await api.get(`/attendance/class/${classId}/summary`);
    return response.data;
  } catch (error) {
    console.error('반 출석 요약 조회 실패:', error);
    throw error;
  }
};

// 학생별 출석 통계 조회 (전체 기간)
export const fetchStudentAttendanceStats = async () => {
  try {
    console.log('학생별 출석 통계 조회 요청');
    const response = await api.get('/attendance/stats/students');
    console.log('학생별 출석 통계 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('학생별 출석 통계 조회 실패:', error);
    console.error('에러 상세:', error.response?.data || error.message);
    throw error;
  }
};
