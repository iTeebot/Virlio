import React from "react";

export function ExploreFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="virlio-card bg-white border border-gray-200 rounded-2xl overflow-hidden p-3 space-y-3">
          <div className="aspect-square bg-gray-100 rounded-xl w-full" />
          <div className="h-4 bg-gray-100 rounded-md w-3/4" />
          <div className="flex items-center justify-between pt-2">
            <div className="h-3 bg-gray-100 rounded-md w-1/3" />
            <div className="h-3 bg-gray-100 rounded-md w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BadgesGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="p-3 rounded-2xl border border-gray-200 bg-gray-50 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl mx-auto bg-gray-200" />
          <div className="h-3 bg-gray-200 rounded-md w-3/4 mx-auto" />
          <div className="h-2 bg-gray-200 rounded-md w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function LeaderboardTableSkeleton() {
  return (
    <div className="virlio-card overflow-hidden bg-white border border-gray-200 rounded-3xl animate-pulse">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded-md w-1/4" />
        <div className="h-4 bg-gray-200 rounded-md w-1/6" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-1/3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="h-4 bg-gray-200 rounded-md w-3/4" />
            </div>
            <div className="h-4 bg-gray-200 rounded-md w-1/6" />
            <div className="h-4 bg-gray-200 rounded-md w-1/8" />
          </div>
        ))}
      </div>
    </div>
  );
}
