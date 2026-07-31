"use client";

import React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, Globe, Building2, ArrowLeft, ArrowRight, Layers, ThumbsUp } from "lucide-react";

export default function BrandDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const validBrands: Record<
    string,
    {
      name: string;
      slug: string;
      industry: string;
      country: string;
      memesCount: number;
      followers: string;
      bio: string;
    }
  > = {
    "acme-corp": {
      name: "Acme SaaS Inc.",
      slug: "acme-corp",
      industry: "Software / SaaS",
      country: "United States",
      memesCount: 48,
      followers: "12.4K",
      bio: "Automating cloud infrastructure and developer workflows for modern software engineering teams.",
    },
    "tech-hub": {
      name: "TechHub Global",
      slug: "tech-hub",
      industry: "Technology",
      country: "Pakistan",
      memesCount: 32,
      followers: "8.9K",
      bio: "Empowering tech startups and software agencies across South Asia with digital growth solutions.",
    },
  };

  if (!slug || !validBrands[slug]) {
    notFound();
  }

  const brand = validBrands[slug];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/brands"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Verified Brands</span>
            </Link>
          </div>

          <div className="virlio-surface p-8 border border-gray-200 mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xl shadow-sm">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-gray-900">{brand.name}</h1>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  @{brand.slug} • {brand.industry} • {brand.country}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">{brand.bio}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
