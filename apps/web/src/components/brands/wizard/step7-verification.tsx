"use client";

import React, { useState, useEffect } from "react";
import { Step7VerificationEvidence } from "@/lib/validations/brand-wizard";
import { SharedImageUploader } from "../shared-image-uploader";
import { WebsiteVerificationWidget } from "../website-verification-widget";
import { ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, FileText, Camera, Code2, X } from "lucide-react";

interface Step7Props {
  data: Step7VerificationEvidence;
  onChange: (updated: Partial<Step7VerificationEvidence>) => void;
  brandContext: Record<string, any>;
  socialData: Record<string, any>;
}

export function Step7VerificationComponent({ data, onChange, brandContext, socialData }: Step7Props) {
  const [evaluating, setEvaluating] = useState(false);
  const [confidenceData, setConfidenceData] = useState<any>(null);

  const websiteUrl = socialData.website || brandContext.website || "";

  const runLiveConfidenceCheck = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/v1/brands/ai-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandData: {
            ...brandContext,
            social_links: socialData,
            contact_email: socialData.business_email,
            website: websiteUrl,
          },
          evidenceData: {
            ...data,
            phoneVerified: !!socialData.business_phone,
            emailVerified: !!socialData.business_email,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setConfidenceData(json.data);
      }
    } catch (err) {
      console.error("Confidence evaluation error", err);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    runLiveConfidenceCheck();
  }, []);

  const addPhotoUrl = (url: string) => {
    if (!url) return;
    const current = data.storefront_photos || [];
    if (!current.includes(url)) {
      onChange({ storefront_photos: [...current, url] });
    }
  };

  const removePhoto = (url: string) => {
    onChange({ storefront_photos: (data.storefront_photos || []).filter((p) => p !== url) });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Step 7: Confidence-Based Brand Verification
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Verification is confidence-based (0-100%), never binary. Non-digital storefronts without websites are 100% supported.
          </p>
        </div>
        <button
          type="button"
          onClick={runLiveConfidenceCheck}
          disabled={evaluating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 self-start sm:self-auto shadow-xs"
        >
          <Sparkles className={`w-4 h-4 ${evaluating ? "animate-spin" : ""}`} />
          {evaluating ? "Calculating..." : "Re-Calculate AI Confidence"}
        </button>
      </div>

      {/* Live AI Confidence Scorecard */}
      {confidenceData && (
        <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-lg font-black text-emerald-600 shadow-xs">
                {confidenceData.confidenceScore}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">Estimated Verification Confidence</span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase border ${
                    confidenceData.status === "verified"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : confidenceData.status === "needs_review"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}>
                    {confidenceData.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {confidenceData.status === "verified"
                    ? "High confidence score — eligible for instant verified status!"
                    : "Add optional proof below (photos, cards, documents) to reach 80%+ confidence."}
                </p>
              </div>
            </div>
          </div>

          {/* Reasoning */}
          {confidenceData.reasons?.length > 0 && (
            <div className="pt-3 border-t border-emerald-200/80 space-y-1">
              <span className="text-xs font-bold text-emerald-900">Verification Factors Passed:</span>
              <ul className="text-xs text-emerald-950 space-y-1">
                {confidenceData.reasons.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {confidenceData.recommendations?.length > 0 && (
            <div className="pt-3 border-t border-emerald-200/80 space-y-1">
              <span className="text-xs font-bold text-amber-900">Recommendations to Increase Confidence:</span>
              <ul className="text-xs text-amber-950 space-y-1">
                {confidenceData.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Proof Submission Options */}
      <div className="space-y-6">
        {/* Method 1: Website Ownership Verification Component */}
        <WebsiteVerificationWidget
          websiteUrl={websiteUrl}
          onWebsiteChange={(url) => onChange({ website: url } as any)}
          initialVerified={Boolean(data.dns_txt_record || data.meta_tag)}
          initialToken={data.dns_txt_record || data.meta_tag || ""}
          onVerificationUpdate={(res) => {
            if (res.verified) {
              onChange({
                dns_txt_record: res.method === "dns_txt" ? res.token : undefined,
                meta_tag: res.method === "html_meta" ? res.token : undefined,
              });
              runLiveConfidenceCheck();
            }
          }}
        />

        {/* Method 2: Storefront & Physical Business Photos via Universal SharedImageUploader */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            Storefront, Office & Business Photos (Great for Local Businesses & Cafes)
          </h3>
          <p className="text-xs text-gray-600">
            Upload photos showing your storefront sign, office, product stock, or workspace.
          </p>

          <SharedImageUploader
            label="Add Storefront Photo"
            description="Drag & drop, device upload, or paste URL"
            folder="virlio/storefront-photos"
            onChange={(url) => addPhotoUrl(url)}
          />

          <div className="flex flex-wrap gap-3 pt-2">
            {(data.storefront_photos || []).map((p, idx) => (
              <div key={idx} className="relative group p-1 bg-gray-50 border border-gray-200 rounded-xl">
                <img src={p} alt="Storefront proof" className="w-20 h-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removePhoto(p)}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Method 3: Document Proof via Universal SharedImageUploader */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Business Documentation (Business Card, Menu, Catalog, Tax or Registration)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SharedImageUploader
              label="Business Card or Catalog Document"
              value={data.business_card_url || ""}
              onChange={(url) => onChange({ business_card_url: url, catalog_url: url })}
              folder="virlio/business-cards"
            />

            <SharedImageUploader
              label="Tax / Official Registration Document (Optional)"
              value={data.tax_registration_url || ""}
              onChange={(url) => onChange({ tax_registration_url: url })}
              folder="virlio/tax-documents"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
