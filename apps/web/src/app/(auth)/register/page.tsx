"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { FormInput, FormCheckbox, validateInput } from "@/components/ui/form-input";
import { toast } from "@/components/ui/toast";
import { Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function RegisterPage() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/dashboard/overview";
    }
  }, [status]);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time username verification states
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState<string>("");

  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreedTerms?: string;
    general?: string;
  }>({});

  // Real-time debounced username uniqueness check against database API
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus("invalid");
      setUsernameMessage("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameStatus("invalid");
      setUsernameMessage("Only letters, numbers, underscores, and hyphens allowed.");
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking availability in database...");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/users/check-username?username=${encodeURIComponent(trimmed)}`);
        const json = await res.json();

        if (json.success && json.data) {
          if (json.data.available) {
            setUsernameStatus("available");
            setUsernameMessage("Username is available!");
          } else {
            setUsernameStatus("taken");
            setUsernameMessage(json.data.reason || "Username is already taken.");
          }
        } else {
          setUsernameStatus("invalid");
          setUsernameMessage("Unable to check username.");
        }
      } catch (err) {
        setUsernameStatus("invalid");
        setUsernameMessage("Error checking username availability.");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fullNameErr = validateInput("text", fullName, true);
    const emailErr = validateInput("email", email, true);
    const passwordErr = validateInput("password", password, true);
    let usernameErr: string | undefined = undefined;
    let confirmErr: string | undefined = undefined;
    let termsErr: string | undefined = undefined;

    if (!username.trim() || username.trim().length < 3) {
      usernameErr = "Username is mandatory and must be at least 3 characters.";
    } else if (usernameStatus === "taken" || usernameStatus === "invalid") {
      usernameErr = usernameMessage || "Please enter a valid unique username.";
    }

    if (password !== confirmPassword) {
      confirmErr = "Passwords do not match.";
    }
    if (!agreedTerms) {
      termsErr = "You must agree to the Terms and Privacy Policy.";
    }

    if (fullNameErr || usernameErr || emailErr || passwordErr || confirmErr || termsErr) {
      setErrors({
        fullName: fullNameErr,
        username: usernameErr,
        email: emailErr,
        password: passwordErr,
        confirmPassword: confirmErr,
        agreedTerms: termsErr,
      });

      if (usernameErr) {
        toast.error(usernameErr, "Username Required");
      } else if (confirmErr) {
        toast.error("Passwords do not match. Please check your entries.", "Validation Error");
      } else if (termsErr) {
        toast.error("You must accept the Terms & Privacy Policy to create an account.", "Validation Error");
      } else {
        toast.error("Please fix the errors in the form before submitting.", "Validation Error");
      }
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (email.toLowerCase().includes("exists")) {
        const errMsg = "An account with this email address already exists. Please sign in instead.";
        setErrors({ general: errMsg });
        toast.error(errMsg, "Registration Failed");
        return;
      }

      toast.success(`Account @${username.toLowerCase()} created successfully! Verification email sent.`, "Welcome to Virlio");
      setTimeout(() => {
        window.location.href = "/verify-email";
      }, 600);
    }, 1200);
  };

  return (
    <div className="virlio-card p-5 sm:p-7 bg-white border border-gray-200 shadow-xs rounded-2xl w-full">
      {/* Prominent Large Card Logo - Clickable link to home page */}
      <div className="flex justify-center mb-2">
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
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create Your Free Account</h2>
        <p className="text-xs text-gray-600 mt-0.5">Join Virlio and start generating viral content for your brand.</p>
      </div>

      {/* Reusable Provider Social Login Buttons Component */}
      <SocialAuthButtons disabled={isSubmitting} className="mb-3" />

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-3">
        <div className="w-full border-t border-gray-200" />
        <span className="absolute bg-white px-2.5 text-[10px] text-gray-500 uppercase tracking-wider">
          or continue with email
        </span>
      </div>

      {/* Sign Up Form Using Reusable FormInput & FormCheckbox Components */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {errors.general && (
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 mb-2">
            {errors.general}
          </div>
        )}

        <FormInput
          id="fullName"
          label="Full Name"
          type="text"
          required
          placeholder="Jane Doe"
          value={fullName}
          onChange={setFullName}
          error={errors.fullName}
          disabled={isSubmitting}
        />

        {/* Mandatory Unique Username Input with Real-time Database Verification */}
        <div>
          <FormInput
            id="username"
            label="Username (Min. 3 characters)"
            type="text"
            required
            placeholder="janedoe"
            value={username}
            onChange={(val) => setUsername(val.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            error={errors.username}
            disabled={isSubmitting}
            rightElement={
              usernameStatus === "checking" ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : usernameStatus === "available" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : usernameStatus === "taken" || usernameStatus === "invalid" ? (
                <XCircle className="w-4 h-4 text-red-600" />
              ) : null
            }
          />
          {usernameMessage && (
            <p
              className={`mt-1 text-[11px] font-medium flex items-center gap-1 ${
                usernameStatus === "available"
                  ? "text-emerald-600"
                  : usernameStatus === "checking"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {usernameStatus === "available" && <CheckCircle2 className="w-3 h-3 shrink-0" />}
              {usernameStatus === "taken" && <XCircle className="w-3 h-3 shrink-0" />}
              {usernameStatus === "invalid" && <XCircle className="w-3 h-3 shrink-0" />}
              <span>{usernameMessage}</span>
            </p>
          )}
        </div>

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

        <div className="grid grid-cols-2 gap-2">
          <FormInput
            id="password"
            label="Password"
            type="password"
            required
            placeholder="Min. 8 chars"
            value={password}
            onChange={setPassword}
            error={errors.password}
            disabled={isSubmitting}
            showPasswordToggle={false}
          />

          <FormInput
            id="confirmPassword"
            label="Confirm"
            type="password"
            required
            placeholder="Re-enter"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            disabled={isSubmitting}
            showPasswordToggle={false}
          />
        </div>

        <FormCheckbox
          id="agreedTerms"
          checked={agreedTerms}
          onChange={setAgreedTerms}
          disabled={isSubmitting}
          error={errors.agreedTerms}
          label={
            <span className="text-[11px] text-gray-600 font-medium leading-tight">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          }
        />

        <button
          type="submit"
          disabled={isSubmitting || usernameStatus === "checking" || usernameStatus === "taken" || usernameStatus === "invalid"}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 mt-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Redirect Line */}
      <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-center text-xs text-gray-600">
        <span>Already have an account? </span>
        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
}
