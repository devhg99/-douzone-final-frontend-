import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // MSW 또는 실제 백엔드 API 기본 URL
  timeout: 5000,
});

// 로그인 API
export const login = async (username, password) => {
  const response = await apiClient.post('/login', { username, password });
  return response.data;
};

// 필요하면 추가 API 함수 작성...

export default apiClient;
