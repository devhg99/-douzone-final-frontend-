import React from "react";

export default function SummarySection({ data }) {
  if (!data) {
    return (
      <section className="w-full max-w-[1100px] border border-[#E1E5E9] rounded bg-white">
        <p className="p-4 text-sm text-gray-500">학생을 선택하면 요약이 표시됩니다</p>
      </section>
    );
  }

  // ✅ 출결 요약
  const attendanceSummary = data.attendance?.length
    ? `${data.attendance.length}일 기록 (결석 ${data.attendance.filter(a => a.status === "결석").length}회)`
    : "출결 데이터 없음";

  // ✅ 성적 요약 (상위 3과목만 표시)
  const gradesSummary = data.grades?.length
    ? data.grades.slice(0, 3).map(g => `${g.subject} ${g.score}`).join(" / ")
    : "성적 데이터 없음";

  // ✅ 행동특성 요약 (reports 배열의 최신 데이터 기준)
  const latestReport = Array.isArray(data.reports) && data.reports.length > 0
    ? data.reports[data.reports.length - 1]
    : null;

  const behaviorSummary = latestReport
    ? [
        latestReport.behavior_summary,
        latestReport.peer_relation,
        latestReport.career_aspiration,
        latestReport.teacher_feedback,
      ]
        .filter(Boolean) // 값이 있는 것만
        .join(" / ")
    : "행동특성 데이터 없음";

  const rows = [
    ["출결", attendanceSummary],
    ["성적", gradesSummary],
    ["행동특성", behaviorSummary],
  ];

  return (
    <section className="w-full max-w-[1100px] border border-[#E1E5E9] rounded bg-white">
      {/* 헤더 */}
      <div className="grid grid-cols-2 h-[25px]" role="row">
        <div className="bg-[#34495E] flex items-center justify-center" role="columnheader">
          <span className="text-white text-xs">항목</span>
        </div>
        <div className="bg-[#34495E] flex items-center justify-center" role="columnheader">
          <span className="text-white text-xs">내용</span>
        </div>
      </div>

      {rows.map(([label, content], idx) => (
        <div key={`${label}-${idx}`} className="grid grid-cols-2 h-[35px]" role="row">
          <div className="bg-[#ECF0F1] flex items-center justify-center px-4" role="cell">
            <span className="text-[#2C3E50] text-[11px]">{label}</span>
          </div>
          <div className="bg-white flex items-center px-4" role="cell">
            <span className="text-[#2C3E50] text-[11px] break-words">{content || "-"}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
