"use client";

import React from "react";
import Link from "next/link";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  errorMessage?: string;
  disabled?: boolean;
}

export function TermsCheckbox({
  checked,
  onChange,
  errorMessage,
  disabled = false,
}: TermsCheckboxProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2.5">
        <input
          id="agreedTerms"
          name="agreedTerms"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? "agreedTerms-error" : undefined}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
        />

        <label htmlFor="agreedTerms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          . <span className="text-red-500 font-bold">*</span>
        </label>
      </div>

      {hasError && (
        <p id="agreedTerms-error" className="text-[11px] font-semibold text-red-600 pl-6">
          ⚠️ {errorMessage}
        </p>
      )}
    </div>
  );
}
