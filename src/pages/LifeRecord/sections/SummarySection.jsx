import React from "react";

export default function SummarySection({ data }) {
  const rows = Array.isArray(data)
    ? data.map((r) => [r.label ?? "", r.content ?? ""])
    : [
        ["출결", data?.attendance ?? ""],
        ["성적", data?.grades ?? ""],
        ["행동특성", data?.behavior ?? ""],
      ];

  const isEmpty =
    !data ||
    (Array.isArray(data) && data.every((r) => !r?.content)) ||
    (!Array.isArray(data) && !data?.attendance && !data?.grades && !data?.behavior);

  const emptyMsg = "학생을 선택하면 요약이 표시됩니다";

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

      {/* 디폴트 표시: 3행 */}
      {isEmpty
        ? ["출결", "성적", "행동특성"].map((label, i) => (
            <div key={i} className="grid grid-cols-2 h-[35px]" role="row">
              <div className="bg-[#ECF0F1] flex items-center justify-center px-4" role="cell">
                <span className="text-[#2C3E50] text-[11px]">{label}</span>
              </div>
              <div className="bg-white flex items-center px-4" role="cell">
                <span className="text-[#7f8c8d] text-[11px]">{emptyMsg}</span>
              </div>
            </div>
          ))
        : rows.map(([label, content], idx) => (
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
