// src/pages/Dashboard/sections/ClassMetrics.jsx
import React from "react";

export default function ClassMetrics({
  title = "학급 정보",
  items = [],
  // Builder export를 그대로 넘길 수도 있게 옵션으로 받음
  metrics,
  className = "",
}) {
  // 1) 우선순위: items(프로젝트 포맷) → metrics(Builder 포맷) → 기본 더미
  const data =
    items.length
      ? items // [{ icon: "/path.svg", label, value }]
      : metrics?.length
      ? // Builder 포맷 -> 프로젝트 포맷으로 매핑
        metrics.map((m) => ({
          iconSvg: m.icon, // React 노드
          label: m.label,
          value: m.value,
        }))
      : [
          { icon: "/src/assets/icons/dashboard/metric-class.svg", label: "학급", value: "6학년 3반" },
          { icon: "/src/assets/icons/dashboard/metric-attendance-rate.svg", label: "출석률", value: "96.4%" },
          { icon: "/src/assets/icons/dashboard/metric-counsel-week.svg", label: "이번 주 상담", value: "5건" },
        ];

  return (
    <section className={`mt-6 ${className}`}>
      {/* 섹션 헤더: 프로젝트 골격 유지 */}
      <header className="mb-3 flex items-center gap-2">
        <img
          src="/src/assets/icons/dashboard/h2-class-metrics.svg"
          className="h-5 w-5"
          alt=""
          loading="lazy"
        />
        <h3 className="text-lg font-semibold">{title}</h3>
      </header>

      {/* 카드 그리드: 반응형 3열 */}
      <div className="grid gap-3 md:grid-cols-3">
        {data.map((m, i) => (
          <div key={m.id ?? m.label ?? i} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2 text-slate-500">
              {/* 아이콘: 파일 경로 or Builder의 React SVG 모두 지원 */}
              {typeof m.icon === "string" ? (
                <img src={m.icon} className="h-5 w-5 shrink-0" alt="" loading="lazy" />
              ) : m.iconSvg ? (
                <span className="h-5 w-5 shrink-0 [&>svg]:h-5 [&>svg]:w-5">{m.iconSvg}</span>
              ) : m.icon ? (
                <span className="h-5 w-5 shrink-0 [&>svg]:h-5 [&>svg]:w-5">{m.icon}</span>
              ) : null}

              <span className="text-sm">{m.label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{m.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
