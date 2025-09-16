// src/pages/GradePage/sections/StudentTable.jsx
import React from "react";

export default function StudentTable({ students }) {
  if (!students.length) return <p>학생 데이터 없음</p>;

  const subjects = Object.keys(students[0].scores || {});

  // 평균 점수 색상
  const getAverageColor = (score) => {
    if (score >= 90) return "text-green-600 font-semibold";
    if (score >= 80) return "text-blue-600 font-semibold";
    if (score >= 70) return "text-orange-500 font-semibold";
    if (score >= 60) return "text-amber-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  // 등수별 배경색 (6명 단위 그룹핑)
  const getRowBg = (rank) => {
    if (rank <= 6) return "bg-green-50";
    if (rank <= 12) return "bg-blue-50";
    if (rank <= 18) return "bg-orange-50";
    if (rank <= 24) return "bg-amber-50";
    return "bg-red-50";
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="table-auto border-collapse w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 border">등수</th>
                <th className="px-3 py-2 border">이름</th>
                {subjects.map((sub) => (
                  <th key={sub} className="px-3 py-2 border">{sub}</th>
                ))}
                <th className="px-3 py-2 border">평균</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.student_id}
                  className={`text-center ${getRowBg(s.rank)}`}
                >
                  <td className="border px-3 py-1">{s.rank}</td>
                  <td className="border px-3 py-1">{s.name}</td>
                  {subjects.map((sub) => (
                    <td
                      key={sub}
                      className="border px-3 py-1 text-gray-800"
                    >
                      {s.scores[sub] ?? "-"}
                    </td>
                  ))}
                  <td
                    className={`border px-3 py-1 ${getAverageColor(s.average)}`}
                  >
                    {s.average}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
