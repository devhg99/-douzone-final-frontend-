// src/pages/Dashboard/sections/ClassMetrics.jsx
import React, { useEffect, useState } from "react";

// 아이콘 import
import classIcon from "../../../assets/icons/dashboard/class.svg";
import attendanceIcon from "../../../assets/icons/dashboard/attendance.svg";
import counselIcon from "../../../assets/icons/dashboard/counseling.svg";
import headerIcon from "../../../assets/icons/dashboard/classinfo.svg";

// API 함수 import
import { fetchClassAttendanceSummary } from "../../../api/attendance";
import { fetchWeeklyMeetingStats } from "../../../api/meetings";
import { fetchClassById } from "../../../api/classes";   // ✅ 학급 정보 API 추가

export default function ClassMetrics({
  title = "학급 정보",
  classId = 1, // 기본값 (테스트용)
  className = "",
}) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // ✅ 세 가지 API 병렬 호출
        const [attendance, meetings, classInfo] = await Promise.all([
          fetchClassAttendanceSummary(classId),
          fetchWeeklyMeetingStats(),
          fetchClassById(classId),
        ]);

        console.log("출석률 응답:", attendance);
        console.log("주간 상담 응답:", meetings);
        console.log("학급 정보 응답:", classInfo);

        if (attendance?.data && meetings?.data && classInfo) {
          setMetrics({
            class: `${classInfo.grade}학년 ${classInfo.class_num}반`, // ✅ 여기서 조합
            attendance_rate: attendance.data.attendance_rate,
            weekly_counsel_count: meetings.data.weekly_meeting_count,
          });
        } else {
          console.warn("API 응답 구조 이상:", attendance, meetings, classInfo);
        }
      } catch (err) {
        console.error("학급 메트릭 불러오기 실패:", err);
      }
    }

    fetchMetrics();
  }, [classId]);

  // ✅ UI 렌더링 데이터
  const data = metrics
    ? [
        { icon: classIcon, label: "학급", value: metrics.class },
        { icon: attendanceIcon, label: "출석률", value: metrics.attendance_rate },
        { icon: counselIcon, label: "이번 주 상담", value: `${metrics.weekly_counsel_count}건` },
      ]
    : [
        { icon: classIcon, label: "학급", value: "로딩 중..." },
        { icon: attendanceIcon, label: "출석률", value: "..." },
        { icon: counselIcon, label: "이번 주 상담", value: "..." },
      ];

  return (
    <section className={`mt-6 ${className}`}>
      <header className="mb-3 flex items-center gap-2">
        <img src={headerIcon} className="h-5 w-5" alt="" loading="lazy" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {data.map((m, i) => (
          <div
            key={m.label ?? i}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <img src={m.icon} className="h-5 w-5 shrink-0" alt="" loading="lazy" />
              <span className="text-sm">{m.label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{m.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
