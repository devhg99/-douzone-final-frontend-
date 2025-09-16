// src/pages/LifeRecord/LifeRecordPage.jsx
import React, { useEffect, useMemo, useState } from "react";

import StudentSelectSection from "./sections/StudentSelectSection";
import SummarySection from "./sections/SummarySection";
import CommentEditorSection from "./sections/CommentEditorSection";
import ActionBar from "./sections/ActionBar";

/* =========================================================
   Env 호환 (Vite || CRA) + 안전한 URL 합치기
   ========================================================= */
/* eslint-disable no-undef */
let VITE_ENV;
try {
  // Vite에서는 import.meta.env 사용 가능
  VITE_ENV = import.meta.env;
} catch (e) {
  // CRA/Webpack 환경이라면 여기로 들어옴 (문제 없음)
}
/* eslint-enable no-undef */

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const API_TIMEOUT = Number(process.env.REACT_APP_API_TIMEOUT) || 15000;

// base와 path를 안전하게 합쳐서 //, /// 같은 중복 슬래시 제거
function apiUrl(path) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return `${base}/${p}`;
}


/** 공통 fetch(JSON 전용, 실패해도 화면은 살려둠) */
async function getJSON(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT);
  try {
    const token = localStorage.getItem("token"); // 로그인 토큰(있다면)
    const res = await fetch(url, {
      signal: ctrl.signal,
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} ${text}`);
    }
    return res.headers.get("content-type")?.includes("application/json")
      ? res.json()
      : res;
  } finally {
    clearTimeout(timer);
  }
}

/** 응답에서 흔한 껍데기 제거: {data:...} | {result:...} | {results:[...]} | 그 외 원본 */
function unwrap(x) {
  if (x == null) return x;
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.data)) return x.data;
  if (Array.isArray(x?.results)) return x.results;
  if (Array.isArray(x?.items)) return x.items;
  if (x && typeof x === "object") {
    if (x.data && typeof x.data === "object" && !Array.isArray(x.data)) return x.data;
    if (x.result && typeof x.result === "object") return x.result;
  }
  return x;
}
// 글자수 제한(열 너비에 맞춰 잘라서 … 처리)
function clamp(text, max = 120) {
  if (!text) return "-";
  const s = String(text);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// 과목 ID → 이름 매핑 (서버 /subjects가 있으면 fetch해서 덮어씀)
const FALLBACK_SUBJECT_MAP = {
  1: "국어",
  2: "수학",
  3: "영어",
  4: "과학",
  5: "사회",
};

async function loadSubjectMap(apiUrl) {
  try {
    const raw = await getJSON(apiUrl(`subjects`));
    const arr = unwrap(raw);

    if (Array.isArray(arr) && arr.length) {
      const m = {};
      for (const it of arr) {
        const id = Number(it?.id ?? it?.subject_id);
        const name = it?.name ?? it?.subject_name;
        if (Number.isFinite(id) && name) m[id] = name;
      }
      if (Object.keys(m).length) {
        return m;
      }
    }
    // subjects 응답이 비어있으면 기본 맵 사용
    return FALLBACK_SUBJECT_MAP;
  } catch (e) {
    // 핸들링을 명시적으로 넣어서 no-empty 회피 + 로그 남김
    console.warn("subjects fetch failed -> fallback map 사용", e);
    return FALLBACK_SUBJECT_MAP;
  }
}

export default function LifeRecordPage() {
  // --- 상태 ----------------------------------------------------
  const [students, setStudents] = useState([]);        // 드롭다운 옵션
  const [studentId, setStudentId] = useState("");      // 선택 학생 id
  const [studentName, setStudentName] = useState("");  // 선택 학생 이름(프롬프트용)
  const [summary, setSummary] = useState(null);        // 요약(출결/성적/행동)
  const [comment, setComment] = useState("");          // 코멘트
  const [generating, setGenerating] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const actionsEnabled = comment.trim().length > 0;

  // 학년/학기(임시 계산). 백엔드에 학기 API가 있으면 도착 후 덮어쓰기 권장.
  const year = useMemo(() => new Date().getFullYear(), []);
  const semester = useMemo(() => ((new Date().getMonth() + 1) <= 8 ? 1 : 2), []);

  // --- 초기 로딩: 학생 목록 -------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await getJSON(apiUrl(`students/`));
        const list = unwrap(data) || [];

      // 3) 타입/스키마 보정: id, name이 없으면 최대한 유추
          const normalized = list.map((s) => ({
        // label은 name/username/title 등 흔한 키에서 우선 추출
          label: s?.student_name ?? s?.name ?? s?.username ?? s?.title ?? String(s?.id ?? ''),
        // value는 문자열화된 id(없으면 label)
          value: String(s?.id ?? s?.value ?? s?.uuid ?? s?.pk ?? (s?.student_name ?? s?.name ?? '')),
        // 필요하면 원본도 보관
          _raw: s,
        }));
        
        setStudents(normalized);
      } catch (e) {
        console.error("학생 목록 조회 실패:", e);
        // 최소한의 폴백(데모)
        setStudents([
          { label: "김민수", value: "1" },
          { label: "이수진", value: "2" },
          { label: "박준호", value: "3" },
        ]);
      }
    })();
  }, []);

  // --- 학생 선택 시: 요약 불러오기 ------------------------------
  const handleStudentChange = async (id) => {
    setStudentId(id);
    const name = students.find((s) => String(s.value) === String(id))?.label || "";
    setStudentName(name);
    setComment(""); // 학생 바뀌면 코멘트 초기화

    if (!id) {
      setSummary(null);
      return;
    }

  setLoadingSummary(true);
  try {
    // 0) 과목 맵 준비 (/subjects 있으면 사용, 없으면 기본 맵)
    const SUBJECT_MAP = await loadSubjectMap(apiUrl);

    // 1) 출결 요약 -------------------------------------------------
    let attendanceText = "-";
    try {
      let list = [];
      try {
        const aRaw = await getJSON(apiUrl(`attendance?student_id=${encodeURIComponent(id)}`));
        const aUn = unwrap(aRaw);   // ✅ 여기서 aUn 선언
        const all = Array.isArray(aUn) ? aUn : (Array.isArray(aUn?.records) ? aUn.records : []);
        list = all.filter((r) => String(r.student_id) === String(id)); // 해당 학생만
      } catch {
        const aRaw = await getJSON(apiUrl(`attendance/student/${id}/summary`));
        const a = unwrap(aRaw) || {};
        if (a?.attendance_rate) attendanceText = `출석률 ${a.attendance_rate}`;
      }

      if (Array.isArray(list) && list.length) {
        const mapStatus = (v) => {
          const s = String(v ?? "").toLowerCase().replace(/\s+/g, "");
          if (/(출석|present|attendance)/.test(s)) return "present";
          if (/(지각|late)/.test(s)) return "late";
          if (/(조퇴|earlyleave|early)/.test(s)) return "early";
          if (/(결석|absent)/.test(s)) return "absent";
          return null;
        };
        const counts = list.reduce((acc, r) => {
          const k = mapStatus(r?.status ?? r?.attendance_status);
          if (k && acc[k] != null) acc[k] += 1;
          return acc;
        }, { present: 0, late: 0, early: 0, absent: 0 });

        attendanceText =
          `출석 ${counts.present}회, 지각 ${counts.late}회, 조퇴 ${counts.early}회` +
          (counts.absent ? `, 결석 ${counts.absent}회` : "");
      }
    } catch (e) {
      console.warn("출결 요약 실패:", e);
    }

    // 2) 성적 요약 -------------------------------------------------
    // CSV: id,student_id,subject_id,term,average_score,grade_letter
    let gradesText = "-";
    try {
      const gRaw = await getJSON(apiUrl(`grades?student_id=${encodeURIComponent(id)}`));
      const gUn = unwrap(gRaw) || [];
      const arr = Array.isArray(gUn) ? gUn : (Array.isArray(gUn?.grades) ? gUn.grades : []);

      const filtered = arr.filter(r => String(r.student_id) === String(id)); // 🔧
      if (filtered.length) {
        const normTerm = (t) => {
          const s = String(t ?? "").replace(/\s+/g, "");
          if (/^1학기|중간|mid(dle)?$/i.test(s)) return "중간고사";
          if (/^2학기|기말|final$/i.test(s)) return "기말고사";
          if (s === "1") return "중간고사";
          if (s === "2") return "기말고사";
          return "기말고사"; // 기본
        };
        const byTerm = { "중간고사": {}, "기말고사": {} };
        for (const r of filtered) {
          const sid = Number(r?.subject_id);
          const term = normTerm(r?.term);
          const score = r?.average_score ?? r?.score ?? r?.point;
          if (!Number.isFinite(sid) || !term) continue;
          byTerm[term][sid] = score;
        }

        const subjectsOrder = [1, 2, 3, 4, 5]; // 국/수/영/사/과
        const line = (label, map) =>
          label + " " +
          subjectsOrder
            .map((sid) => `${SUBJECT_MAP[sid] ?? `과목${sid}`} (${map?.[sid] ?? "-"})`)
            .join(" / ");

        const lines = [];
        if (Object.keys(byTerm["중간고사"]).length) lines.push(line("중간고사", byTerm["중간고사"]));
        if (Object.keys(byTerm["기말고사"]).length) lines.push(line("기말고사", byTerm["기말고사"]));
        if (lines.length) gradesText = lines.join("  |  ");
      }
    } catch (e) {
      console.warn("성적 요약 실패:", e);
    }

    // 3) 행동특성(생활기록부) --------------------------------------
    let behaviorText = "-";
    try {
      const srRaw = await getJSON(apiUrl(`school_report?student_id=${encodeURIComponent(id)}`));

      const un = unwrap(srRaw);
      const arr = Array.isArray(un) ? un : (Array.isArray(un?.reports) ? un.reports : []);
      const item = arr.find(r => String(r.student_id) === String(id)) || arr[0]; // 🔧
      const picked =
        item?.behavior_summary ??
        item?.teacher_feedback ??
        item?.peer_relation ??
        item?.comment;
      behaviorText = clamp(picked, 120);
    } catch (e) {
      console.warn("행동특성 조회 실패:", e);
    }

    setSummary({
      attendance: attendanceText || "-",
      grades: gradesText || "-",
      behavior: behaviorText || "-",
    });
  } finally {
    setLoadingSummary(false);
  }
  };
  
// --- 코멘트 생성 (완전히 수정된 버전) ---
const handleGenerate = async () => {
  if (!studentId) {
    setComment("⚠️ 학생을 먼저 선택해주세요.");
    return;
  }
  
  setGenerating(true);
  console.log("=== 코멘트 생성 시작 ===");
  console.log("선택된 학생 ID:", studentId);
  console.log("현재 연도/학기:", year, semester);
  
  try {
    let reportId = null;
    
    // === 1단계: 기존 생활기록부 조회 ===
    console.log("1단계: 기존 생활기록부 조회 시작");
    
    try {
      // 🔧 핵심 수정: URL 구조 정확히 맞추기
      const reportUrl = apiUrl(`school_report?student_id=${studentId}`);
      console.log("생활기록부 조회 URL:", reportUrl);
      
      const existingReportsResponse = await getJSON(reportUrl);
      console.log("생활기록부 조회 원본 응답:", existingReportsResponse);
      
      const reports = unwrap(existingReportsResponse) || [];
      console.log("unwrap된 리포트 목록:", reports);
      
      if (!Array.isArray(reports)) {
        console.warn("리포트 데이터가 배열이 아님:", typeof reports, reports);
        throw new Error("생활기록부 데이터 형식이 올바르지 않습니다.");
      }
      
      // 현재 연도/학기 매칭 - 더 안전한 방식
      const currentReport = reports.find(r => {
        const reportYear = parseInt(r.year);
        const reportStudentId = parseInt(r.student_id);
        
        console.log(`리포트 비교: year(${reportYear}===${year}), student_id(${reportStudentId}===${parseInt(studentId)})`);
        
        return reportYear === year &&  
               reportStudentId === parseInt(studentId);
      });
      
      console.log("매칭된 현재 리포트:", currentReport);
      
      if (currentReport && currentReport.id) {
        reportId = currentReport.id;
        console.log("✅ 기존 생활기록부 사용:", reportId);
        
        // 기존 데이터 검증
        const hasContent = currentReport.behavior_summary || 
                          currentReport.peer_relation || 
                          currentReport.career_aspiration || 
                          currentReport.teacher_feedback;
        
        if (!hasContent) {
          console.log("⚠️ 기존 리포트에 내용이 없음, 기본 내용으로 업데이트 필요");
        }
        
      } else {
        console.log("❌ 현재 연도/학기에 해당하는 생활기록부 없음, 새로 생성 필요");
        reportId = null;
      }
      
    } catch (fetchError) {
      console.error("생활기록부 조회 실패:", fetchError);
      
      // 404 에러인 경우는 정상적인 상황 (아직 생성되지 않음)
      if (fetchError.message && fetchError.message.includes('404')) {
        console.log("404 에러: 생활기록부가 아직 생성되지 않음 (정상)");
        reportId = null;
      } else {
        throw new Error(`생활기록부 조회 중 오류: ${fetchError.message}`);
      }
    }
    
    // === 2단계: 생활기록부 생성 (필요한 경우) ===
    if (!reportId) {
      console.log("2단계: 새 생활기록부 생성 시작");
      
      try {
        // 🔧 핵심 수정: 더 안전한 기본 데이터 준비
        const defaultBehavior = summary?.behavior && 
                               summary.behavior !== "-" && 
                               summary.behavior !== "불러오는 중…" && 
                               summary.behavior.trim().length > 5
          ? summary.behavior.replace(/…$/, "").trim()
          : "수업에 성실히 참여하며 학습에 대한 의욕을 보입니다. 주어진 과제를 책임감 있게 수행하는 모습을 관찰할 수 있습니다.";
        
        const newReportData = {
          student_id: parseInt(studentId),
          year: parseInt(year),
          semester: parseInt(semester),
          behavior_summary: defaultBehavior,
          peer_relation: "동급생들과 원만한 관계를 형성하고 있으며, 협력적인 태도로 모둠 활동에 참여합니다.",
          career_aspiration: "자신의 적성과 흥미를 탐색하며 진로에 대한 관심을 점차 구체화해 나가고 있습니다.",
          teacher_feedback: "" // AI가 생성할 부분
        };
        
        console.log("생성할 데이터:", JSON.stringify(newReportData, null, 2));
        
        // 🔧 핵심 수정: POST 요청 방식 개선
        const createUrl = apiUrl('school_report');
        console.log("생성 요청 URL:", createUrl);
        
        const createResponse = await fetch(createUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") ? { 
              Authorization: `Bearer ${localStorage.getItem("token")}` 
            } : {})
          },
          body: JSON.stringify(newReportData),
        });
        
        console.log("생성 응답 상태:", createResponse.status, createResponse.statusText);
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error("생성 실패 상세:", {
            status: createResponse.status,
            statusText: createResponse.statusText,
            headers: Object.fromEntries(createResponse.headers.entries()),
            body: errorText
          });
          
          if (createResponse.status === 422) {
            let detailedError = "데이터 검증 실패";
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.detail && Array.isArray(errorJson.detail)) {
                detailedError = errorJson.detail
                  .map(d => `${d.loc?.slice(1).join('.')}: ${d.msg}`)
                  .join(', ');
              } else if (errorJson.detail) {
                detailedError = errorJson.detail;
              }
            } catch (parseError) {
              console.warn("에러 응답 파싱 실패:", parseError);
              detailedError = errorText;
            }
            throw new Error(`데이터 형식 오류: ${detailedError}`);
          }
          
          throw new Error(`생활기록부 생성 실패 (${createResponse.status}): ${errorText}`);
        }
        
        const createJson = await createResponse.json();
        console.log("생성 성공 응답:", createJson);
        
        // 🔧 핵심 수정: 응답에서 ID 추출 로직 개선
        const newReport = unwrap(createJson);
        reportId = newReport?.id || 
                  newReport?.data?.id || 
                  createJson?.id || 
                  createJson?.data?.id;
        
        if (!reportId) {
          console.error("ID 추출 실패. 전체 응답:", createJson);
          throw new Error("생성된 생활기록부의 ID를 확인할 수 없습니다.");
        }
        
        console.log("✅ 새 생활기록부 생성 성공:", reportId);
        
      } catch (createError) {
        console.error("생활기록부 생성 실패:", createError);
        throw new Error(`생활기록부 생성 중 오류: ${createError.message}`);
      }
    }
    
    // === 3단계: AI 코멘트 생성 ===
    console.log("3단계: AI 코멘트 생성 시작, reportId:", reportId);
    
    if (!reportId || isNaN(reportId)) {
      throw new Error(`올바르지 않은 생활기록부 ID: ${reportId}`);
    }
    
    // 생성 요청 데이터 준비
    const generateRequest = {
      tone: "정중하고 공식적",
      length: "표준",
      focus_areas: ["행동특성", "또래관계", "진로희망"],
      include_suggestions: true,
      academic_context: summary?.grades && 
                       summary.grades !== "-" && 
                       summary.grades !== "불러오는 중…" 
        ? `성적 현황: ${summary.grades}` 
        : null
    };
    
    console.log("AI 생성 요청 데이터:", generateRequest);
    
    // 🔧 핵심 수정: AI API 호출 URL 정확히 구성
    const aiUrl = apiUrl(`school_report_ai/${reportId}/generate-comment`);
    console.log("AI 생성 요청 URL:", aiUrl);
    
    const aiResponse = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("token") ? { 
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        } : {})
      },
      body: JSON.stringify(generateRequest),
    });
    
    console.log("AI 응답 상태:", aiResponse.status, aiResponse.statusText);
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI 생성 실패:", {
        status: aiResponse.status,
        statusText: aiResponse.statusText,
        body: errorText
      });
      
      if (aiResponse.status === 404) {
        throw new Error(`생활기록부 데이터를 찾을 수 없습니다. (ID: ${reportId})`);
      } else if (aiResponse.status === 400) {
        throw new Error("생성할 수 있는 정보가 부족합니다. 생활기록부에 더 많은 내용을 입력해주세요.");
      } else if (aiResponse.status === 500) {
        throw new Error("AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      
      throw new Error(`AI 코멘트 생성 실패 (${aiResponse.status}): ${errorText}`);
    }
    
    const aiJson = await aiResponse.json();
    console.log("AI 생성 성공 응답:", aiJson);
    
    // === 4단계: 응답 처리 ===
    if (aiJson?.success === false) {
      const errorMsg = aiJson?.error?.message || 
                      aiJson?.message || 
                      "AI 코멘트 생성에 실패했습니다.";
      throw new Error(errorMsg);
    }
    
    // 🔧 핵심 수정: 더 안전한 텍스트 추출
    const generatedText = aiJson?.data?.generated_comment || 
                         aiJson?.generated_comment ||
                         aiJson?.comment ||
                         aiJson?.data?.comment;
    
    if (!generatedText || typeof generatedText !== 'string' || generatedText.trim().length === 0) {
      console.error("빈 코멘트 응답:", aiJson);
      throw new Error("생성된 코멘트가 비어있습니다. 생활기록부 데이터를 확인하고 다시 시도해주세요.");
    }
    
    // === 5단계: 성공 처리 ===
    const finalComment = generatedText.trim();
    setComment(finalComment);
    
    console.log("✅ 코멘트 생성 완전 성공!");
    console.log("생성된 코멘트 길이:", finalComment.length);
    console.log("생성된 코멘트 미리보기:", finalComment.substring(0, 100) + "...");
    
    // 성공 로그
    const metadata = aiJson?.data;
    if (metadata?.character_count) {
      console.log(`📊 통계: ${metadata.character_count}자, ${metadata.word_count}단어, ${metadata.sentence_count}문장`);
    }
    
  } catch (error) {
    console.error("=== 코멘트 생성 실패 ===");
    console.error("에러:", error);
    console.error("스택:", error.stack);
    
    // 🔧 핵심 수정: 더 구체적인 에러 분류
    let userMessage = "코멘트 생성에 실패했습니다.";
    
    const errorMsg = error.message || "";
    
    if (errorMsg.includes("student_id") || errorMsg.includes("학생")) {
      userMessage = "학생 정보에 문제가 있습니다. 다른 학생을 선택하거나 페이지를 새로고침해보세요.";
    } else if (errorMsg.includes("year") || errorMsg.includes("semester")) {
      userMessage = "연도 또는 학기 정보에 문제가 있습니다. 페이지를 새로고침해보세요.";
    } else if (errorMsg.includes("404")) {
      userMessage = "해당 학생의 데이터를 찾을 수 없습니다. 학생 선택을 다시 확인해주세요.";
    } else if (errorMsg.includes("422") || errorMsg.includes("형식")) {
      userMessage = `데이터 형식 오류: ${errorMsg.split(": ").pop() || "필수 정보가 누락되었습니다"}`;
    } else if (errorMsg.includes("500")) {
      userMessage = "서버에서 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    } else if (errorMsg.includes("네트워크") || errorMsg.includes("timeout")) {
      userMessage = "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
    } else if (errorMsg.includes("권한") || errorMsg.includes("401") || errorMsg.includes("403")) {
      userMessage = "접근 권한이 없습니다. 다시 로그인해주세요.";
    } else if (errorMsg.includes("AI") || errorMsg.includes("생성")) {
      userMessage = errorMsg; // AI 관련 에러는 그대로 표시
    } else if (errorMsg.length > 0) {
      userMessage = errorMsg;
    }
    
    setComment(`❌ ${userMessage}\n\n🔧 문제 해결 방법:\n• 다른 학생을 선택해보세요\n• 브라우저를 새로고침하세요\n• 네트워크 연결을 확인하세요\n• 문제가 계속되면 관리자에게 문의하세요\n\n📋 기술 정보: ${error.message}`);
    
  } finally {
    setGenerating(false);
    console.log("=== 코멘트 생성 완료 ===");
  }
};

// 🔧 추가: apiUrl 함수도 개선 (URL 일관성 보장)
function apiUrl(path) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  
  // 특정 액션들은 trailing slash 제거
  if (p.includes('/generate-') || p.includes('/export/') || p.includes('/send-')) {
    return `${base}/${p}`;
  }
  
  // 쿼리 파라미터가 있는 경우 trailing slash 제거
  if (p.includes('?')) {
    return `${base}/${p}`;
  }
  
  // 나머지는 일관성을 위해 trailing slash 유지하지 않음
  return `${base}/${p}`;
}

  // --- 저장: 생활기록부 코멘트 -----------------------------------
  const handleSave = async () => {
    if (!studentId) return;
    try {
      const payload = {
        year,
        semester,
        student_id: Number(studentId),
        teacher_feedback: comment, // 또는 behavior_summary 필드 사용 가능
      };
      await getJSON(apiUrl(`school_report/`), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      alert("저장되었습니다.");
    } catch (e) {
      console.error("저장 실패:", e);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // --- 미리보기/인쇄 ---------------------------------------------
  const handlePreview = () => {
    if (!studentId) return;
    window.open(apiUrl(`pdf/report/${studentId}`), "_blank", "noopener,noreferrer");
  };
  const handlePrint = handlePreview;

  return (
    <div className="w-full">
      {/* 헤더와 폭을 맞춤 (Header가 1124px 컨테이너 사용) */}
      <div className="mx-auto max-w-[1124px] space-y-6">
        {/* 상단 2열 그리드: 좌(학생선택), 우(요약) */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <StudentSelectSection
              value={studentId}
              onChange={handleStudentChange}
              options={students}
              showGenerateButton={false}
            />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <SummarySection
              data={
                loadingSummary
                  ? { attendance: "불러오는 중…", grades: "불러오는 중…", behavior: "불러오는 중…" }
                  : summary
              }
            />
          </div>

          {/* 하단 전체 폭: 코멘트 에디터 */}
          <div className="col-span-12">
            <CommentEditorSection
              value={comment}
              onChange={setComment}
              onGenerate={handleGenerate}
              canGenerate={!!studentId && !generating}
              generating={generating}
            />
          </div>
        </div>

        {/* 우측 정렬 액션바 */}
        <div className="sticky bottom-0">
          <div className="flex justify-end">
            <ActionBar
              onSave={handleSave}
              onPreview={handlePreview}
              onPrint={handlePrint}
              onRegenerate={handleGenerate}
              disabled={!actionsEnabled || generating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
