"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  id: string;
  label?: string;
  type?: "text" | "email" | "password" | "number" | "url" | "tel";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const validateInput = (type: string, value: string, required = false): string | undefined => {
  if (required && !value.trim()) {
    return "This field is required.";
  }
  if (!value) return undefined;

  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address.";
    }
  }

  if (type === "password") {
    if (value.length < 6) {
      return "Password must be at least 6 characters.";
    }
  }

  if (type === "url") {
    try {
      new URL(value);
    } catch {
      return "Please enter a valid URL (e.g. https://example.com).";
    }
  }

  return undefined;
};

export function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  rightElement,
  required = false,
  disabled = false,
  showPasswordToggle = type === "password",
  className = "",
  ...rest
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inputType = type === "password" && showPassword ? "text" : type;
  const validationError = touched ? validateInput(type, value, required) : undefined;
  const displayError = error || validationError;

  return (
    <div className={`w-full ${className}`} suppressHydrationWarning>
      {(label || rightElement) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label htmlFor={id} className="block text-xs font-semibold text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          {rightElement}
        </div>
      )}

      <div className="relative" suppressHydrationWarning>
        <input
          id={id}
          type={inputType}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onBlur={() => setTouched(true)}
          onChange={(e) => onChange(e.target.value)}
          data-1p-ignore="true"
          data-lpignore="true"
          suppressHydrationWarning
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors disabled:opacity-50 disabled:bg-gray-50 ${
            displayError ? "border-red-300 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-red-500" : "border-gray-200 bg-white"
          } ${showPasswordToggle ? "pr-10" : ""}`}
          {...rest}
        />

        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {displayError ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{displayError}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export function FormCheckbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  error,
}: {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div suppressHydrationWarning>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          suppressHydrationWarning
        />
        <span className="text-xs text-gray-600 font-medium leading-normal">{label}</span>
      </label>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
