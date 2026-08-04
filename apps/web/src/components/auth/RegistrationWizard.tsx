"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { StepOneAccountInfo } from "./StepOneAccountInfo";
import { StepTwoSecurity } from "./StepTwoSecurity";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { toast } from "@/components/ui/toast";
import { Award, Mail, RefreshCw, Clock } from "lucide-react";

const EARLY_ACCESS_CUTOFF_DATE = "2026-09-30T23:59:59.999Z";

function calculateDaysRemaining(): number {
  const target = new Date(EARLY_ACCESS_CUTOFF_DATE).getTime();
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function RegistrationWizard() {
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verification Pending UI State
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const daysRemaining = calculateDaysRemaining();

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username,
          email,
          password,
          termsAccepted: agreedTerms,
          marketingOptIn,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setRegisteredEmail(email.trim().toLowerCase());
        setIsVerificationSent(true);
        setResendCooldown(60);
        toast.success("Verification email sent! Please check your inbox.", "Registration Complete");
      } else {
        const rawErr = json?.error || json?.message;
        const msg = typeof rawErr === "string" ? rawErr : typeof rawErr === "object" && rawErr?.message ? rawErr.message : "Registration failed. Please try again.";
        setErrorMessage(msg);
        toast.error(msg, "Signup Failed");
      }
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "Network connection error. Please try again.";
      setErrorMessage(msg);
      toast.error(msg, "Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending || !registeredEmail) return;

    setIsResending(true);
    try {
      const res = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setResendCooldown(60);
        toast.success("New verification link dispatched!", "Email Resent");
      } else {
        toast.error(json.error || "Failed to resend verification email.", "Resend Failed");
      }
    } catch (err: any) {
      toast.error("Network error sending email.", "Error");
    } finally {
      setIsResending(false);
    }
  };

  // VERIFICATION PENDING SCREEN
  if (isVerificationSent) {
    return (
      <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 shadow-xs rounded-2xl w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-gray-900">Check Your Email</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            We sent a single-use verification link to:
          </p>
          <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 inline-block">
            {registeredEmail}
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Early Access Reward Reserved!</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Your account has been granted the <strong>Early Adopter</strong> badge. Verify your email within 24 hours to activate your account.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resendCooldown > 0 || isResending}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-colors ${
              resendCooldown > 0 || isResending
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
            <span>
              {resendCooldown > 0
                ? `Resend Verification (${resendCooldown}s)`
                : isResending
                ? "Sending Email..."
                : "Resend Verification Email"}
            </span>
          </button>

          <Link
            href="/login"
            className="inline-block text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 shadow-xs rounded-2xl w-full space-y-5">
      {/* Prominent Clickable Logo */}
      <div className="flex justify-center mb-1">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
          <div className="relative h-20 w-64 sm:h-24 sm:w-72">
            <Image
              src="/images/logo-horizontal.png"
              alt="Virlio Horizontal Logo"
              fill
              sizes="288px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Header Heading & Subtitle */}
      <div className="text-center mb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Create Your Virlio Account
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
          Join creators and brands building AI memes.
        </p>
      </div>

      {/* Early Access Campaign Card */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
            <span>Early Access Campaign</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 text-[10px]">
              {daysRemaining > 0 ? `${daysRemaining} Days Left` : "Ended"}
            </span>
          </div>
          <p className="text-[11px] text-amber-900 mt-0.5 leading-snug">
            Register on or before <strong>Sept 30, 2026</strong> to automatically earn the <strong>Early Adopter</strong> badge!
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-gray-900">
            {step === 1 ? "Step 1 of 2: Account Details" : "Step 2 of 2: Security & Terms"}
          </span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {step === 1 ? "50%" : "100%"}
          </span>
        </div>

        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {/* Step 1 or Step 2 Form */}
      {step === 1 ? (
        <StepOneAccountInfo
          fullName={fullName}
          setFullName={setFullName}
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          onNext={() => setStep(2)}
        />
      ) : (
        <StepTwoSecurity
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          agreedTerms={agreedTerms}
          setAgreedTerms={setAgreedTerms}
          marketingOptIn={marketingOptIn}
          setMarketingOptIn={setMarketingOptIn}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      )}

      {/* Social Authentication Divider (Step 1 only) */}
      {step === 1 && (
        <div className="pt-2 space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-gray-200" />
            <span className="absolute bg-white px-3 text-xs text-gray-500 uppercase tracking-wider">
              or continue with
            </span>
          </div>

          <SocialAuthButtons />
        </div>
      )}

      {/* Sign In Link Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-gray-600">
        Already have a Virlio account?{" "}
        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
}
