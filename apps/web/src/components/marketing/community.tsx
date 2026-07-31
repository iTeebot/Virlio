import React from "react";
import { Upload, CheckCircle2, Award, Trophy, Users, ShieldCheck } from "lucide-react";

export function CommunitySection() {
  const communityFeatures = [
    {
      title: "Upload & Share Templates",
      description: "Creators and marketers upload original meme templates with tags, language, and category metadata.",
      icon: Upload,
    },
    {
      title: "AI & Human Approval",
      description: "Every submission passes OCR, vision duplicate scoring, and safety moderation before joining the public library.",
      icon: CheckCircle2,
    },
    {
      title: "Public Creator Attribution",
      description: "Templates feature permanent author attribution, direct creator links, and total download analytics.",
      icon: Users,
    },
    {
      title: "Gamified Badges & Levels",
      description: "Earn achievements like 'Top Contributor', 'Trend Setter', and 'AI Approved' as your templates gain viral traction.",
      icon: Award,
    },
    {
      title: "Public Leaderboards",
      description: "Rank on daily, weekly, and monthly contributor leaderboards based on downloads and community upvotes.",
      icon: Trophy,
    },
    {
      title: "Community Trust & Safety",
      description: "Transparent reporting systems and clear moderation policies maintain a high-quality, brand-safe ecosystem.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-20 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Open Creator Ecosystem
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Powered by a Global Community of Template Creators
          </p>
          <p className="mt-3 text-base text-gray-600">
            Contributors build the library, earn recognition, and help thousands of businesses go viral every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="virlio-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
