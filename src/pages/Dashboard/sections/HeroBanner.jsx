// src/pages/Dashboard/sections/HeroBanner.jsx
import React from "react";

export default function HeroBanner({
  title = "6학년 2반 김선생님 환영합니다! 👋",
  subtitle = "AI 교사 업무 지원 시스템으로 업무 효율성을 높여보세요",
  ctaLabel,        // 기존 프로젝트 명칭
  ctaText,         // Builder export 명칭
  onClickCta,      // 기존 프로젝트 명칭
  onCtaClick,      // Builder export 명칭
  className = "",
  // 필요시 외부에서 아이콘 바꾸고 싶을 때 주입
  icon = null,
}) {
  const label = ctaText ?? ctaLabel ?? "AI 챗봇과 대화 시작하기";
  const handleClick = onClickCta ?? onCtaClick;

  return (
    <section
      className={[
        "flex flex-col items-center justify-center gap-3 w-full",
        "rounded-xl bg-gradient-to-r from-[#667EEA] to-[#764BA2]",
        "shadow-[0_8px_32px_0_rgba(102,126,234,0.30)] py-6 px-8",
        className,
      ].join(" ")}
    >
      <h1 className="text-white text-2xl font-bold leading-normal text-center">
        {title}
      </h1>

      <p className="text-white text-base font-medium leading-normal opacity-90 text-center">
        {subtitle}
      </p>

      <button
        type="button"
        onClick={handleClick}
        className="group inline-flex items-center gap-2.5 rounded-full border border-white bg-white/20 px-8 py-4 backdrop-blur-[5px] transition-colors hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        {/* Builder의 SVG 아이콘은 <defs> 충돌 우려가 있어 Tailwind로 동일 톤을 재현 */}
        {icon ?? (
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#667EEA] to-[#764BA2]">
            <span className="relative flex h-4 w-6 items-center justify-center rounded-sm bg-white">
              <span className="absolute top-0 h-2 w-1 rounded-sm bg-gradient-to-b from-[#667EEA] to-[#764BA2]" />
              <span className="absolute bottom-1 h-1 w-2 rounded-sm bg-[#764BA2]" />
            </span>
            <span className="absolute -top-0.5 h-2 w-1 rounded-sm bg-white" />
            <span className="absolute -top-1 h-0.5 w-0.5 rounded-full bg-white" />
            <span className="absolute -left-1 top-1 h-0.5 w-0.5 rounded-full bg-[#764BA2]" />
            <span className="absolute -right-1 top-1 h-0.5 w-0.5 rounded-full bg-[#764BA2]" />
          </span>
        )}

        <span className="text-white text-center text-xl font-bold leading-normal">
          {label}
        </span>
      </button>
    </section>
  );
}
