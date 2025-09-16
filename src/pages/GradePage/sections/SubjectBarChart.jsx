// src/pages/GradePage/sections/SubjectBarChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

export default function SubjectBarChart({ subjectAvg }) {
  const labels = Object.keys(subjectAvg);
  const values = Object.values(subjectAvg);

  const backgroundColors = values.map((score) => {
    if (score >= 90) return "#22c55e"; // 초록
    if (score >= 80) return "#3b82f6"; // 파랑
    if (score >= 70) return "#f59e0b"; // 귤색
    if (score >= 60) return "#f97316"; // 주황
    return "#ef4444"; // 빨강
  });

  const data = {
    labels,
    datasets: [
      {
        label: "과목 평균 점수",
        data: values,
        backgroundColor: backgroundColors,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: (val) => val.toFixed(1), // 소수점 1자리
            color: "#111827", // 거의 검정색
            font: { size: 12, weight: "bold" },
          },
        },
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      }}
    />
  );
}
