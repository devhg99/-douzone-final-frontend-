import React, { useState, useEffect } from "react";
import { MessageCircle, ClipboardList } from "lucide-react";
import "./CounselingPage.css";

const API_BASE = "http://localhost:8000/v1/counseling";

const CounselingPage = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    title: "",
    meeting_type: "학습상담",
    student_id: "",
    teacher_id: 1,
    date: "",
    time: "",
    location: "교무실",
  });
  const [aiPreview, setAiPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await fetch(`${API_BASE}/students`).then((r) =>
          r.json()
        );
        const statsRes = await fetch(`${API_BASE}/stats`).then((r) => r.json());

        setStudents(studentRes.data || []);
        setStats(statsRes.data || {});
      } catch (e) {
        console.error("데이터 로딩 실패:", e);
      }
    };
    fetchData();
  }, []);

  // ✅ 학생 선택 시 상담 히스토리 가져오기
  useEffect(() => {
    if (selectedStudent) {
      setForm((prev) => ({ ...prev, student_id: selectedStudent.id }));
      fetch(`${API_BASE}/history/${selectedStudent.id}`)
        .then((r) => r.json())
        .then((res) => setHistory(res.data || []));
    }
  }, [selectedStudent]);

  // ✅ 첫 번째 학생 자동 선택
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ 상담일지 저장
  const handleSave = async () => {
    if (!selectedStudent) {
      alert("학생을 선택하세요!");
      return;
    }
    await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    alert("상담일지가 저장되었습니다.");
    fetch(`${API_BASE}/history/${selectedStudent.id}`)
      .then((r) => r.json())
      .then((res) => setHistory(res.data || []));
  };

  // ✅ AI 상담일지 미리보기
  const handleAIGenerate = async () => {
    if (!selectedStudent) {
      alert("학생을 선택하세요!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.title || "상담일지를 작성해주세요" }),
      }).then((r) => r.json());
      setAiPreview(res.data.preview);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 학생 Top 5 정렬
  const sortedStudents = [...students]
    .sort((a, b) => {
      if (b.counseling_count !== a.counseling_count) {
        return b.counseling_count - a.counseling_count;
      }
      return new Date(b.recent_date || 0) - new Date(a.recent_date || 0);
    })
    .slice(0, 5);

  return (
    <div className="counseling-container">
      {/* 상단: 학생 목록 */}
      <h2 className="section-title">
        <MessageCircle className="icon" />
        학생 목록
      </h2>
      <div className="student-list">
        {sortedStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className={`student-card ${
              selectedStudent?.id === student.id ? "active" : ""
            }`}
          >
            <h3 className="student-name">{student.name}</h3>
            <p className="student-meta">
              상담 횟수: {student.counseling_count}회
            </p>
            {student.recent_date && (
              <p className="student-meta">최근: {student.recent_date}</p>
            )}
            <span className={`student-tag ${student.recent_type || ""}`}>
              {student.recent_type || "최근 상담 없음"}
            </span>
          </div>
        ))}
      </div>

      {/* 전체 학생 선택 드롭다운 */}
      <div className="student-dropdown">
        <label>다른 학생 선택:</label>
        <select
          onChange={(e) => {
            const selected = students.find(
              (s) => s.id === Number(e.target.value)
            );
            setSelectedStudent(selected);
          }}
          value={selectedStudent?.id || ""}
        >
          <option value="">학생 선택</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 메인 컨텐츠 */}
      {selectedStudent && (
        <div className="counseling-grid">
          {/* 상담 작성 */}
          <div className="student-section">
            <h3 className="form-title">
              {selectedStudent.name} 상담일지 작성
            </h3>
            <div className="form-group">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="상담 제목"
                className="input"
              />
              <select
                name="meeting_type"
                value={form.meeting_type}
                onChange={handleChange}
                className="input"
              >
                <option>학습상담</option>
                <option>생활상담</option>
                <option>진로상담</option>
                <option>집중관리</option>
              </select>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input"
              />
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="input"
              />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="상담 장소"
                className="input"
              />

              <div className="button-group">
                <button
                  onClick={handleAIGenerate}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "생성 중..." : "AI 상담일지 생성"}
                </button>
                <button onClick={handleSave} className="btn-secondary">
                  저장
                </button>
              </div>

              {aiPreview && (
                <div className="ai-preview">
                  <h4>AI 생성 상담일지</h4>
                  <p>{aiPreview}</p>
                </div>
              )}
            </div>
          </div>

          {/* 상담 통계 + 히스토리 */}
          <div className="detail-section">
            <h3 className="section-subtitle">
              <ClipboardList className="icon" />
              상담 현황 통계
            </h3>
            <div className="stats-grid">
              <div className="stat-card blue">
                {stats.total_students || 0}
                <span>전체 학생</span>
              </div>
              <div className="stat-card green">
                {stats.counseling_completed || 0}
                <span>상담 완료</span>
              </div>
              <div className="stat-card yellow">
                {stats.focus_students || 0}
                <span>집중 관리</span>
              </div>
              <div className="stat-card red">
                {stats.no_counseling || 0}
                <span>미상담</span>
              </div>
            </div>

            <h3 className="section-subtitle">상담 히스토리</h3>
            <ul className="history-list">
              {history.map((h) => (
                <li key={h.id} className="history-card">
                  <p className="history-date">
                    {h.date} {h.time}
                    <span className={`history-type ${h.meeting_type}`}>
                      {h.meeting_type}
                    </span>
                  </p>
                  <p className="history-content">{h.title}</p>
                </li>
              ))}
              {history.length === 0 && (
                <div className="empty-card">
                  <p>상담 기록이 없습니다.</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselingPage;
