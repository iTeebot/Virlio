"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  FileText,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertCircle,
  Building2,
  Copyright,
  UserX,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function TermsOfServicePage() {
  const lastUpdated = "July 31, 2026";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms & Eligibility",
      icon: Scale,
      content: [
        "Binding Agreement: By accessing or using Virlio software, uploading templates, or creating memes, you enter into a legally binding agreement governed by these Terms of Service.",
        "Age & Capacity Requirement: You must be at least 13 years of age (or the legal age of majority in your jurisdiction) to create an account and use the platform.",
        "Brand Representation: Users creating verified brand profiles warrant that they possess legal authority to represent and act on behalf of the named business entity.",
      ],
    },
    {
      id: "business-model",
      title: "2. Free Core Usage & Optional Teebot Engineering",
      icon: Building2,
      content: [
        "Free Forever Core Features: Virlio software is 100% free for AI meme generation, template discovery, community contributions, and brand profile creation. No subscription or credit card is required.",
        "Optional Professional Services: Custom software development, website builds, mobile apps, CRM integration, and AI workflow automation are optional services delivered separately by Teebot.",
        "Independent Service Contracts: Engineering engagements with Teebot are governed by specific project proposals, master service agreements, and regional invoicing terms.",
      ],
    },
    {
      id: "acceptable-use",
      title: "3. Content Standards & Acceptable Use",
      icon: AlertCircle,
      content: [
        "Zero Tolerance Content: Users may not generate or upload content that promotes hate speech, violence, illegal acts, harassment, defamation, or explicit adult material.",
        "No Impersonation: You may not create false brand profiles or misrepresent affiliations with un-owned trademarks, corporations, or public figures.",
        "Automated Scraping & Abuse: Unauthorized bot scraping, API rate-limit manipulation, or attempts to disrupt system infrastructure are strictly prohibited.",
      ],
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property & Ownership",
      icon: Copyright,
      content: [
        "Generated Meme Ownership: You retain ownership and commercial rights to memes you generate using Virlio, subject to third-party rights in underlying base templates.",
        "Community Template Submissions: By uploading templates to Virlio's public library, contributors grant Virlio a worldwide, non-exclusive license to host and serve the templates.",
        "Platform Trademarks: The Virlio name, logo designs, and Teebot brand assets are proprietary trademarks of Teebot Inc. and may not be used without written authorization.",
      ],
    },
    {
      id: "enforcement",
      title: "5. Moderation & Account Termination",
      icon: UserX,
      content: [
        "Content Review: Virlio employs automated filters and community reporting to review flagged memes, templates, and profile metadata.",
        "Account Actions: We reserve the right to suspend or permanently delete accounts that violate content guidelines, engage in spam, or infringe intellectual property.",
        "DMCA Takedowns: Copyright owners may submit formal DMCA takedown requests for unauthorized media using our dedicated reporting channels.",
      ],
    },
    {
      id: "liability",
      title: "6. Limitation of Liability & Disclaimers",
      icon: ShieldCheck,
      content: [
        "As-Is Service Provision: Virlio is provided 'as is' without warranties of uninterrupted uptime or error-free operations.",
        "Liability Cap: To the maximum extent permitted by law, Virlio and Teebot shall not be liable for indirect, incidental, or consequential damages resulting from platform usage.",
        "Third-Party Content: Virlio is not responsible for user-generated memes or community-submitted template assets published by third-party creators.",
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
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Terms & Platform Guidelines</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight leading-tight">
              Terms of Service
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Rules and guidelines governing your access to Virlio AI Meme Generator and Teebot services.
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
                <h2 className="text-lg font-bold text-gray-900">Summary of Terms</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  Virlio is designed for positive viral brand marketing. Core meme generation software is free forever. Respect copyright, do not impersonate brands, and adhere to our zero-tolerance policy against harmful content.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Terms Sections */}
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

          {/* Call to Action Banner */}
          <div className="virlio-surface p-8 sm:p-10 border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Ready to Start Creating?</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl mx-auto leading-relaxed">
              Explore thousands of viral templates and generate memes for your brand in seconds with Virlio.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/generator"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
              >
                <span>Use Virlio Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-900 transition-colors"
              >
                <span>View Privacy Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
