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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchGradesDashboard(1); // ✅ class_id 1
        setData(res.data);
      } catch (err) {
        console.error("성적평가 불러오기 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p className="text-red-500">에러: {error}</p>;
  if (!data) return <p>데이터 없음</p>;

  return (
    // ✅ 중앙정렬(mx-auto) 제거, flex-1로 확장
    <div className="flex-1 p-6 space-y-6 overflow-x-auto">

      {/* 상단 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          label="학급 평균"
          value={`${data.overview?.class_avg ?? "-"}점`}
          sub={`최고 ${data.overview?.highest ?? "-"} / 최저 ${data.overview?.lowest ?? "-"}`}
          color="text-blue-600"
        />
        <StatsCard
          label="과목별 반평균"
          value={`국어 ${data.subject_avg?.["국어"] ?? "-"}점`}
          sub={`수학 ${data.subject_avg?.["수학"] ?? "-"} / 영어 ${data.subject_avg?.["영어"] ?? "-"}`}
          color="text-green-600"
        />
        <StatsCard
          label="성적 분포"
          value="주요 구간"
          sub={`70~79점: ${data.distribution?.["70-79"] ?? 0}명`}
          color="text-purple-600"
        />
        <StatsCard
          label="개별지도 필요"
          value={`${data.overview?.need_guidance ?? 0}명`}
          sub={`65점 미만: ${(data.alerts?.below_threshold || []).map((s) => s.name).join(", ")}`}
          color="text-red-600"
        />
      </div>

      {/* 학생별 성적표 */}
      <StudentTable students={data.students || []} />

      {/* 차트 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4 h-[350px]">
          <h3 className="text-lg font-semibold mb-2">📊 과목별 평균 비교</h3>
          <SubjectBarChart subjectAvg={data.subject_avg || {}} />
        </div>
        <div className="bg-white shadow rounded-lg p-4 h-[350px]">
          <h3 className="text-lg font-semibold mb-2">📈 성적 분포 현황</h3>
          <ScoreDistributionChart
            distribution={data.distribution || {}}
            overview={data.overview}
          />
        </div>
      </div>
    </div>
  );
}
