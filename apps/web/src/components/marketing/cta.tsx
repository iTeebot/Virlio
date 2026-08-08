import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="virlio-surface p-10 sm:p-14 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Ready to Turn Your Brand Into Viral Content?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600">
            Join thousands of verified businesses using Virlio to create brand-safe memes, grow social engagement, and surface digital opportunities.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-8 py-4 text-base font-semibold text-white transition-colors shadow-xs"
            >
              <span>Create Your Verified Brand Profile</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
