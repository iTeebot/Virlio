"use client";

import React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const rawCat = (params?.category as string) || "";

  const validCategories = ["programming", "marketing", "restaurants", "finance", "gaming", "startups", "real-estate"];

  if (!rawCat || !validCategories.includes(rawCat.toLowerCase())) {
    notFound();
  }

  const catName = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Categories</span>
            </Link>
          </div>

          <div className="virlio-surface p-8 sm:p-10 border border-gray-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Category Feed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 capitalize">{catName} Meme Templates</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Explore high-converting marketing memes and templates for {catName}.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
