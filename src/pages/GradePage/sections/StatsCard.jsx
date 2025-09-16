// src/pages/GradePage/sections/StatsCard.jsx
import React from "react";

export default function StatsCard({ label, value, sub, color }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      {/* 라벨 */}
      <p className="text-sm text-gray-500">{label}</p>

      {/* 메인 값 */}
      <h3 className={`text-2xl font-bold mt-1 ${color || "text-gray-800"}`}>
        {value}
      </h3>

      {/* 서브 설명 */}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
