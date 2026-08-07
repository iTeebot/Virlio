import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ExploreFeedSkeleton } from "@/components/ui/skeletons";

export default function ExploreLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="h-4 bg-gray-100 rounded-full w-48 mx-auto" />
            <div className="h-10 bg-gray-100 rounded-xl w-3/4 mx-auto" />
            <div className="h-5 bg-gray-100 rounded-md w-1/2 mx-auto" />
          </div>
          <ExploreFeedSkeleton />
        </div>
      </main>
      <Footer />
    </div>
  );
}
