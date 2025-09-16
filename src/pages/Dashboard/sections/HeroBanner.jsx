// src/pages/Dashboard/sections/HeroBanner.jsx
import React from "react";

export default function HeroBanner({
  title = "6학년 3반 김선생님 환영합니다! 👋",
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
  
  const handleClick = () => {
    // 헤더의 챗봇 버튼 클릭 이벤트를 트리거
    const chatButton = document.querySelector('[aria-label="채팅 토글"]');
    if (chatButton) {
      chatButton.click();
    }
  };

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
        className="group inline-flex items-center gap-2.5 rounded-full border border-white bg-white/20 px-4 py-2 backdrop-blur-[5px] transition-colors hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
         {/* Chatbot Icon */}
         {icon ?? (
           <svg
             width="56"
             height="56"
             viewBox="0 0 73 72"
             fill="none"
             xmlns="http://www.w3.org/2000/svg"
             className="w-14 h-14"
           >
             <path
               d="M37.7568 8H34.7568C22.3304 8 12.2568 18.0736 12.2568 30.5V33.5C12.2568 45.9264 22.3304 56 34.7568 56H37.7568C50.1832 56 60.2568 45.9264 60.2568 33.5V30.5C60.2568 18.0736 50.1832 8 37.7568 8Z"
               fill="url(#paint0_linear_287_2414)"
             />
             <path
               d="M36.2568 23C36.8091 23 37.2568 22.5523 37.2568 22C37.2568 21.4477 36.8091 21 36.2568 21C35.7046 21 35.2568 21.4477 35.2568 22C35.2568 22.5523 35.7046 23 36.2568 23Z"
               fill="white"
             />
             <path
               d="M42.2568 26H30.2568C29.1523 26 28.2568 26.8954 28.2568 28V36C28.2568 37.1046 29.1523 38 30.2568 38H42.2568C43.3614 38 44.2568 37.1046 44.2568 36V28C44.2568 26.8954 43.3614 26 42.2568 26Z"
               fill="white"
             />
             <path
               d="M32.2568 31.5C33.0853 31.5 33.7568 30.8284 33.7568 30C33.7568 29.1716 33.0853 28.5 32.2568 28.5C31.4284 28.5 30.7568 29.1716 30.7568 30C30.7568 30.8284 31.4284 31.5 32.2568 31.5Z"
               fill="#764BA2"
             />
             <path
               d="M40.2568 31.5C41.0853 31.5 41.7568 30.8284 41.7568 30C41.7568 29.1716 41.0853 28.5 40.2568 28.5C39.4284 28.5 38.7568 29.1716 38.7568 30C38.7568 30.8284 39.4284 31.5 40.2568 31.5Z"
               fill="#764BA2"
             />
             <path
               d="M37.7568 33H34.7568C34.4807 33 34.2568 33.2239 34.2568 33.5C34.2568 33.7761 34.4807 34 34.7568 34H37.7568C38.033 34 38.2568 33.7761 38.2568 33.5C38.2568 33.2239 38.033 33 37.7568 33Z"
               fill="#764BA2"
             />
             <defs>
               <linearGradient
                 id="paint0_linear_287_2414"
                 x1="12.2568"
                 y1="8"
                 x2="60.2568"
                 y2="56"
                 gradientUnits="userSpaceOnUse"
               >
                 <stop stopColor="#667EEA" />
                 <stop offset="1" stopColor="#764BA2" />
               </linearGradient>
             </defs>
           </svg>
         )}

        <span className="text-white text-center text-xl font-bold leading-normal">
          {label}
        </span>
      </button>
    </section>
  );
}



