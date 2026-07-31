"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  ThumbsUp,
  ThumbsDown,
  Download,
  Share2,
  CheckCircle2,
  Globe,
  ArrowRight,
  ArrowLeft,
  Flag,
  Sparkles,
} from "lucide-react";

export default function TemplateDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const templatesData: Record<
    string,
    {
      id: string;
      title: string;
      category: string;
      subcategory: string;
      country: string;
      language: string;
      tags: string[];
      votes: number;
      downloads: string;
      contributor: string;
      description: string;
    }
  > = {
    "drake-hotline-bling": {
      id: "tpl-1",
      title: "Drake Hotline Bling - Modern Tech Stack",
      category: "Programming",
      subcategory: "React / Next.js",
      country: "Global",
      language: "English",
      tags: ["#coding", "#webdev", "#react"],
      votes: 14290,
      downloads: "45.2K",
      contributor: "alex_dev",
      description: "Classic Drake hotline bling comparison format optimized for developer tech stack comparisons and code refactoring memes.",
    },
    "distracted-boyfriend": {
      id: "tpl-2",
      title: "Distracted Boyfriend - Marketing Channels",
      category: "Marketing",
      subcategory: "SaaS & Paid Ads",
      country: "United States",
      language: "English",
      tags: ["#marketing", "#saas", "#growth"],
      votes: 11840,
      downloads: "38.9K",
      contributor: "growth_guru",
      description: "Distracted boyfriend meme template for B2B growth tactics, ad channels, and customer acquisition comparisons.",
    },
    "expanding-brain": {
      id: "tpl-3",
      title: "Expanding Brain - Restaurant Ordering",
      category: "Restaurants",
      subcategory: "POS & Delivery",
      country: "United Kingdom",
      language: "English",
      tags: ["#food", "#restaurant", "#pos"],
      votes: 8920,
      downloads: "24.1K",
      contributor: "chef_mark",
      description: "Multi-tier expanding brain format for restaurant automation, online ordering systems, and dining culture.",
    },
    "two-buttons": {
      id: "tpl-4",
      title: "Two Buttons - Crypto Investment Strategy",
      category: "Finance",
      subcategory: "Crypto & Trading",
      country: "Global",
      language: "English",
      tags: ["#crypto", "#finance", "#trading"],
      votes: 19450,
      downloads: "62.4K",
      contributor: "crypto_trader",
      description: "Daily sweat button choice template for finance risk management and trading decisions.",
    },
    "woman-yelling-at-cat": {
      id: "tpl-5",
      title: "Woman Yelling at Cat - Esports Match",
      category: "Gaming",
      subcategory: "FPS & Esports",
      country: "Canada",
      language: "English",
      tags: ["#gaming", "#esports", "#fps"],
      votes: 9630,
      downloads: "29.8K",
      contributor: "gamer_pro",
      description: "Woman yelling vs confused cat meme format for esports arguments and competitive gaming scenarios.",
    },
    "change-my-mind": {
      id: "tpl-6",
      title: "Change My Mind - Startup Fundraising",
      category: "Startups",
      subcategory: "Venture Capital",
      country: "United States",
      language: "English",
      tags: ["#startup", "#vc", "#founders"],
      votes: 16810,
      downloads: "51.3K",
      contributor: "vc_insider",
      description: "Steven Crowder change my mind table format for startup valuation and venture capital hot takes.",
    },
    "tpl-1": {
      id: "tpl-1",
      title: "Drake Hotline Bling - Modern Tech Stack",
      category: "Programming",
      subcategory: "React / Next.js",
      country: "Global",
      language: "English",
      tags: ["#coding", "#webdev", "#react"],
      votes: 14290,
      downloads: "45.2K",
      contributor: "alex_dev",
      description: "Classic Drake hotline bling comparison format optimized for developer tech stack comparisons and code refactoring memes.",
    },
    "tpl-2": {
      id: "tpl-2",
      title: "Distracted Boyfriend - Marketing Channels",
      category: "Marketing",
      subcategory: "SaaS & Paid Ads",
      country: "United States",
      language: "English",
      tags: ["#marketing", "#saas", "#growth"],
      votes: 11840,
      downloads: "38.9K",
      contributor: "growth_guru",
      description: "Distracted boyfriend meme template for B2B growth tactics, ad channels, and customer acquisition comparisons.",
    },
  };

  // Trigger HTTP 404 Page Not Found if template slug does not exist!
  if (!slug || !templatesData[slug]) {
    notFound();
  }

  const template = templatesData[slug];
  const [votes, setVotes] = useState(template.votes);
  const [userVoted, setUserVoted] = useState<"up" | "down" | null>(null);

  const handleVote = (type: "up" | "down") => {
    if (userVoted === type) {
      setUserVoted(null);
      setVotes(type === "up" ? votes - 1 : votes + 1);
    } else {
      if (type === "up") setVotes(userVoted === "down" ? votes + 2 : votes + 1);
      if (type === "down") setVotes(userVoted === "up" ? votes - 2 : votes - 1);
      setUserVoted(type);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Templates Library</span>
            </Link>
          </div>

          <div className="virlio-surface p-8 sm:p-10 border border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Meme Template Image Preview Box */}
            <div className="lg:col-span-6 bg-gray-100 rounded-2xl border border-gray-200 aspect-[4/3] flex items-center justify-center text-sm font-mono text-gray-400 p-6 text-center">
              [Template Asset Preview: {template.title}]
            </div>

            {/* Template Info & Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {template.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AI Approved</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                  {template.title}
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                  {template.description}
                </p>

                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4 mb-4">
                  <p>
                    <span className="font-semibold text-gray-900">Contributor:</span>{" "}
                    <Link href={`/profiles/${template.contributor}`} className="text-blue-600 hover:underline font-bold">
                      @{template.contributor}
                    </Link>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Category / Subcategory:</span> {template.category} • {template.subcategory}
                  </p>
                  <p className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-gray-400" /> {template.country} • {template.language}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((t) => (
                    <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => handleVote("up")}
                      className={`p-1.5 rounded-lg transition-colors ${
                        userVoted === "up" ? "bg-blue-600 text-white font-bold" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-gray-900 px-2">{votes.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => handleVote("down")}
                      className={`p-1.5 rounded-lg transition-colors ${
                        userVoted === "down" ? "bg-red-600 text-white font-bold" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 px-2">
                    <Download className="w-4 h-4 text-gray-400" /> {template.downloads}
                  </span>
                </div>

                <Link
                  href={`/dashboard/generator?template=${template.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
