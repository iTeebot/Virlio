"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { FormInput, FormCheckbox, validateInput } from "@/components/ui/form-input";
import { toast } from "@/components/ui/toast";
import { Loader2, ArrowRight } from "lucide-react";

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
  const [authErrorObj, setAuthErrorObj] = useState<any>(null);

  useEffect(() => {
    const urlError = searchParams?.get("error");
    const isDeleted = searchParams?.get("deleted");

    if (isDeleted === "true") {
      toast.info("Your account has been deleted. We're sorry to see you go!", "Account Deleted");
    }

    if (urlError) {
      const errObj = getAuthErrorMessage(urlError);
      setAuthErrorObj(errObj);
      setErrors((prev) => ({ ...prev, general: errObj.description }));
      toast.error(errObj.description, errObj.title);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate login authentication request
    setTimeout(() => {
      setIsSubmitting(false);

      // Check for test invalid credentials or non-existent account triggers
      if (email.toLowerCase().includes("invalid") || email.toLowerCase().includes("notfound") || password === "wrong") {
        const errMsg = "Account not found or invalid credentials. Please check your email and password.";
        setErrors({ general: errMsg });
        toast.error(errMsg, "Authentication Failed");
        return;
      }

      // Successful login redirect
      toast.success("Successfully signed in! Redirecting to workspace...", "Welcome Back");
      setTimeout(() => {
        window.location.href = "/dashboard/overview";
      }, 500);
    }, 1000);
  };

  return (
    <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 shadow-xs rounded-2xl w-full">
      {/* Prominent Large Card Logo - Clickable link to home page */}
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

      {/* Header Heading & Subtitle */}
      <div className="text-center mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Continue to your Virlio workspace.</p>
      </div>

      {/* Reusable Provider Social Login Buttons Component */}
      <SocialAuthButtons disabled={isSubmitting} className="mb-4" />

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-full border-t border-gray-200" />
        <span className="absolute bg-white px-3 text-xs text-gray-500 uppercase tracking-wider">
          or continue with email
        </span>
      </div>

      {/* Email Login Form Using Reusable FormInput & FormCheckbox Components */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {errors.general && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600">
            {errors.general}
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
          label="Remember me"
          checked={rememberMe}
          onChange={setRememberMe}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50 mt-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-blue-200" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Redirect Line */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-gray-600">
        <span>Don&apos;t have an account? </span>
        <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
