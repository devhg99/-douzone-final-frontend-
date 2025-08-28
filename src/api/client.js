// src/api/client.js  (Vite 기준 — CRA면 env 접근만 바꾸면 됨)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // CRA면 process.env.REACT_APP_API_BASE_URL
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
});

export default api;
