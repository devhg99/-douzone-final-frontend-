// src/api/grades.js
const API_BASE = process.env.REACT_APP_API_BASE_URL;

function apiUrl(path) {
  const base = API_BASE.replace(/\/+$/, ""); // 뒤쪽 / 제거
  const p = String(path || "").replace(/^\/+/, ""); // 앞쪽 / 제거
  return `${base}/${p}`;
}

/** 공통 fetch(JSON 전용) */
async function getJSON(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/** 특정 반(class_id)의 성적 대시보드 조회 */
export async function fetchGradesDashboard(classId, term = "2학기") {
  // ✅ success, message, data 모두 유지
  const query = `?term=${encodeURIComponent(term)}`;
  return await getJSON(apiUrl(`grades/dashboard/${classId}${query}`));
}
