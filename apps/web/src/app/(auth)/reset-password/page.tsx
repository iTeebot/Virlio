"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { Loader2, ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      const errMsg = "Please enter a valid email address.";
      setError(errMsg);
      toast.error(errMsg, "Validation Error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      if (email.toLowerCase().includes("notfound")) {
        const errMsg = "No account found with this email address.";
        setError(errMsg);
        toast.error(errMsg, "Account Not Found");
        return;
      }

      setSubmitted(true);
      toast.success(`Password reset email sent to ${email}`, "Email Sent");
    }, 1000);
  };

  return (
    <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 shadow-xs rounded-2xl w-full">
      {/* 3x Prominent Large Card Logo - Clickable link to home page */}
      <div className="flex justify-center mb-3">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
          <div className="relative h-28 w-80 sm:h-32 sm:w-96">
            <Image
              src="/images/logo-horizontal.png"
              alt="Virlio Horizontal Logo"
              fill
              sizes="384px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {submitted ? (
        /* Confirmation State after submission */
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Check Your Inbox</h2>
          <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
            We sent a password reset link to <strong className="text-gray-900">{email}</strong>. Please check your email and follow the instructions.
          </p>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1"
            >
              Didn&apos;t receive email? Try again
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Initial Form State */
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  disabled={isSubmitting}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
                    error ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-white"
                  }`}
                />
              </div>
              {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-blue-200" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs">
            <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
