// src/api/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // CRA에서는 process.env 사용
  withCredentials: true,
});

export default apiClient;
