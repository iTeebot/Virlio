import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Sparkles, CheckCircle2, FileText, ArrowRight } from "lucide-react";

export function AppPurposeSection() {
  return (
    <section id="about-virlio" className="py-16 bg-white border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Verified Application Purpose & Data Privacy</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            About Virlio AI Meme Generator
          </h2>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            Virlio is an AI-powered content platform engineered to help verified businesses and digital creators build brand awareness through high-converting marketing memes.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1: Core Purpose */}
          <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Application Purpose</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Virlio provides businesses and creators with an automated meme editor, crowdsourced template library, AI caption generator, and brand verification ecosystem to accelerate viral social media presence.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-blue-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Free Core Usage for All Brands</span>
            </div>
          </div>

          {/* Card 2: OAuth & Google Login */}
          <div className="virlio-card p-6 sm:p-8 bg-white border border-blue-600 ring-1 ring-blue-600 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Google Sign-In & Privacy</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Virlio uses Google OAuth authentication strictly to verify user identities, secure creator account access, and link generated memes to your authenticated brand profile without managing passwords.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-blue-700">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Minimal Scope (`openid`, `profile`, `email`)</span>
            </div>
          </div>

          {/* Card 3: User Data Protection */}
          <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Data Protection Commitments</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Your personal account information and generated content remain protected under strict security controls. We never sell user data to third parties or use private drafts for public AI model training.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-900">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <span>Terms</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
