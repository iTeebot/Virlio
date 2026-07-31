"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConsultationModal } from "@/components/pricing/consultation-modal";
import { BrandAuditWidget } from "@/components/pricing/brand-audit-widget";
import { ServiceTier, ProfessionalServiceItem } from "@/types/pricing";
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  Building2,
  Globe,
  Smartphone,
  Cpu,
  Layers,
  Bot,
  Database,
  Lock,
  Search,
  Code2,
  CreditCard,
  Banknote,
  Share2,
} from "lucide-react";

export default function PricingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Website Development");

  const handleOpenConsultation = (serviceName?: string) => {
    if (serviceName) setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const freeCapabilities = [
    "Verified Brand Profile",
    "Unlimited AI Meme Generation",
    "Full Community Template Library",
    "Unlimited Template Uploads",
    "Template Voting & Reporting",
    "Gamification & Achievements",
    "Contributor Profile & Badges",
    "Public Gallery Exposure",
    "AI Captions & Hashtags",
    "Public Leaderboards Access",
    "Brand Usage Analytics",
    "Brand Guidelines Integration",
    "Community Participation",
    "Future Core Upgrades",
  ];

  const serviceTiers: ServiceTier[] = [
    {
      id: "starter",
      name: "Starter Implementation",
      tagline: "Essential digital presence for growing businesses.",
      priceDisplay: "Custom Scope",
      period: "per project",
      idealFor: "Local businesses, restaurants, and startups needing a high-converting web presence.",
      teebotScope: "Teebot engineers design and build a modern, high-speed website with basic SEO and mobile optimization.",
      features: [
        "Custom Website Design & Development",
        "Mobile Optimization & Core Web Vitals",
        "Basic Local SEO & Google Business Sync",
        "Lead Capture Form & Email Notification",
        "30 Days Post-Launch Maintenance",
      ],
      ctaText: "Request Starter Consultation",
    },
    {
      id: "growth",
      name: "Growth & Automation",
      tagline: "Advanced web apps, CRM, and AI workflow automation.",
      priceDisplay: "Custom Scope",
      period: "per project",
      popular: true,
      idealFor: "Scaling companies requiring custom booking engines, CRM integrations, or AI chatbots.",
      teebotScope: "Full-stack software engineering including custom CRM, appointment booking, API webhooks, and AI agents.",
      features: [
        "Custom Web Application / SaaS Platform",
        "Custom CRM & Lead Routing Pipeline",
        "Online Booking / Appointment Engine",
        "24/7 AI Customer Support Chatbot",
        "Automated Email & SMS Sequences",
        "Priority Engineering & SLA Support",
      ],
      ctaText: "Request Growth Consultation",
    },
    {
      id: "enterprise",
      name: "Enterprise Transformation",
      tagline: "Complete custom software, ERP, mobile apps, & dedicated engineering.",
      priceDisplay: "Custom Scope",
      period: "tailored retainer",
      idealFor: "Established enterprises requiring custom ERP, mobile apps, IoT, or cloud infrastructure.",
      teebotScope: "Dedicated Teebot product engineering squad building proprietary internal dashboards, mobile apps, and custom AI systems.",
      features: [
        "Native iOS & Android Mobile Apps",
        "Custom ERP & Inventory Management",
        "Proprietary AI Agent Architectures",
        "Legacy Cloud Migration & Infrastructure",
        "Custom API & POS Hardware Sync",
        "Dedicated Engineering Manager & 24/7 SLA",
      ],
      ctaText: "Request Enterprise Consultation",
    },
  ];

  const professionalServices: ProfessionalServiceItem[] = [
    {
      id: "web-dev",
      title: "Website Development",
      category: "Web & Mobile",
      description: "Custom high-speed Next.js websites built for maximum SEO ranking and conversion performance.",
      idealCustomer: "Businesses with outdated or slow websites.",
      expectedOutcome: "Sub-1 second load speeds & higher organic search conversions.",
      iconName: "Globe",
      priority: "High",
    },
    {
      id: "web-app",
      title: "Custom Web Applications",
      category: "Web & Mobile",
      description: "Complex web applications, client portals, and SaaS platforms built with React, Next.js, and Node.",
      idealCustomer: "Companies digitizing manual business processes.",
      expectedOutcome: "Streamlined operational workflows and scalable cloud infrastructure.",
      iconName: "Code2",
      priority: "High",
    },
    {
      id: "mobile-app",
      title: "Mobile Applications",
      category: "Web & Mobile",
      description: "Native-grade iOS and Android mobile apps designed for seamless customer engagement.",
      idealCustomer: "Brands building direct-to-consumer mobile experiences.",
      expectedOutcome: "High app store ratings & push notification retention.",
      iconName: "Smartphone",
      priority: "Medium",
    },
    {
      id: "ai-agents",
      title: "AI Agents & Chatbots",
      category: "AI & Automation",
      description: "Intelligent AI support and sales agents trained on your business docs and CRM data.",
      idealCustomer: "Support teams overwhelmed by repetitive customer queries.",
      expectedOutcome: "Automate 80%+ of inbound inquiries 24/7.",
      iconName: "Bot",
      priority: "High",
    },
    {
      id: "automation",
      title: "Workflow & Business Automation",
      category: "AI & Automation",
      description: "End-to-end integration between your forms, CRM, email, accounting, and messaging apps.",
      idealCustomer: "Teams spending hours on manual data re-entry.",
      expectedOutcome: "Zero manual data errors and 10x faster lead response times.",
      iconName: "Cpu",
      priority: "High",
    },
    {
      id: "crm",
      title: "Custom CRM Systems",
      category: "Business Systems",
      description: "Tailored customer relationship management databases with pipeline tracking and automated follow-ups.",
      idealCustomer: "Sales teams losing track of prospective leads.",
      expectedOutcome: "Clear sales visibility and automated pipeline reminders.",
      iconName: "Database",
      priority: "High",
    },
    {
      id: "erp",
      title: "ERP & Internal Dashboards",
      category: "Business Systems",
      description: "Custom administrative portals, inventory systems, and operational analytics dashboards.",
      idealCustomer: "Enterprises managing complex supply chains or workforce dispatch.",
      expectedOutcome: "Single source of truth for business metrics.",
      iconName: "Layers",
      priority: "Medium",
    },
    {
      id: "seo",
      title: "SEO & Performance Optimization",
      category: "Growth & Infrastructure",
      description: "Technical SEO audits, structured data schema, Core Web Vitals optimization, and content strategy.",
      idealCustomer: "Brands invisible on Google search and local maps.",
      expectedOutcome: "Top search ranking positions and organic traffic growth.",
      iconName: "Search",
      priority: "High",
    },
  ];

  const faqs = [
    {
      q: "Is Virlio really 100% Free Forever?",
      a: "Yes! Virlio is completely free for all core features: unlimited meme generation, community templates, template uploads, voting, badges, and analytics. There are no credit cards required and no artificial usage limits.",
    },
    {
      q: "Why is Virlio free for core usage?",
      a: "Virlio is created by Teebot as a gift to the global business and creator community. It naturally connects growing businesses with Teebot when they need custom software development, mobile apps, or business automation.",
    },
    {
      q: "Do I have to purchase professional services to use Virlio?",
      a: "Not at all. Professional services from Teebot are 100% optional. You are welcome to use Virlio for free indefinitely without ever purchasing services.",
    },
    {
      q: "How does the Teebot consultation process work?",
      a: "When you request a consultation, a Senior Software Architect from Teebot conducts a complimentary analysis of your requirements and provides a custom scope, technical blueprint, and project proposal within 24 hours.",
    },
    {
      q: "What payment methods does Teebot accept for service engagements?",
      a: "Teebot supports regional and international payment options. In Pakistan, we support Easypaisa, JazzCash, and direct Bank Transfer. In the UAE, we support Ziina and Apple Pay. Globally, we accept Stripe and PayPal.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Virlio Software is Free Forever</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight leading-tight">
              Transparent Business Model & Services
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
              Virlio software is 100% free for generating memes and using templates. Businesses only pay when they request custom software development, AI automation, or digital transformation from <strong className="text-gray-900">Teebot</strong>.
            </p>
          </div>

          {/* What's Free Forever Banner Grid */}
          <div className="virlio-surface p-8 sm:p-10 border border-gray-200 mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Zero Cost • Core Software
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">What&apos;s Included Free Forever</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Everything you need to turn your brand into viral content. No hidden fees. No paywalled templates.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/dashboard/generator"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                >
                  <span>Start Generating Free</span>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-6">
              {freeCapabilities.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service Engagement Tiers */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Optional Teebot Implementation
              </span>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl mt-1">
                Professional Engineering Engagement Tiers
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Need a custom website, mobile app, CRM, or AI automation? Teebot provides end-to-end software engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {serviceTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`virlio-card p-6 sm:p-8 flex flex-col justify-between relative bg-white border ${
                    tier.popular ? "border-blue-600 shadow-md ring-1 ring-blue-600" : "border-gray-200"
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 mb-4 leading-relaxed">{tier.tagline}</p>

                    <div className="py-3 border-y border-gray-100 my-4">
                      <p className="text-2xl font-extrabold text-gray-900">{tier.priceDisplay}</p>
                      <p className="text-xs text-gray-500 font-medium">{tier.period}</p>
                    </div>

                    <div className="mb-6 space-y-2">
                      <p className="text-xs font-bold text-gray-900">Ideal For:</p>
                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        {tier.idealFor}
                      </p>
                    </div>

                    <div className="space-y-2.5 mb-6">
                      <p className="text-xs font-bold text-gray-900">What Teebot Builds:</p>
                      {tier.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenConsultation(tier.name)}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-colors ${
                      tier.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Digital Health Audit Section */}
          <BrandAuditWidget onRequestConsultation={handleOpenConsultation} />

          {/* Custom Services Grid Showcase */}
          <div className="my-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Teebot Digital Capability Index
              </span>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl mt-1">
                Custom Engineering Services by Teebot
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Explore Teebot&apos;s full suite of software development, artificial intelligence, and business automation capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {professionalServices.map((service) => (
                <div key={service.id} className="virlio-card p-6 flex flex-col justify-between bg-white border border-gray-200">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      {service.iconName === "Globe" && <Globe className="w-5 h-5" />}
                      {service.iconName === "Code2" && <Code2 className="w-5 h-5" />}
                      {service.iconName === "Smartphone" && <Smartphone className="w-5 h-5" />}
                      {service.iconName === "Bot" && <Bot className="w-5 h-5" />}
                      {service.iconName === "Cpu" && <Cpu className="w-5 h-5" />}
                      {service.iconName === "Database" && <Database className="w-5 h-5" />}
                      {service.iconName === "Layers" && <Layers className="w-5 h-5" />}
                      {service.iconName === "Search" && <Search className="w-5 h-5" />}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">{service.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{service.description}</p>

                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs space-y-1 mb-4">
                      <p className="font-semibold text-gray-900">Expected Outcome:</p>
                      <p className="text-gray-600 leading-tight">{service.expectedOutcome}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenConsultation(service.title)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>Request Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Provider-Agnostic Payment & Regional Options Banner */}
          <div className="virlio-surface p-8 border border-gray-200 my-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Regional & Global Payment Gateways</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Seamless Regional Invoicing & Payments
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  When engaging Teebot for custom software projects, invoices are settled using regional payment gateways mapped automatically to your location.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-gray-700 shrink-0">
                <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-bold">Global</p>
                    <p className="text-[10px] text-gray-500 font-normal">Stripe & PayPal</p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-bold">UAE</p>
                    <p className="text-[10px] text-gray-500 font-normal">Ziina & Apple Pay</p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-bold">Pakistan</p>
                    <p className="text-[10px] text-gray-500 font-normal">Easypaisa & JazzCash</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="my-16 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Clear Answers</span>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="virlio-card p-6 bg-white border border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Generation CTA Footer Banner */}
          <div className="virlio-surface p-10 sm:p-12 border border-gray-200 text-center my-12">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-4xl">
              Ready to Accelerate Your Digital Growth?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm text-gray-600 leading-relaxed">
              Generate unlimited free memes on Virlio today. When your business is ready for custom software, web applications, or AI automation, Teebot is here to help.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/generator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors"
              >
                <span>Use Virlio Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => handleOpenConsultation()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-6 py-3.5 text-sm font-semibold text-gray-900 transition-colors"
              >
                <span>Request Teebot Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Interactive Consultation Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialService={selectedService}
      />
    </div>
  );
}
