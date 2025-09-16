// src/pages/GradePage/GradeEvaluationPage.jsx
import React, { useEffect, useState } from "react";
import StatsCard from "./sections/StatsCard";
import StudentTable from "./sections/StudentTable";
import SubjectBarChart from "./sections/SubjectBarChart";
import ScoreDistributionChart from "./sections/ScoreDistributionChart";
import { fetchGradesDashboard } from "../../api/grades";

export default function GradeEvaluationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [term, setTerm] = useState("2학기"); // ✅ 기본값: 2학기

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchGradesDashboard(1, term); // ✅ class_id=1, term 전달
        setData(res.data);
      } catch (err) {
        console.error("성적평가 불러오기 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [term]);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p className="text-red-500">에러: {error}</p>;
  if (!data) return <p>데이터 없음</p>;

  // ✅ 전체 학생 수 계산
  const totalStudents = Object.values(data.distribution || {}).reduce(
    (a, b) => a + b,
    0
  );

  // ✅ 최다 구간 (예: 70-79)
  const maxRange = Object.entries(data.distribution || {}).reduce(
    (max, cur) => (cur[1] > max[1] ? cur : max),
    ["-", 0]
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-x-auto">
      {/* ✅ 학기 선택 드롭다운 */}
      <div className="flex justify-start mb-4">
        <label className="mr-2 text-sm font-medium text-gray-700">
          학기 선택:
        </label>
        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="1학기">1학기</option>
          <option value="2학기">2학기</option>
        </select>
      </div>

      {/* 상단 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          label="학급 평균"
          value={`${data.overview?.class_avg ?? "-"}점`}
          sub={`최고 ${data.overview?.highest ?? "-"} / 최저 ${
            data.overview?.lowest ?? "-"
          }`}
          color="text-blue-600"
        />
        <StatsCard
          label="과목별 반평균"
          value={`국어 ${data.subject_avg?.["국어"] ?? "-"}점`}
          sub={`수학 ${data.subject_avg?.["수학"] ?? "-"} / 영어 ${
            data.subject_avg?.["영어"] ?? "-"
          }`}
          color="text-green-600"
        />
        <StatsCard
          label="성적 분포"
          value={maxRange[0]} // ✅ 예: "70-79"
          sub={`최다 구간: ${maxRange[1]}명 (${(
            (maxRange[1] / (totalStudents || 1)) *
            100
          ).toFixed(1)}%)`}
          color="text-purple-600"
        />
        <StatsCard
          label="개별지도 필요"
          value={`${data.overview?.need_guidance ?? 0}명`}
          sub={`65점 미만: ${(data.alerts?.below_threshold || [])
            .map((s) => s.name)
            .join(", ")}`}
          color="text-red-600"
        />
      </div>

      {/* 학생별 성적표 */}
      <StudentTable students={data.students || []} />

      {/* 차트 (반응형 적용, 높이 축소 버전) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">📊 과목별 평균 비교</h3>
          <div className="w-full h-[220px] md:h-[280px] lg:h-[320px]">
            <SubjectBarChart subjectAvg={data.subject_avg || {}} />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">📈 성적 분포 현황</h3>
          <div className="w-full h-[220px] md:h-[280px] lg:h-[320px]">
            <ScoreDistributionChart
              distribution={data.distribution || {}}
              overview={data.overview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
