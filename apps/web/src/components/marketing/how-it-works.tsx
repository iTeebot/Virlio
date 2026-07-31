import React from "react";
import { UserCheck, ShieldCheck, Search, Sparkles, Send, TrendingUp } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Visitor Signup",
      description: "Create your free user account in under 30 seconds with email or SSO.",
      icon: UserCheck,
    },
    {
      num: "02",
      title: "Create & Verify Brand",
      description: "Submit website and business details. AI verifies legitimacy, industry, and risk score.",
      icon: ShieldCheck,
    },
    {
      num: "03",
      title: "Choose Meme Template",
      description: "Search 10,000+ templates filtered by industry, category, language, and country.",
      icon: Search,
    },
    {
      num: "04",
      title: "AI Meme Generation",
      description: "AI auto-generates brand-aligned captions, hashtags, and contextual descriptions.",
      icon: Sparkles,
    },
    {
      num: "05",
      title: "Publish & Share",
      description: "Render high-resolution meme assets and publish directly to social networks.",
      icon: Send,
    },
    {
      num: "06",
      title: "Track Performance",
      description: "Monitor engagement, upvotes, virality scores, and brand reach metrics.",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-20 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Simple & Transparent Workflow
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            How Virlio Turns Your Brand Into Viral Content
          </p>
          <p className="mt-3 text-base text-gray-600">
            A seamless 6-step lifecycle from account creation to social media distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="virlio-card p-5 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      STEP {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
