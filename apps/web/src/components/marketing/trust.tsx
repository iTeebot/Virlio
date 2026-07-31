import React from "react";
import { CheckCircle2, Shield, Users, Layers, Award } from "lucide-react";

export function TrustSection() {
  const trustPoints = [
    {
      title: "AI Brand Verification",
      description: "Our AI verifies company websites, registry data, and risk levels to ensure authentic brand identity.",
      icon: Shield,
    },
    {
      title: "Community Templates",
      description: "Access thousands of crowdsourced meme templates categorized by industry, language, and culture.",
      icon: Layers,
    },
    {
      title: "Multi-Stage AI Moderation",
      description: "Real-time safety guardrails check every template and caption for copyright, hate speech, and NSFW risks.",
      icon: CheckCircle2,
    },
    {
      title: "Free Forever Access",
      description: "Core meme generation, template discovery, and basic publishing remain 100% free for all registered brands.",
      icon: Award,
    },
    {
      title: "Open Contributor Ecosystem",
      description: "Template creators gain public attribution, download tracking, badges, and leaderboard rankings.",
      icon: Users,
    },
  ];

  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Why Modern Businesses Trust Virlio
          </h2>
          <p className="mt-3 text-base text-gray-600">
            A software platform built for brand safety, content credibility, and viral organic reach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="virlio-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{point.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
