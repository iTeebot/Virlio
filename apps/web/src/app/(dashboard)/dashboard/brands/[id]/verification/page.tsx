"use client";

import React, { useState } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { WebsiteVerificationWidget } from "@/components/brands/website-verification-widget";
import { SharedImageUploader } from "@/components/brands/shared-image-uploader";
import { calculateBrandTrustScore } from "@/lib/services/brand-trust-score.service";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Camera,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Building2,
  Check,
  Plus,
} from "lucide-react";

export default function BrandVerificationSubPage() {
  const { currentBrand } = useBrand();
  const [verifying, setVerifying] = useState(false);
  const [verifEvidence, setVerifEvidence] = useState<any>({
    storefront_photos: [],
    business_card_url: "",
    dns_txt_record: "",
    meta_tag: "",
  });

  if (!currentBrand) return null;

  const scoreResult = calculateBrandTrustScore(currentBrand, verifEvidence);
  const isVerified = currentBrand.verification_status === "verified" || scoreResult.isVerified;
  const trustScore = currentBrand.ai_confidence_score || scoreResult.trustScore;

  const handleRunVerification = async (passedEvidence?: any) => {
    setVerifying(true);
    const targetEvidence =
      passedEvidence &&
      typeof passedEvidence === "object" &&
      !("nativeEvent" in passedEvidence) &&
      !("target" in passedEvidence)
        ? passedEvidence
        : verifEvidence;

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceData: targetEvidence }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Header Overview Cards: Binary Status vs Trust Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Card (Binary State) */}
        <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            Verification Status
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isVerified ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}>
                {isVerified ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {isVerified ? "Verified Brand" : "Pending Verification"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isVerified
                    ? "Minimum ownership requirements met."
                    : "Complete domain ownership or email proof to verify."}
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase border ${
              isVerified ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
            }`}>
              {isVerified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>

        {/* Trust & Verification Score Card (0 to 100 PTS) */}
        <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Trust & Verification Score
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              100 PTS Max
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 tracking-tight">{trustScore}</span>
              <span className="text-sm font-bold text-gray-400">/ 100 points</span>
            </div>

            <button
              type="button"
              onClick={() => handleRunVerification()}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {verifying ? "Evaluating..." : "Re-evaluate Score"}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, trustScore))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. "Improve Your Score" Panel */}
      {scoreResult.improvementSuggestions.length > 0 && (
        <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-3xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-200/80">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-blue-950">Improve Your Verification Score</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <span>Current: <strong>{trustScore} / 100</strong></span>
              <span>➔</span>
              <span>Potential Score: <strong className="text-emerald-700">100 / 100</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scoreResult.improvementSuggestions.slice(0, 6).map((sugg, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-gray-900 truncate">• {sugg.item.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{sugg.item.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black shrink-0">
                  +{sugg.item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Transparent 100-Point Verification Checklist */}
      <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Verification Progress Checklist
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Itemized points breakdown contributing to your brand's trust score.
            </p>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {scoreResult.checklist.filter((i) => i.achieved).length} of {scoreResult.checklist.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scoreResult.checklist.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                item.achieved
                  ? "bg-emerald-50/40 border-emerald-200 text-emerald-950"
                  : "bg-gray-50/60 border-gray-200 text-gray-600"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    item.achieved
                      ? "bg-emerald-600 text-white"
                      : "border-2 border-gray-300 bg-white"
                  }`}
                >
                  {item.achieved ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                </div>
                <div className="truncate">
                  <p className="font-bold truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{item.description}</p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black shrink-0 ${
                  item.achieved
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                +{item.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Domain Ownership Verification Widget */}
      <WebsiteVerificationWidget
        websiteUrl={verifEvidence.website || currentBrand.website || ""}
        onWebsiteChange={(url) => setVerifEvidence((prev: any) => ({ ...prev, website: url }))}
        initialVerified={isVerified}
        initialToken={
          currentBrand.verification?.evidence_data?.dns_txt_record ||
          currentBrand.verification?.evidence_data?.meta_tag ||
          ""
        }
        onVerificationUpdate={(res) => {
          if (res.verified) {
            const updated = {
              ...verifEvidence,
              dns_txt_record: res.method === "dns_txt" ? res.token : verifEvidence.dns_txt_record,
              meta_tag: res.method === "html_meta" ? res.token : verifEvidence.meta_tag,
            };
            setVerifEvidence(updated);
            handleRunVerification(updated);
          }
        }}
      />

      {/* 5. Additional Proof Uploader */}
      <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
          <Camera className="w-5 h-5 text-blue-600" />
          Additional Business Proof & Storefront Documentation (+15 PTS)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SharedImageUploader
            label="Storefront / Office Photo (+5 PTS)"
            value={verifEvidence.storefront_photos?.[0] || ""}
            onChange={(url) => setVerifEvidence((prev: any) => ({ ...prev, storefront_photos: [url] }))}
            folder="virlio/storefront-photos"
            description="Upload photo showing storefront sign, office interior, or product inventory."
          />

          <SharedImageUploader
            label="Business License / Registration Doc (+10 PTS)"
            value={verifEvidence.business_card_url || ""}
            onChange={(url) => setVerifEvidence((prev: any) => ({ ...prev, business_card_url: url }))}
            folder="virlio/business-cards"
            description="Upload official business registration document, catalog, or business card."
          />
        </div>
      </div>
    </div>
  );
}
