"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MailCheck, Loader2, ArrowLeft, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    setResentSuccess(false);

    setTimeout(() => {
      setIsResending(false);
      setResentSuccess(true);
    }, 1000);
  };

  return (
    <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 shadow-xs rounded-2xl w-full text-center">
      {/* 3x Prominent Large Card Logo */}
      <div className="flex justify-center mb-3">
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
      </div>

      {/* Verification Icon Badge */}
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mx-auto flex items-center justify-center mb-4">
        <MailCheck className="w-6 h-6" />
      </div>

      {/* Heading & Subtitle */}
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Verify Your Email</h2>
      <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto mb-6">
        We sent a verification link to your email address. Please check your inbox and click the link to activate your workspace.
      </p>

      {resentSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 mb-6">
          A new verification email has been sent to your inbox.
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          disabled={isResending}
          onClick={handleResend}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors disabled:opacity-50"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Resending Email...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span>Resend Verification Email</span>
            </>
          )}
        </button>

        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-200" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
