"use client";

import React, { useState } from "react";
import { PasswordField } from "./PasswordField";
import { PasswordStrength, evaluatePasswordStrength } from "./PasswordStrength";
import { TermsCheckbox } from "./TermsCheckbox";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

interface StepTwoSecurityProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  agreedTerms: boolean;
  setAgreedTerms: (val: boolean) => void;
  marketingOptIn: boolean;
  setMarketingOptIn: (val: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage?: string;
}

export function StepTwoSecurity({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  agreedTerms,
  setAgreedTerms,
  marketingOptIn,
  setMarketingOptIn,
  onBack,
  onSubmit,
  isSubmitting,
  errorMessage,
}: StepTwoSecurityProps) {
  const strength = evaluatePasswordStrength(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isFormValid = strength.isValid && passwordsMatch && agreedTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password Field */}
      <div className="space-y-2">
        <PasswordField
          id="password"
          label="Account Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          autoFocus
        />

        {/* Live Password Strength Meter */}
        <PasswordStrength password={password} />
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        {confirmPassword.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            {passwordsMatch ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passwords match</span>
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Passwords do not match</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Terms & Conditions Checkbox (Mandatory) */}
      <div className="pt-2">
        <TermsCheckbox
          checked={agreedTerms}
          onChange={setAgreedTerms}
        />
      </div>

      {/* Optional Marketing Checkbox */}
      <div className="flex items-start gap-2.5">
        <input
          id="marketingOptIn"
          name="marketingOptIn"
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          disabled={isSubmitting}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
        />
        <label htmlFor="marketingOptIn" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
          (Optional) Receive occasional creator product updates, meme tips, and campaign announcements.
        </label>
      </div>

      {/* Navigation & Submit Buttons */}
      <div className="pt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-1/3 py-3 px-3 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all ${
            isFormValid && !isSubmitting
              ? "bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
