import React from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <DashboardHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
