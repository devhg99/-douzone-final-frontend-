// src/api/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 서버 주소를 여기에 설정할 거야
  withCredentials: true,
});

export default apiClient;
