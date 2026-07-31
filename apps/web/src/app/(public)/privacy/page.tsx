"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Database,
  UserCheck,
  Server,
  Mail,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "July 31, 2026";

  const sections = [
    {
      id: "collection",
      title: "1. Information We Collect",
      icon: Database,
      content: [
        "Account & Identity Data: When you register on Virlio, we collect basic profile details including your name, email address, username, avatar image, and authentication credentials.",
        "Brand Verification Data: For verified brand accounts, we collect business registration names, official domain URLs, logo assets, and verification documentation.",
        "Content & AI Generation Inputs: Prompts, template uploads, captions, hashtags, and customized meme settings submitted to our AI generation engine.",
        "Usage & Telemetry: Technical metadata including IP addresses, browser types, device information, operating system, referring URLs, and feature interaction metrics.",
      ],
    },
    {
      id: "usage",
      title: "2. How We Use Your Information",
      icon: UserCheck,
      content: [
        "Core Service Provisioning: To power AI meme generation, maintain template libraries, calculate gamification XP and leaderboards, and display verified brand profiles.",
        "Verification & Trust: To evaluate and maintain brand verification badges, preventing impersonation and ensuring content authenticity.",
        "Teebot Service Consultation: When you explicitly request professional software engineering or digital transformation consultations from Teebot.",
        "Security & Misuse Prevention: Monitoring platform activity to enforce content moderation guidelines, prevent automated abuse, and safeguard user accounts.",
      ],
    },
    {
      id: "ai-data",
      title: "3. AI Processing & Media Infrastructure",
      icon: Server,
      content: [
        "AI Prompts & Captions: User text inputs and template metadata are processed through secure AI inference APIs for caption synthesis and hashtag generation.",
        "Media Storage & CDN: Generated images and uploaded template assets are stored securely on Cloudinary's global content delivery network.",
        "No External Model Training: Your private account data and un-published draft memes are not sold or used to train third-party public AI models.",
      ],
    },
    {
      id: "sharing",
      title: "4. Information Sharing & Third Parties",
      icon: Eye,
      content: [
        "Public Gallery Content: Memes published to the public gallery, contributor templates, and public brand profiles are visible to all website visitors.",
        "Service Infrastructure: We partner with trusted infrastructure providers (cloud database, media CDNs, authentication services) bound by strict data processing agreements.",
        "Teebot Engineering Squad: Optional custom software requests are processed directly by Teebot's engineering team under confidentiality.",
        "Legal Requirements: We may disclose information if required by valid law enforcement requests, court orders, or legal proceedings.",
      ],
    },
    {
      id: "rights",
      title: "5. Your Rights & Data Controls",
      icon: Lock,
      content: [
        "Access & Export: You may request a copy of your personal account data, brand assets, and generated meme history at any time.",
        "Correction & Erasure: You have the right to update profile information or request complete deletion of your account and associated media.",
        "Cookie & Tracking Preferences: You can manage cookie settings through your browser preferences or dedicated cookie management controls.",
      ],
    },
    {
      id: "security",
      title: "6. Security & Global Compliance",
      icon: ShieldCheck,
      content: [
        "Encryption in Transit & Rest: All data transferred between your browser and Virlio is encrypted using TLS 1.3, with data at rest stored using AES-256 encryption.",
        "Regional Compliance: Virlio complies with applicable data protection frameworks including GDPR, CCPA, and regional UAE data privacy standards.",
        "Regular Audits: We conduct periodic security evaluations and vulnerability assessments of our database and API endpoints.",
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Transparent rules on how Virlio and Teebot collect, protect, and respect your personal data and brand assets.
            </p>
            <p className="mt-2 text-xs text-gray-500 font-medium">
              Last Updated: {lastUpdated} &bull; Effective Date: January 1, 2026
            </p>
          </div>

          {/* Quick Summary Card */}
          <div className="virlio-surface p-6 sm:p-8 border border-gray-200 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Privacy at a Glance</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  Virlio is built with user privacy and brand safety as core principles. We never sell your personal data, we encrypt all stored information, and core meme generation capabilities remain 100% free with complete transparency.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div className="space-y-8 mb-16">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="virlio-card p-6 sm:p-8 bg-white border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>

                  <ul className="space-y-3 pl-2">
                    {section.content.map((point, index) => (
                      <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Contact Support Banner */}
          <div className="virlio-surface p-8 sm:p-10 border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Have Questions About Your Privacy?</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl mx-auto leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data rights, our Data Protection Officer is ready to assist.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
              >
                <span>Read Documentation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-900 transition-colors"
              >
                <span>Teebot Services & Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
