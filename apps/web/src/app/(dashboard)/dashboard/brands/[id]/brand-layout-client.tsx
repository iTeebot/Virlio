"use client";

import React, { useState } from "react";
import { BrandProvider } from "@/components/dashboard/brand-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export function BrandLayoutClient({
  currentBrand,
  userBrands,
  user,
  children,
}: {
  currentBrand: any;
  userBrands: any[];
  user: any;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BrandProvider initialBrand={currentBrand} initialUserBrands={userBrands}>
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
        <DashboardHeader
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          user={user}
        />

        <div className="flex-1 flex w-full overflow-hidden">
          <DashboardSidebar
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </BrandProvider>
  );
}
