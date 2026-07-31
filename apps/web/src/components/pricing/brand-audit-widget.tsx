"use client";

import React, { useState } from "react";
import { BrandAuditRecommendation } from "@/types/pricing";
import { ShieldCheck, AlertCircle, ArrowRight, Sparkles, CheckCircle2, ChevronRight, Gauge, Lock, Search, Smartphone } from "lucide-react";

interface BrandAuditWidgetProps {
  onRequestConsultation: (serviceId: string) => void;
}

export function BrandAuditWidget({ onRequestConsultation }: BrandAuditWidgetProps) {
  const [selectedPriority, setSelectedPriority] = useState<"All" | "High" | "Medium" | "Low">("All");

  const recommendations: BrandAuditRecommendation[] = [
    {
      id: "rec-booking",
      title: "Missing Online Appointment & Booking Engine",
      category: "Lead Capture & Conversions",
      priority: "High",
      impact: "high",
      difficulty: "Medium",
      reasoning: "Your website currently lacks instant online appointment scheduling. Potential clients bounce when forced to call or email manually during non-business hours.",
      expectedOutcome: "+35% increase in weekly booked consultations and direct calendar sync.",
      teebotServiceId: "Booking & Appointment System",
      actionText: "Request Booking Engine Build",
    },
    {
      id: "rec-crm",
      title: "No Automated Lead Capture & CRM Pipeline",
      category: "Business Automation",
      priority: "High",
      impact: "high",
      difficulty: "Medium",
      reasoning: "Form submissions are sent to unmonitored inbox emails without instant automated SMS/email follow-up or lead scoring CRM.",
      expectedOutcome: "Reduce lead response time from 14 hours to < 60 seconds with automated workflows.",
      teebotServiceId: "CRM System",
      actionText: "Request CRM Integration",
    },
    {
      id: "rec-seo",
      title: "Outdated Mobile Performance & Local SEO Schema",
      category: "Organic Visibility",
      priority: "High",
      impact: "high",
      difficulty: "Low",
      reasoning: "Page load speed exceeds 4.2s on mobile devices. Missing structured JSON-LD local business schema for Google Search & Maps ranking.",
      expectedOutcome: "Achieve < 1.0s Core Web Vitals and Top 3 Google Local Pack positioning.",
      teebotServiceId: "SEO & Performance Audit",
      actionText: "Request SEO & Performance Audit",
    },
    {
      id: "rec-chatbot",
      title: "24/7 AI Customer Support Agent Missing",
      category: "Customer Support",
      priority: "Medium",
      impact: "medium",
      difficulty: "Medium",
      reasoning: "Website visitors asking repetitive pricing or service availability questions leave without converting.",
      expectedOutcome: "Automate 80% of common customer inquiries with an intelligent AI chatbot trained on your docs.",
      teebotServiceId: "AI Agents & Chatbots",
      actionText: "Request AI Agent Integration",
    },
    {
      id: "rec-ordering",
      title: "Third-Party POS & Online Ordering Disconnected",
      category: "E-Commerce",
      priority: "Medium",
      impact: "medium",
      difficulty: "High",
      reasoning: "Orders require manual re-entry into store terminal, leading to order delays and inventory discrepancies.",
      expectedOutcome: "Seamless real-time order sync directly to kitchen / POS display.",
      teebotServiceId: "Online Ordering & POS",
      actionText: "Request POS & Ordering Integration",
    },
  ];

  const filteredRecs = recommendations.filter((r) =>
    selectedPriority === "All" ? true : r.priority === selectedPriority
  );

  return (
    <div className="virlio-surface p-6 sm:p-8 border border-gray-200 my-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Automated Digital Audit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Brand Digital Health & Growth Audit
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Automated recommendations identified for your verified brand. Implement changes yourself or request Teebot professional engineering.
          </p>
        </div>

        {/* Digital Presence Score Badge */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-extrabold text-amber-700 text-lg">
            64
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Digital Presence Score</p>
            <p className="text-xs font-bold text-gray-900">Moderate Opportunities</p>
          </div>
        </div>
      </div>

      {/* Audit Pillars Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-b border-gray-200 text-xs">
        <div className="p-3 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Mobile Friendly</p>
            <p className="text-[10px] text-emerald-600 font-bold">Passed</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">HTTPS Security</p>
            <p className="text-[10px] text-emerald-600 font-bold">Secure</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Page Speed</p>
            <p className="text-[10px] text-amber-600 font-bold">Needs Work (4.2s)</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-gray-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">Schema & SEO</p>
            <p className="text-[10px] text-red-600 font-bold">Action Required</p>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 pt-6 mb-6">
        <span className="text-xs font-semibold text-gray-700 mr-2">Priority:</span>
        {(["All", "High", "Medium", "Low"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setSelectedPriority(p)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              selectedPriority === p
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            className="virlio-card p-5 bg-white border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-300 transition-all"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                    rec.priority === "High"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : rec.priority === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {rec.priority} Priority
                </span>
                <span className="text-xs text-gray-500 font-semibold">• {rec.category}</span>
              </div>

              <h3 className="text-base font-bold text-gray-900">{rec.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{rec.reasoning}</p>

              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Expected Outcome: {rec.expectedOutcome}</span>
              </div>
            </div>

            {/* Subtle Request Consultation Action */}
            <div className="shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => onRequestConsultation(rec.teebotServiceId)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 transition-colors"
              >
                <span>{rec.actionText}</span>
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
