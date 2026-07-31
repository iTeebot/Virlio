import React from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Zap, Users } from "lucide-react";
import { MemePipelineFlow } from "@/components/marketing/meme-pipeline-flow";

export function Hero() {
  return (
    <section className="pt-12 pb-16 lg:pt-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-8">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>The #1 AI Meme Generator Built for Verified Businesses</span>
        </div>

        {/* H1 SEO Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-6xl leading-tight">
          Turn Your Brand Into Viral Content with an{" "}
          <span className="text-blue-600">AI Meme Generator</span>
        </h1>

        {/* Supporting Paragraph */}
        <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
          Virlio helps real businesses create high-converting marketing memes using AI. Build a verified brand profile, select community templates, generate brand-safe captions, and automatically publish across social channels to grow your online presence.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard/generator"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-base font-semibold text-white transition-colors shadow-xs"
          >
            <span>Generate Your First Meme</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-6 py-3.5 text-base font-semibold text-gray-700 transition-colors shadow-xs"
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span>Browse Templates</span>
          </Link>
        </div>

        {/* Interactive Meme Pipeline Component */}
        <div className="mt-12 relative mx-auto max-w-6xl">
          <MemePipelineFlow />
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">AI Verified Brands</p>
              <p className="text-xs text-gray-500">Automated legitimacy checks</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Community Ecosystem</p>
              <p className="text-xs text-gray-500">Crowdsourced & moderated</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Instant Generation</p>
              <p className="text-xs text-gray-500">Sub-second caption AI</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Free Forever Plan</p>
              <p className="text-xs text-gray-500">No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
