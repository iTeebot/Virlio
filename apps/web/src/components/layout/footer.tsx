"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Explore Memes", href: "/explore" },
        { name: "AI Meme Generator", href: "/dashboard/generator" },
        { name: "Services & Pricing", href: "/pricing" },
        { name: "Brand Verification", href: "/brands" },
        { name: "Templates Library", href: "/templates" },
        { name: "Leaderboards", href: "/leaderboards" },
      ],
    },
    {
      title: "Services",
      links: [
        { name: "Website Development", href: "/services/website-development" },
        { name: "Custom Web Apps", href: "/services/custom-web-apps" },
        { name: "Mobile Applications", href: "/services/mobile-applications" },
        { name: "AI Agents & Chatbots", href: "/services/ai-agents-chatbots" },
        { name: "Workflow Automation", href: "/services/workflow-automation" },
        { name: "CRM & ERP Systems", href: "/services/crm-erp-systems" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Categories", href: "/categories" },
        { name: "Brand Guidelines", href: "/docs/branding" },
        { name: "Blog", href: "/#blog" },
        { name: "Release Notes", href: "/changelog" },
        { name: "System Status", href: "/status" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Security & Safety", href: "/security" },
        { name: "Cookie Preferences", href: "/cookies" },
        { name: "DMCA Policy", href: "/dmca" },
      ],
    },
    {
      title: "Community",
      links: [
        { name: "Explore", href: "/explore" },
        { name: "Template Contributors", href: "/community" },
        { name: "Leaderboards", href: "/leaderboards" },
        { name: "Badges & XP", href: "/achievements" },
        { name: "Categories", href: "/categories" },
      ],
    },
    {
      title: "Social",
      links: [
        { name: "X / Twitter", href: "https://x.com" },
        { name: "LinkedIn", href: "https://linkedin.com" },
        { name: "Instagram", href: "https://instagram.com" },
        { name: "TikTok", href: "https://tiktok.com" },
        { name: "GitHub", href: "https://github.com" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand & Prominent Vertical Logo Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              {/* Prominent, large vertical logo container */}
              <div className="relative h-28 w-56 sm:h-32 sm:w-64">
                <Image
                  src="/images/logo-vertical.png"
                  alt="Virlio Vertical Logo"
                  fill
                  sizes="(max-width: 768px) 220px, 260px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
              Virlio is Teebot&apos;s AI-powered meme generation platform for verified businesses. Free forever for core usage. Professional software engineering and digital transformation powered by Teebot.
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All AI Systems Operational</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6 lg:col-span-8">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; 2026 Teebot Inc. Virlio AI Meme Generator. All rights reserved.</p>
          <p>Built with Next.js 16, TypeScript & Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
