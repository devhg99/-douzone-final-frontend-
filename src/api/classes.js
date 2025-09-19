// src/api/classes.js
import api from "./client";

// 특정 학급 정보 조회
export const fetchClassById = async (classId) => {
  try {
    const response = await api.get(`/classes/${classId}`);
    // ✅ 응답이 { success: true, data: {...} } 구조라면
    return response.data.data; // data만 반환
  } catch (error) {
    console.error("학급 조회 실패:", error);
    throw error;
  }
};
