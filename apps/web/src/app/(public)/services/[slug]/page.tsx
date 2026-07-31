"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConsultationModal } from "@/components/pricing/consultation-modal";
import {
  Globe,
  Code2,
  Smartphone,
  Bot,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  HelpCircle,
  Zap,
} from "lucide-react";

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "website-development";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const serviceData: Record<
    string,
    {
      title: string;
      h1: string;
      metaDescription: string;
      category: string;
      iconName: string;
      overview: string;
      expectedOutcome: string;
      roiMetric: string;
      capabilities: string[];
      techStack: string[];
      faqs: Array<{ q: string; a: string }>;
    }
  > = {
    "website-development": {
      title: "Website Development Services",
      h1: "High-Performance Website Development by Teebot",
      metaDescription: "Custom Next.js website development for verified brands. Sub-second Core Web Vitals, conversion-focused design, and local SEO schema.",
      category: "Web & Mobile Engineering",
      iconName: "Globe",
      overview: "Teebot designs and builds custom Next.js websites engineered for maximum speed, top Google search ranking, and high conversion rates. Goodbye slow WordPress templates; hello sub-second page loads.",
      expectedOutcome: "Sub-1 second page load speed, 95+ Lighthouse score, and 35%+ higher organic form submissions.",
      roiMetric: "+40% Organic Conversion Lift",
      capabilities: [
        "Server-Side Rendering (SSR) & Turbopack",
        "Sub-Second Core Web Vitals Optimization",
        "Structured JSON-LD Schema & Local SEO",
        "Headless CMS Integration (Sanity, Strapi)",
        "Responsive Mobile-First Architecture",
        "Lead Capture Forms & CRM Sync",
      ],
      techStack: ["Next.js 16", "TypeScript", "Tailwind CSS", "React 19", "Vercel / AWS"],
      faqs: [
        { q: "Why build with Next.js instead of WordPress?", a: "Next.js offers sub-second load times, superior Google Core Web Vitals scores, immunity to plugin security vulnerabilities, and 10x higher scalability." },
        { q: "How long does custom website development take?", a: "Typical project timelines range from 2 to 4 weeks depending on page count and custom integrations." },
      ],
    },
    "custom-web-apps": {
      title: "Custom Web Applications",
      h1: "Custom Web Application & SaaS Development",
      metaDescription: "Full-stack web application development. Client portals, SaaS platforms, and internal business tools engineered by Teebot.",
      category: "Web & Mobile Engineering",
      iconName: "Code2",
      overview: "Digitize manual business processes with custom web applications. Teebot builds secure, multitenant SaaS platforms, client dashboards, and operational web tools.",
      expectedOutcome: "Streamlined business workflows, 100% cloud availability, and zero manual data re-entry.",
      roiMetric: "10x Operational Efficiency",
      capabilities: [
        "Multitenant SaaS Architecture",
        "Real-Time WebSockets & Push Signals",
        "Role-Based Access Control (RBAC)",
        "Stripe & Regional Payment Gateways",
        "REST & GraphQL API Endpoints",
        "Automated CI/CD Deployment",
      ],
      techStack: ["React 19", "Next.js App Router", "Node.js", "PostgreSQL", "Docker & Kubernetes"],
      faqs: [
        { q: "Can Teebot migrate legacy database systems?", a: "Yes, Teebot specializes in seamless cloud migration and database refactoring with zero downtime." },
        { q: "Do you support multitenancy and RBAC?", a: "Absolutely. All web apps are built with strict data isolation, role-based permissions, and SOC2 compliance practices." },
      ],
    },
    "mobile-applications": {
      title: "Mobile Application Development",
      h1: "iOS & Android Mobile App Development",
      metaDescription: "Native-grade cross-platform mobile app development. iOS, Android, push notification engagement, and offline sync by Teebot.",
      category: "Web & Mobile Engineering",
      iconName: "Smartphone",
      overview: "Reach your customers directly on their smartphones. Teebot builds high-performance React Native mobile apps for iOS and Android with offline capability and push notification campaigns.",
      expectedOutcome: "High app store retention, instant push engagement, and offline data sync.",
      roiMetric: "+60% Customer Retention",
      capabilities: [
        "Cross-Platform React Native Codebase",
        "Native iOS (Swift) & Android (Kotlin) Modules",
        "Offline Data Storage & Sync Engine",
        "Push Notification Campaigns (FCM)",
        "Biometric Authentication (FaceID/Fingerprint)",
        "App Store & Google Play Publishing",
      ],
      techStack: ["React Native", "Expo", "TypeScript", "Firebase", "Apple & Google Play APIs"],
      faqs: [
        { q: "Will one codebase run on both iOS and Android?", a: "Yes! Using React Native, Teebot builds a unified codebase that renders natively on both iOS and Android devices." },
      ],
    },
    "ai-agents-chatbots": {
      title: "AI Agents & Chatbots",
      h1: "Custom AI Agents & Intelligent Support Chatbots",
      metaDescription: "Autonomous AI customer support agents, sales chatbots, and RAG document search engines trained on your brand docs.",
      category: "AI & Automation",
      iconName: "Bot",
      overview: "Deploy 24/7 intelligent AI support and sales agents trained specifically on your company's documentation, product catalogs, and CRM guidelines.",
      expectedOutcome: "Automate 80%+ of repetitive customer inquiries with instant, accurate answers.",
      roiMetric: "80% Support Automation",
      capabilities: [
        "Retrieval-Augmented Generation (RAG)",
        "Vector Embeddings & Semantic Search",
        "Multilingual Customer Interactions",
        "CRM & Helpdesk Ticket Sync",
        "Human Escalation Handoff",
        "Strict Safety & Anti-Hallucination Guardrails",
      ],
      techStack: ["Python", "OpenAI / Claude / Gemini API", "Pinecone / Qdrant", "LangChain", "Node.js"],
      faqs: [
        { q: "Can the AI agent hallucinate false information?", a: "Teebot implements strict RAG guardrails restricting responses to your authoritative documentation only." },
      ],
    },
    "workflow-automation": {
      title: "Workflow & Business Automation",
      h1: "Business Process & Workflow Automation Services",
      metaDescription: "Automate manual data entry, lead routing, invoice generation, and multi-app API integrations with Teebot.",
      category: "AI & Automation",
      iconName: "Cpu",
      overview: "Connect your forms, CRM, accounting, communication, and social tools into frictionless automated pipelines.",
      expectedOutcome: "Eliminate manual data entry errors and respond to new leads in under 60 seconds.",
      roiMetric: "< 60s Lead Response Time",
      capabilities: [
        "API & Webhook Custom Middleware",
        "Instant SMS & WhatsApp Alerts",
        "Automated Invoice & Receipt Generation",
        "Multi-System Lead Routing Pipelines",
        "Error Monitoring & Automated Retries",
      ],
      techStack: ["Node.js", "Python", "Zapier / Make Custom Webhooks", "PostgreSQL", "AWS Lambda"],
      faqs: [
        { q: "What software applications can Teebot connect?", a: "We integrate with virtually any application supporting REST APIs, GraphQL, Webhooks, or SQL databases." },
      ],
    },
    "crm-erp-systems": {
      title: "CRM & ERP Systems",
      h1: "Custom CRM, ERP, & Administrative Dashboards",
      metaDescription: "Tailored customer relationship management databases, inventory systems, and operational portals by Teebot.",
      category: "Business Systems",
      iconName: "Layers",
      overview: "Take control of your customer pipeline and company operations with a custom CRM and ERP dashboard designed specifically around your business workflow.",
      expectedOutcome: "Complete visibility into sales pipelines, inventory levels, and team productivity metrics.",
      roiMetric: "100% Pipeline Visibility",
      capabilities: [
        "Custom Lead Scoring & Pipeline Stages",
        "Real-Time Sales Performance Analytics",
        "Inventory & Warehouse Tracking",
        "Automated Email & Call Activity Logging",
        "Custom Reporting & CSV/PDF Exports",
      ],
      techStack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS"],
      faqs: [
        { q: "Can a custom CRM replace Salesforce or Hubspot?", a: "Yes! A custom CRM eliminates expensive per-user monthly fees and is built around your exact business stages." },
      ],
    },
  };

  const currentService = serviceData[slug] || serviceData["website-development"];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back to Services Navigation */}
          <div className="mb-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Teebot Services</span>
            </Link>
          </div>

          {/* Service Hero Card */}
          <div className="virlio-surface p-8 sm:p-12 border border-gray-200 mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{currentService.category}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                  {currentService.h1}
                </h1>
                <p className="text-base text-gray-600 leading-relaxed">
                  {currentService.overview}
                </p>
              </div>

              {/* ROI & Impact Highlight Badge */}
              <div className="virlio-card p-6 bg-white border border-gray-200 text-center shrink-0 w-full md:w-72">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Expected Business Impact</span>
                <p className="text-2xl font-extrabold text-gray-900 mt-2 mb-1">{currentService.roiMetric}</p>
                <p className="text-xs text-gray-500">{currentService.expectedOutcome}</p>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-6 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                >
                  <span>Request Consultation</span>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </button>
              </div>
            </div>
          </div>

          {/* Technical Capabilities Grid */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Technical Capabilities</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">What Teebot engineers build into every engagement.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentService.capabilities.map((cap) => (
                <div key={cap} className="virlio-card p-6 bg-white border border-gray-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{cap}</h3>
                    <p className="text-xs text-gray-600 mt-1">Production-ready implementation adhering to SOC2 and OWASP standards.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Banner */}
          <div className="virlio-surface p-8 border border-gray-200 mb-16 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">Underlying Architecture & Tech Stack</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentService.techStack.map((tech) => (
                <span key={tech} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Service FAQs</h2>
            <div className="space-y-4">
              {currentService.faqs.map((f) => (
                <div key={f.q} className="virlio-card p-6 bg-white border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{f.q}</span>
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed pl-6">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Lead Banner */}
          <div className="virlio-surface p-10 text-center border border-gray-200">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Ready to Build {currentService.title}?</h2>
            <p className="mt-2 max-w-xl mx-auto text-xs sm:text-sm text-gray-600">
              Request a free technical consultation with Teebot&apos;s Senior Software Architects. We will deliver a custom scope and technical proposal within 24 hours.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors"
              >
                <span>Request Free Teebot Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialService={currentService.title}
      />
    </div>
  );
}
