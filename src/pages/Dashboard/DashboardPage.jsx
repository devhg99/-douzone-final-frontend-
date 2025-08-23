// src/pages/Dashboard/DashboardPage.jsx
import React from "react";
import HeroBanner from "./sections/HeroBanner";
import ClassMetrics from "./sections/ClassMetrics";
import QuickActions from "./sections/QuickActions";
import Notices from "./sections/Notices";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <HeroBanner />
      <ClassMetrics />
      <QuickActions />
      <Notices />
    </div>
  );
}
