"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  errorMessage?: string;
  helpText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "new-password",
  required = true,
  errorMessage,
  helpText,
  disabled = false,
  autoFocus = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const hasError = Boolean(errorMessage);

  return (
    <div className="w-full space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative rounded-xl shadow-xs">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={id}
          name={name || id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={`block w-full pl-10 pr-11 py-2.5 text-xs text-gray-900 bg-white border rounded-xl placeholder-gray-400 focus:outline-none transition-colors ${
            hasError
              ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
              : "border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          } ${disabled ? "bg-gray-50 opacity-60 cursor-not-allowed" : ""}`}
        />

        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          tabIndex={0}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
          title={showPassword ? `Hide ${label}` : `Show ${label}`}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {helpText && !hasError && (
        <p id={`${id}-help`} className="text-[11px] text-gray-500">
          {helpText}
        </p>
      )}

      {hasError && (
        <p id={`${id}-error`} className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}
