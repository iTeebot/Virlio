"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/providers/user-store-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sparkles, ArrowRight, Building2, Layers } from "lucide-react";
import Link from "next/link";

export default function PublicGenerateEntryPage() {
  const router = useRouter();
  const { user, status } = useUserStore();

  useEffect(() => {
    // If authenticated, navigate straight to meme creation workspace
    if (status === "authenticated" && user) {
      router.replace("/dashboard/memes/create");
    }
  }, [status, user, router]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 mb-6">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Virlio AI Meme Studio</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight max-w-2xl">
          Generate Viral Branded Memes with AI
        </h1>

        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl font-medium">
          Create customized, high-converting branded memes using verified brand identities, custom templates, and AI-assisted caption generation.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/login?callbackUrl=/dashboard/memes/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-xs transition-colors"
          >
            <span>Start Free Generator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-gray-500" />
            <span>Browse Templates</span>
          </Link>
        </div>

        {/* Feature Grid Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
          <div className="p-5 bg-gray-50/70 border border-gray-200 rounded-2xl">
            <Building2 className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="text-sm font-bold text-gray-900">Brand Memory Engine</h3>
            <p className="text-xs text-gray-500 mt-1">
              AI automatically enforces tone, prohibited topics, colors, and official logos.
            </p>
          </div>

          <div className="p-5 bg-gray-50/70 border border-gray-200 rounded-2xl">
            <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="text-sm font-bold text-gray-900">Instant AI Captions</h3>
            <p className="text-xs text-gray-500 mt-1">
              Sub-second caption & hashtag strategy tailored to your exact target audience.
            </p>
          </div>

          <div className="p-5 bg-gray-50/70 border border-gray-200 rounded-2xl">
            <Layers className="w-6 h-6 text-emerald-600 mb-2" />
            <h3 className="text-sm font-bold text-gray-900">Community Templates</h3>
            <p className="text-xs text-gray-500 mt-1">
              Access thousands of moderated viral meme formats or contribute your own.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
