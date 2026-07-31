import React from "react";
import Link from "next/link";
import { Sparkles, Building2, Layers, BarChart3, Settings, ArrowRight } from "lucide-react";

export function OverviewQuickActions() {
  const actions = [
    {
      title: "Upload Template",
      desc: "Upload meme formats for attribution",
      href: "/dashboard/templates/upload",
      icon: Layers,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Create Brand Meme",
      desc: "Generate memes for verified brands",
      href: "/dashboard/memes/create",
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Brand Workspaces",
      desc: "Manage brand profiles & verification",
      href: "/dashboard/brands",
      icon: Building2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Performance Analytics",
      desc: "Track viral engagement stats",
      href: "/dashboard/analytics",
      icon: BarChart3,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Account Settings",
      desc: "Update profile & preferences",
      href: "/dashboard/settings",
      icon: Settings,
      color: "text-gray-600 bg-gray-50 border-gray-100",
    },
  ];

  return (
    <div className="virlio-card p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
        Quick Action Shortcuts
      </h3>

      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className="group flex items-center justify-between p-3 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-gray-500">{act.desc}</p>
                </div>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
