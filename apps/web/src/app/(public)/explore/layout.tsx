import React from "react";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/40 text-gray-900 selection:bg-blue-600 selection:text-white">
      {children}
    </div>
  );
}
