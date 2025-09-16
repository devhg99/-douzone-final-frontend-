// src/pages/GradePage/sections/ScoreDistributionChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// ✅ Chart.js 요소 등록 (앱 실행 시 최초 1회)
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function ScoreDistributionChart({ distribution = {}, overview }) {
  const labels = ["90-100", "80-89", "70-79", "60-69", "0-59"];
  const colors = ["#2ecc71", "#4287f5", "#FFA500", "#FF8C42", "#FF4C4C"];

  const data = {
    labels,
    datasets: [
      {
        data: labels.map((l) => distribution[l] || 0),
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label, i) => ({
              text: label,
              fillStyle: dataset.backgroundColor[i],
              index: i,
              hidden: false, // ✅ 범례 줄긋기 비활성화
            }));
          },
        },
      },
      datalabels: {
        color: "#fff",
        formatter: (value) => (value > 0 ? `${value}명` : ""),
        font: { weight: "bold" },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
