// src/pages/LifeRecord/sections/StudentSelectSection.jsx
import React from "react";

export default function StudentSelectSection(props) {
  const {
    label = "학생 선택",
    placeholder = "학생 이름",
    options = [],
    value = "",
    onChange = () => {},
    disabled = false,
    className: extraClassName = "", 
    showGenerateButton = false,
    onGenerate = () => {},
    canGenerate = true,
    generating = false,
    generateText = "코멘트생성",
  } = props;

  return (
    <section className={`space-y-2 ${extraClassName}`}>
      <h3 className="text-[#2C3E50] text-lg font-bold leading-normal">{label}</h3>

      {/* 같은 y축: 드롭다운 + (옵션) 생성 버튼 */}
      <div className="flex items-center gap-3 w-full max-w-[420px]">
        <div className="relative flex-1">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full h-10 px-4 pr-10 bg-white border border-[#DDDDDD] rounded-md text-sm text-[#333]
                       appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.value ?? opt}>{opt.label ?? opt}</option>
            ))}
          </select>

          {/* caret */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M0 0H10L5 10L0 0Z" fill="#666666"/>
            </svg>
          </div>
        </div>

        {showGenerateButton && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || generating}
            className={`h-10 px-4 rounded-md text-sm text-white transition-colors
              ${(!canGenerate || generating)
                ? "bg-[rgba(110,101,198,0.5)] cursor-not-allowed"
                : "bg-[rgba(110,101,198,0.93)] hover:bg-[rgba(110,101,198,1)]"}`}
            aria-busy={generating}
          >
            {generating ? "생성 중…" : generateText}
          </button>
        )}
      </div>
    </section>
  );
}
