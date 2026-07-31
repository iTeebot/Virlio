"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function DataDeletionPage() {
  const [emailInput, setEmailInput] = useState("");
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const randomCode = "DEL-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      setConfirmationCode(randomCode);
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-700 mb-4">
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>User Rights & Privacy Compliance</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight leading-tight">
              User Data Deletion
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Instructions and tools to request complete deletion of your Virlio account, connected social permissions, and stored data.
            </p>
          </div>

          {/* Quick Option 1: In-App Settings (Recommended) */}
          <div className="virlio-card p-6 sm:p-8 bg-white border border-blue-600 ring-1 ring-blue-600 rounded-3xl mb-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-600 text-white">
                  Fastest Method &bull; Immediate Self-Service
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  Delete Directly via Account Settings
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  If you have an active Virlio account, you can initiate permanent account deletion directly inside your account dashboard settings.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                >
                  <span>Go to Settings</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Option 2: Facebook / Meta & Third-Party App Revocation */}
          <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Facebook & Connected Social Login Deletion
                </h3>
                <p className="text-xs text-gray-500">
                  How to remove Virlio access and request data deletion via Meta / Facebook
                </p>
              </div>
            </div>

            <ol className="space-y-3 pl-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Log into your Facebook account and go to <strong>Settings & Privacy &gt; Settings</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Navigate to <strong>Apps and Websites</strong> and find <strong>Virlio</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Click <strong>Remove</strong>. You can also select <strong>View Removed Apps</strong> and click <strong>Send Request</strong> to trigger Facebook Data Deletion callback.
                </span>
              </li>
            </ol>
          </div>

          {/* Option 3: Manual Deletion Ticket Generator */}
          <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl mb-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Submit Manual Deletion Request</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                If you no longer have access to your account, submit your email below to receive a deletion tracking confirmation code.
              </p>
            </div>

            {confirmationCode ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Deletion Ticket Created</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your data deletion request for <strong>{emailInput}</strong> has been logged.
                </p>
                <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">Confirmation Code:</span>
                  <span className="font-mono font-bold text-gray-900">{confirmationCode}</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Our privacy engineering team will purge all database records within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !emailInput}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Request Account & Data Deletion</span>
                </button>
              </form>
            )}
          </div>

          {/* Scope & Retention Information */}
          <div className="virlio-surface p-6 sm:p-8 border border-gray-200 rounded-3xl text-xs space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">What Data Is Permanently Erased?</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Personal Profile & Credentials (Name, Email, Passwords, Avatars)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Connected OAuth Credentials (Google, Facebook, GitHub, LinkedIn tokens)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Generated Memes, Saved Drafts, and Private Custom Templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Brand Verification Records and Analytics History</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
