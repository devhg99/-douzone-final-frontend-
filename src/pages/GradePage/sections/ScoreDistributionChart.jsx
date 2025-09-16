// src/pages/GradePage/sections/ScoreDistributionChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function ScoreDistributionChart({ distribution, overview }) {
  const labels = Object.keys(distribution);
  const values = Object.values(distribution);

  const data = {
    labels,
    datasets: [
      {
        label: "학생 수",
        data: values,
        backgroundColor: [
          "#22c55e", // 90+
          "#3b82f6", // 80~89
          "#f59e0b", // 70~79
          "#f97316", // 60~69
          "#ef4444", // 0~59
        ],
      },
    ],
  };

  return (
    <Doughnut
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            formatter: (val, ctx) => {
              const label = ctx.chart.data.labels[ctx.dataIndex];
              return `${val}명`; // ✅ 차트 위에 인원 표시
            },
            color: "#fff",
            font: { size: 11, weight: "bold" },
          },
          tooltip: { enabled: true },
          legend: { position: "right" },
        },
      }}
    />
  );
}
