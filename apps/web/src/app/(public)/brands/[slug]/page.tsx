"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  CheckCircle2,
  Globe,
  Building2,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Phone,
  Sparkles,
  ExternalLink,
  MapPin,
  Calendar,
  Users,
  Tag,
  Share2,
  Package,
  Layers,
  Award,
  Clock,
} from "lucide-react";

export default function BrandDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";

  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawSlug) return;

    async function fetchBrand() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/brands/${encodeURIComponent(rawSlug)}`);
        const json = await res.json();

        if (res.ok && json.data) {
          setBrand(json.data);
        } else {
          setError(json.message || "Brand not found");
        }
      } catch (err: any) {
        setError("Failed to load brand profile");
      } finally {
        setLoading(false);
      }
    }

    fetchBrand();
  }, [rawSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
        <Header />
        <main className="flex-1 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
        <Header />
        <main className="flex-1 py-20 text-center">
          <div className="mx-auto max-w-md px-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ?
            </div>
            <h1 className="text-2xl font-black text-gray-900">Brand Not Found</h1>
            <p className="text-xs text-gray-600">
              The brand handle <span className="font-mono text-blue-600 font-bold">@{rawSlug}</span> is not registered or is private.
            </p>
            <div className="pt-4">
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Explore Brands Directory
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const socialLinks = brand.social_links || {};
  const settings = brand.settings || {};
  const metadata = brand.metadata || {};
  const colors = settings.colors || {};

  const isVerified = brand.verification_status === "verified";
  const confidenceScore = brand.ai_confidence_score || brand.digital_presence_score || 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 pb-20">
        {/* Cover Banner Header - Full Height Display */}
        <div className="relative w-full h-64 sm:h-80 md:h-[400px] bg-slate-950 overflow-hidden">
          {brand.banner_url ? (
            <img src={brand.banner_url} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-950 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-slate-800" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Brand Card Content Container */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 space-y-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white shadow-xl p-1 shrink-0 flex items-center justify-center overflow-hidden -mt-16 sm:-mt-20">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-blue-600 text-white font-black text-3xl flex items-center justify-center rounded-xl">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{brand.name}</h1>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Brand ({confidenceScore}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="text-blue-600 font-mono font-bold">@{brand.slug}</span>
                    <span>•</span>
                    <span>{brand.industry || "Business"}</span>
                    {brand.country && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {brand.country}
                        </span>
                      </>
                    )}
                  </p>

                  {metadata.tagline && (
                    <p className="text-sm font-medium text-gray-700 italic mt-2">"{metadata.tagline}"</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {brand.website && (
                  <a
                    href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <Globe className="w-4 h-4" /> Visit Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Description & Overview */}
            {brand.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">About {brand.name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{brand.description}</p>
              </div>
            )}

            {/* Metadata Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-xs">
              {settings.business_type && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block font-semibold">Business Type</span>
                  <span className="font-bold text-gray-900">{settings.business_type}</span>
                </div>
              )}
              {settings.founded_year && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block font-semibold">Founded Year</span>
                  <span className="font-bold text-gray-900">{settings.founded_year}</span>
                </div>
              )}
              {settings.employee_size && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block font-semibold">Company Size</span>
                  <span className="font-bold text-gray-900">{settings.employee_size}</span>
                </div>
              )}
              {brand.contact_email && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block font-semibold">Contact Email</span>
                  <span className="font-bold text-blue-600 truncate block">{brand.contact_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Channels Section */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" /> Official Social Channels
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => {
                if (!url || typeof url !== "string" || platform === "website") return null;
                return (
                  <a
                    key={platform}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl flex items-center justify-between text-xs font-bold text-gray-800 hover:text-blue-700 transition-colors shadow-2xs group"
                  >
                    <span className="capitalize">{platform.replace("_", " ")}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
