"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Virlio?",
      a: "Virlio is an AI-powered meme generation and digital growth platform built for verified businesses and creators. It allows brands to generate culturally relevant, brand-safe memes from community templates and schedule social media publishing.",
    },
    {
      q: "Is Virlio free?",
      a: "Yes. Virlio offers a free-forever tier that includes brand profile verification, full template library access, AI caption generation, and basic social media rendering.",
    },
    {
      q: "How does AI verify brands?",
      a: "Our AI inspects official business websites, domain registration records, public registry data, and industry metadata to ensure that brand profiles belong to legitimate operating businesses.",
    },
    {
      q: "Can anyone upload meme templates?",
      a: "Yes. Anyone can become a community contributor by uploading meme templates. Uploaders receive public attribution, download stats, badges, and leaderboard points.",
    },
    {
      q: "How are templates moderated?",
      a: "All uploaded templates pass through an automated multi-stage AI pipeline analyzing OCR text, image semantics, duplicate scores, NSFW risks, copyright compliance, and hate speech policy.",
    },
    {
      q: "Can I use my own custom meme templates?",
      a: "Yes. Verified brands and contributors can upload private or public custom meme templates directly into their workspace generator.",
    },
    {
      q: "How are duplicate templates handled?",
      a: "Virlio uses image embedding vectors and similarity scoring to detect duplicate template submissions, redirecting users to the highest quality original version.",
    },
    {
      q: "How are community reports reviewed?",
      a: "When a user reports a template for spam, nudity, or copyright violations, AI instantly evaluates the claim and either dismisses it, deletes the asset, or escalates it to human review.",
    },
    {
      q: "Which social platforms are supported?",
      a: "Virlio renders high-resolution PNG/MP4 assets formatted for LinkedIn, X (Twitter), Instagram, TikTok, Facebook, and Threads.",
    },
    {
      q: "Does Virlio own my generated memes?",
      a: "No. Your business retains full ownership and commercial rights to all generated memes created under your verified brand profile.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Got Questions?
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Frequently Asked Questions
          </p>
          <p className="mt-3 text-base text-gray-600">
            Everything you need to know about Virlio AI Meme Generator, brand verification, and community templates.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.q} className="virlio-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
