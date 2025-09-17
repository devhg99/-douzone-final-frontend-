// src/pages/LifeRecord/sections/CommentEditorSection.jsx
import React from "react";

export default function CommentEditorSection({
  title = "생활기록부 코멘트",
  placeholder = "내용을 입력하세요...",
  value = "",
  onChange = () => {},
  maxLength = 700,
  // ⬇ 추가: 생성 버튼 제어
  onGenerate,
  generating = false,
  canGenerate = true,
  generateText = "코멘트생성",
}) {
  const currentLength = value?.length ?? 0;

  return (
    <section className="w-[1100px]">
      {/* 헤더 + 생성 버튼(우측 정렬) */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#2C3E50] text-xl font-bold">{title}</h2>
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || generating}
            className={`h-9 px-4 rounded-md text-sm text-white transition-colors
              ${(!canGenerate || generating)
                ? "bg-[rgba(110,101,198,0.5)] cursor-not-allowed"
                : "bg-[rgba(110,101,198,0.93)] hover:bg-[rgba(110,101,198,1)]"}`}
            aria-busy={generating}
          >
            {generating ? "생성 중…" : generateText}
          </button>
        )}
      </div>

      {/* 에디터 */}
      <div className="w-full bg-white border border-[#E1E5E9] rounded p-5">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full h-[240px] p-4 pr-14 pb-10 bg-[#FAFBFC] border border-dashed border-[#E1E5E9]
                       rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {/* 글자수: 입력란 내부 우하단 */}
          <span className="absolute bottom-3 right-4 text-xs text-[#666]">
            {currentLength}/{maxLength}자
          </span>
        </div>
      </div>
    </section>
  );
}
