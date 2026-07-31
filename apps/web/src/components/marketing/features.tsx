import React from "react";
import {
  Building, Sparkles, Layers, Search, Globe, Hash,
  ThumbsUp, UserCheck, ShieldAlert, BarChart3, TrendingUp,
  Award, Share2, FileText
} from "lucide-react";

export function FeatureShowcase() {
  const featureList = [
    {
      title: "Verified Business Profiles",
      description: "Establish authentic brand ownership with AI business verification, official badges, and company profiles.",
      icon: Building,
    },
    {
      title: "AI Meme Generator",
      description: "Generate culturally relevant captions, punchlines, and contextual text tailored to your brand personality.",
      icon: Sparkles,
    },
    {
      title: "Community Templates Library",
      description: "Explore 10,000+ crowdsourced meme formats uploaded by creators across tech, dining, finance, and gaming.",
      icon: Layers,
    },
    {
      title: "Facet & Keyword Search",
      description: "Instant search by keyword, tag, category, subcategory, popularity score, or original creator.",
      icon: Search,
    },
    {
      title: "Global Country & Language Support",
      description: "Localize content across 40+ countries and languages with region-specific meme formats and metadata.",
      icon: Globe,
    },
    {
      title: "Automated Hashtags & Captions",
      description: "AI extracts high-performing hashtags and viral post copy optimized for LinkedIn, X, Instagram, and TikTok.",
      icon: Hash,
    },
    {
      title: "Template Voting & Ranking",
      description: "Community upvotes, Wilson score algorithms, and trending velocity formulas surface the highest quality templates.",
      icon: ThumbsUp,
    },
    {
      title: "Contributor Profiles & Attribution",
      description: "Template uploaders earn public attribution, level progression, badges, and total download tracking.",
      icon: UserCheck,
    },
    {
      title: "Multi-Layer AI Moderation",
      description: "Automated guardrails inspect every uploaded image and text for NSFW, hate speech, and copyright risks.",
      icon: ShieldAlert,
    },
    {
      title: "Digital Growth Audit",
      description: "AI analyzes your business web presence to discover missing opportunities in SEO, booking, and automation.",
      icon: TrendingUp,
    },
    {
      title: "Public Leaderboards",
      description: "Real-time daily, weekly, and monthly rankings for top contributors, most viral templates, and top brands.",
      icon: Award,
    },
    {
      title: "Multi-Platform Social Publishing",
      description: "Schedule and auto-post rendered memes directly across your company's social media accounts.",
      icon: Share2,
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Complete Marketing Platform
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Everything Businesses Need for Meme Marketing & Growth
          </p>
          <p className="mt-3 text-base text-gray-600">
            A comprehensive suite of tools designed to scale brand awareness, trust, and organic engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="virlio-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
