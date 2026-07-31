import React from "react";
import Metadata from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Globe, Code2, Smartphone, Bot, Cpu, Layers, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Teebot Professional Software Engineering Services | Virlio",
  description: "Explore custom website development, SaaS web apps, mobile applications, AI agents, workflow automation, and CRM/ERP systems engineered by Teebot.",
};

export default function ServicesPage() {
  const servicesList = [
    {
      slug: "website-development",
      title: "Website Development",
      category: "Web & Mobile",
      tagline: "High-speed, SEO-optimized Next.js websites built for conversion.",
      icon: Globe,
      capabilities: ["Sub-second Core Web Vitals", "Structured Data & Local SEO", "Mobile First Design", "Headless CMS Integration"],
    },
    {
      slug: "custom-web-apps",
      title: "Custom Web Apps",
      category: "Web & Mobile",
      tagline: "Scalable SaaS platforms, client portals, and web software.",
      icon: Code2,
      capabilities: ["React & Next.js Architecture", "Real-Time WebSockets", "Secure Auth & Multitenancy", "Cloud Scalability"],
    },
    {
      slug: "mobile-applications",
      title: "Mobile Applications",
      category: "Web & Mobile",
      tagline: "Native iOS & Android mobile apps designed for seamless customer engagement.",
      icon: Smartphone,
      capabilities: ["Cross-Platform React Native", "Offline Persistence", "Push Notification Campaigns", "App Store Publishing"],
    },
    {
      slug: "ai-agents-chatbots",
      title: "AI Agents & Chatbots",
      category: "AI & Automation",
      tagline: "24/7 intelligent customer support and sales automation agents.",
      icon: Bot,
      capabilities: ["RAG & Custom Document Training", "Multilingual Natural Language", "CRM Lead Sync", "Automated Qualification"],
    },
    {
      slug: "workflow-automation",
      title: "Workflow Automation",
      category: "AI & Automation",
      tagline: "Connect your forms, CRM, accounting, and communication tools.",
      icon: Cpu,
      capabilities: ["API & Webhooks Pipeline", "Zero Manual Data Errors", "Instant SMS/Email Triggers", "Custom Middleware"],
    },
    {
      slug: "crm-erp-systems",
      title: "CRM & ERP Systems",
      category: "Business Systems",
      tagline: "Tailored customer pipelines, administrative dashboards, and inventory portals.",
      icon: Layers,
      capabilities: ["Sales Funnel Analytics", "Inventory & Warehouse Sync", "Role-Based Access Control", "Automated Follow-ups"],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Banner */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Teebot Digital Capability Catalog</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight leading-tight">
              Professional Software Engineering Services
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
              Teebot provides custom software development, artificial intelligence, and business automation to help verified brands accelerate growth.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {servicesList.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.slug} className="virlio-card p-6 flex flex-col justify-between bg-white border border-gray-200">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {s.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1 mb-2">{s.title}</h2>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{s.tagline}</p>

                    <div className="space-y-2 pt-3 border-t border-gray-100 mb-6">
                      {s.capabilities.map((c) => (
                        <div key={c} className="flex items-center gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/services/${s.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                  >
                    <span>Explore {s.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
