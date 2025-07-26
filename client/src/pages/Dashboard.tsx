import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentCases from "@/components/dashboard/RecentCases";
import QuickCaseEntry from "@/components/dashboard/QuickCaseEntry";
import CasesByType from "@/components/dashboard/CasesByType";
import CaseTemplates from "@/components/dashboard/CaseTemplates";
import OngoingCases from "@/components/dashboard/OngoingCases";
import NewCaseModal from "@/components/modals/NewCaseModal";

export default function Dashboard() {
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout
      title="Dashboard"
      subtitle={currentDate}
      onNewCase={() => setIsNewCaseModalOpen(true)}
    >
      <div className="space-y-8">
        {/* Quick Stats Cards */}
        <StatsCards />

        {/* Ongoing Cases - Prominent section at top */}
        <OngoingCases />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases Panel */}
          <div className="lg:col-span-2">
            <RecentCases />
          </div>

          {/* Right Sidebar Panels */}
          <div className="space-y-6">
            {/* Quick Case Entry */}
            <QuickCaseEntry />

            {/* Analytics Chart */}
            <CasesByType />

            {/* Recent Templates */}
            <CaseTemplates />
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
      />
    </MainLayout>
  );
}
