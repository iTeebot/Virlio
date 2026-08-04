"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { FormInput, FormCheckbox, validateInput } from "@/components/ui/form-input";
import { toast } from "@/components/ui/toast";
import { Loader2, ArrowRight, CheckCircle2, Award, ShieldCheck } from "lucide-react";
import { getAuthErrorMessage } from "@/lib/auth/auth-error-mapper";

function LoginForm() {
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/dashboard/overview";
    }
  }, [status]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isVerifiedNotice, setIsVerifiedNotice] = useState(false);

  // Load remembered email on mount & handle URL parameters
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("virlio_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }

    const urlError = searchParams?.get("error");
    const isDeleted = searchParams?.get("deleted");
    const isVerified = searchParams?.get("verified");
    const verifiedEmail = searchParams?.get("email");

    if (isVerified === "true") {
      setIsVerifiedNotice(true);
      if (verifiedEmail) {
        setEmail(decodeURIComponent(verifiedEmail));
      }
      toast.success("Email verified successfully! You can now sign in.", "Account Activated");
    }

    if (isDeleted === "true") {
      toast.info("Your account has been deleted. We're sorry to see you go!", "Account Deleted");
    }

    if (urlError) {
      const errObj = getAuthErrorMessage(urlError);
      setErrors((prev) => ({ ...prev, general: errObj.description }));
      toast.error(errObj.description, errObj.title);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailErr = validateInput("email", email, true);
    const passwordErr = validateInput("password", password, true);

    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      toast.error("Please fill in all required fields correctly.", "Form Error");
      return;
    }

    setIsSubmitting(true);

    // Save or clear remembered email preference
    try {
      if (rememberMe) {
        localStorage.setItem("virlio_remembered_email", email.trim());
      } else {
        localStorage.removeItem("virlio_remembered_email");
      }
    } catch (e) {
      // Ignore storage errors
    }

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        const errObj = getAuthErrorMessage(res.error);
        setErrors({ general: errObj.description });
        toast.error(errObj.description, errObj.title);
        setIsSubmitting(false);
      } else {
        toast.success("Successfully signed in! Redirecting to workspace...", "Welcome Back");
        const rawCallback = searchParams?.get("callbackUrl");
        const targetUrl = rawCallback && rawCallback.startsWith("/") ? rawCallback : "/dashboard/overview";
        window.location.href = targetUrl;
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication service unavailable. Please try again.";
      setErrors({ general: msg });
      toast.error(msg, "Sign In Error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 shadow-xs rounded-2xl w-full space-y-4">
      {/* Prominent Clickable Logo */}
      <div className="flex justify-center mb-2">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
          <div className="relative h-24 w-80 sm:h-28 sm:w-88">
            <Image
              src="/images/logo-horizontal.png"
              alt="Virlio Horizontal Logo"
              fill
              sizes="352px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Header Heading & Subtitle */}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Continue to your Virlio workspace.</p>
      </div>

      {/* Dedicated Email Verification Success Banner */}
      {isVerifiedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-left shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-xs font-extrabold text-emerald-950">Email Verified & Account Activated!</h3>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed pl-7">
            Your primary email is confirmed. Enter your password below to access your workspace.
          </p>
          <div className="mt-2 pt-2 border-t border-emerald-200/60 pl-7 flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Early Adopter Badge Unlocked!</span>
          </div>
        </div>
      )}

      {/* Reusable Provider Social Login Buttons Component */}
      <SocialAuthButtons disabled={isSubmitting} className="mb-2" />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="w-full border-t border-gray-200" />
        <span className="absolute bg-white px-3 text-xs text-gray-500 uppercase tracking-wider">
          or continue with email
        </span>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {errors.general && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            ⚠️ {errors.general}
          </div>
        )}

        <FormInput
          id="email"
          label="Email Address"
          type="email"
          required
          placeholder="name@company.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          disabled={isSubmitting}
          autoFocus={!email}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={errors.password}
          disabled={isSubmitting}
          autoFocus={Boolean(email)}
          rightElement={
            <Link
              href="/reset-password"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          }
        />

        <FormCheckbox
          id="rememberMe"
          label="Remember my email address on this device"
          checked={rememberMe}
          onChange={setRememberMe}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-extrabold text-white shadow-xs transition-colors disabled:opacity-50 mt-1 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Redirect Line */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-gray-600">
        <span>Don&apos;t have an account? </span>
        <Link href="/register" className="font-extrabold text-blue-600 hover:text-blue-700 transition-colors">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
