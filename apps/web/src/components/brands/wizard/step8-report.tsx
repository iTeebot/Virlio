"use client";

import React, { useState, useEffect } from "react";
import { Award, Sparkles, CheckCircle2, AlertCircle, RefreshCw, BarChart2 } from "lucide-react";

interface Step8Props {
  fullWizardData: any;
}

export function Step8ReportComponent({ fullWizardData }: Step8Props) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/brands/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandData: {
            ...fullWizardData.step1,
            ...fullWizardData.step2,
            ...fullWizardData.step5,
            social_links: fullWizardData.step6,
          },
          evidenceData: fullWizardData.step7,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setReport(json.data);
      }
    } catch (err) {
      console.error("Report generation error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading || !report) {
    return (
      <div className="p-12 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">Generating AI Brand Readiness & Quality Report...</h3>
        <p className="text-sm text-gray-600">Analyzing brand completeness, visual identity, meme readiness, and verification confidence.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Step 8: AI Brand Analysis & Readiness Scorecard
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Comprehensive pre-submission diagnostic evaluation powered by Virlio AI.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-Analyze
        </button>
      </div>

      {/* Summary Box */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl shadow-xs">
        <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Executive AI Summary
        </h3>
        <p className="text-sm text-gray-900 mt-1 font-medium">{report.summary}</p>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Overall Brand Readiness</span>
          <span className="text-3xl font-black text-blue-600 mt-1 block">{report.brandReadinessScore}%</span>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Verification Confidence</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{report.verificationConfidenceScore}%</span>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">AI Knowledge Readiness</span>
          <span className="text-3xl font-black text-purple-600 mt-1 block">{report.aiReadinessScore}%</span>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Meme Viral Potential</span>
          <span className="text-3xl font-black text-amber-500 mt-1 block">{report.memeReadinessScore}%</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-600" />
          Dimension Breakdown
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Profile Completeness</span>
              <span>{report.profileCompleteness}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${report.profileCompleteness}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Marketing Readiness</span>
              <span>{report.marketingReadinessScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${report.marketingReadinessScore}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Brand Visual Consistency</span>
              <span>{report.brandConsistencyScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${report.brandConsistencyScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Missing Assets & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {report.missingAssets?.length > 0 && (
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Missing Optional Assets
            </h3>
            <ul className="text-xs text-amber-950 space-y-1">
              {report.missingAssets.map((asset: string, idx: number) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{asset}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.recommendations?.length > 0 && (
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Strategic Recommendations
            </h3>
            <ul className="text-xs text-blue-950 space-y-1">
              {report.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
