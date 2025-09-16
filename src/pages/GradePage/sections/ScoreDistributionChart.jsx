// src/pages/GradePage/sections/ScoreDistributionChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

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
              hidden: false, // ✅ 줄 긋는 효과 제거 (무조건 표시)
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

  return <Doughnut data={data} options={options} plugins={[ChartDataLabels]} />;
}
