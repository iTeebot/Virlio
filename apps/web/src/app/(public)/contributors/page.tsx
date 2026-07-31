"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Users, Upload, CheckCircle2, Award, Trophy, ShieldCheck, ArrowRight, User, Loader2 } from "lucide-react";

interface RealUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  trust_score?: number | null;
  contributor_score?: number | null;
}

export default function ContributorsPage() {
  const [users, setUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/users");
        if (res.ok) {
          const json = await res.json();
          setUsers(json.data || []);
        }
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const steps = [
    {
      step: "01",
      title: "Upload Template",
      desc: "Submit high-res meme templates with title, category, language, and tag metadata.",
      icon: Upload,
    },
    {
      step: "02",
      title: "AI Moderation",
      desc: "Automated OCR, vision duplicate scoring, and safety filters review submission.",
      icon: ShieldCheck,
    },
    {
      step: "03",
      title: "Earn Attribution",
      desc: "Your profile is linked on every generated meme with full download analytics.",
      icon: Award,
    },
    {
      step: "04",
      title: "Rank on Leaderboard",
      desc: "Collect upvotes, level up badges, and climb the public contributor rankings.",
      icon: Trophy,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Title Banner */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-4">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Open Creator & Contributor Ecosystem</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
              Powered by Real Virlio Creators
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Join creators uploading meme templates, earning public attribution, leveling up badges, and helping verified brands go viral.
            </p>
          </div>

          {/* Real Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            <div className="virlio-card p-5 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-3xl font-extrabold text-gray-900">{users.length}</p>
              <p className="mt-1 text-xs text-gray-500 font-medium">Registered Creators</p>
            </div>
            <div className="virlio-card p-5 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-3xl font-extrabold text-blue-600">100%</p>
              <p className="mt-1 text-xs text-gray-500 font-medium">Public Attribution</p>
            </div>
            <div className="virlio-card p-5 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-3xl font-extrabold text-emerald-600">100 / 100</p>
              <p className="mt-1 text-xs text-gray-500 font-medium">Max Trust Score</p>
            </div>
            <div className="virlio-card p-5 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-3xl font-extrabold text-orange-500">$0</p>
              <p className="mt-1 text-xs text-gray-500 font-medium">Creator Fees</p>
            </div>
          </div>

          {/* How Contributors Work */}
          <div className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How Contributor Attribution Works</h2>
              <p className="mt-2 text-sm text-gray-600">A transparent 4-step path from upload to community recognition.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="virlio-card p-6 flex flex-col justify-between bg-white border border-gray-200 rounded-3xl">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">STEP {s.step}</span>
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Community Contributors */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Community Contributors</h2>
              <p className="mt-2 text-sm text-gray-600">Real registered creators on the Virlio platform.</p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading community creators...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="virlio-card p-8 bg-white border border-gray-200 rounded-3xl text-center text-xs text-gray-500">
                No public community creators registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((c) => {
                  const displayName = c.name || (c.username ? `@${c.username}` : "Virlio Creator");
                  const handle = c.username ? `@${c.username}` : c.email || "";

                  return (
                    <div key={c.id} className="virlio-card p-6 flex flex-col justify-between bg-white border border-gray-200 rounded-3xl">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <Link href={c.username ? `/profiles/${c.username}` : "#"} className="flex items-center gap-3 group">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                              {c.image ? (
                                <Image src={c.image} alt={displayName} fill unoptimized className="object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{displayName}</h3>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              </div>
                              <p className="text-xs text-gray-500">{handle} • <span className="uppercase text-blue-600 font-bold">{c.role || "User"}</span></p>
                            </div>
                          </Link>

                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Trust: {c.trust_score ?? 100}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">Contributor Score: {c.contributor_score || 0} pts</span>
                        {c.username && (
                          <Link
                            href={`/profiles/${c.username}`}
                            className="font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                          >
                            <span>View Profile</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Join Creator CTA */}
          <div className="virlio-surface p-10 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Become a Virlio Template Contributor</h2>
            <p className="mt-2 max-w-xl mx-auto text-sm text-gray-600">Share your meme templates with verified brands and build your public creator portfolio.</p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/dashboard/templates/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors shadow-xs"
              >
                <span>Upload Your First Template</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
