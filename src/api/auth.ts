// src/api/auth.ts
import apiClient from './apiClient.ts'; // 서버랑 연결해주는 도구

export const login = async (id: string, password: string) => {
  const response = await apiClient.post('/auth/login', {
    id,
    password,
  });

  return response.data; // 로그인 결과 받아서 돌려줌
};
