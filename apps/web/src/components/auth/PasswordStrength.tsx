"use client";

import React from "react";
import { Check, X, ShieldAlert, ShieldCheck } from "lucide-react";

interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 5
  label: "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";
  colorClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  rules: PasswordRule[];
  isCommon: boolean;
  isValid: boolean;
}

const COMMON_PASSWORDS = new Set([
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "welcome",
  "admin123",
  "virlio123",
  "password123",
  "master",
  "abc123456",
]);

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\=\+\[\]\\\/]/.test(password);
  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase().trim());

  const rules: PasswordRule[] = [
    { id: "length", label: "At least 8 characters", met: hasMinLength },
    { id: "uppercase", label: "One uppercase letter (A-Z)", met: hasUppercase },
    { id: "lowercase", label: "One lowercase letter (a-z)", met: hasLowercase },
    { id: "number", label: "One number (0-9)", met: hasNumber },
    { id: "special", label: "One special character (!@#$%...)", met: hasSpecial },
  ];

  let rawScore = 0;
  if (hasMinLength) rawScore += 1;
  if (hasUppercase) rawScore += 1;
  if (hasLowercase) rawScore += 1;
  if (hasNumber) rawScore += 1;
  if (hasSpecial) rawScore += 1;

  if (isCommon) rawScore = Math.min(rawScore, 1);

  let label: "Weak" | "Fair" | "Good" | "Strong" | "Very Strong" = "Weak";
  let colorClass = "bg-red-500";
  let badgeBgClass = "bg-red-50 border-red-200";
  let badgeTextClass = "text-red-700";

  if (rawScore <= 1) {
    label = "Weak";
    colorClass = "bg-red-500";
    badgeBgClass = "bg-red-50 border-red-200";
    badgeTextClass = "text-red-700";
  } else if (rawScore === 2) {
    label = "Fair";
    colorClass = "bg-amber-500";
    badgeBgClass = "bg-amber-50 border-amber-200";
    badgeTextClass = "text-amber-700";
  } else if (rawScore === 3) {
    label = "Good";
    colorClass = "bg-yellow-500";
    badgeBgClass = "bg-yellow-50 border-yellow-200";
    badgeTextClass = "text-yellow-800";
  } else if (rawScore === 4) {
    label = "Strong";
    colorClass = "bg-blue-600";
    badgeBgClass = "bg-blue-50 border-blue-200";
    badgeTextClass = "text-blue-700";
  } else {
    label = "Very Strong";
    colorClass = "bg-emerald-600";
    badgeBgClass = "bg-emerald-50 border-emerald-200";
    badgeTextClass = "text-emerald-700";
  }

  const isValid = hasMinLength && hasLowercase && (hasUppercase || hasNumber || hasSpecial) && !isCommon;

  return {
    score: rawScore,
    label,
    colorClass,
    badgeBgClass,
    badgeTextClass,
    rules,
    isCommon,
    isValid,
  };
}

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const result = evaluatePasswordStrength(password);

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
      {/* Header & Score Indicator */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
          {result.isValid ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span>Password Strength:</span>
        </span>
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${result.badgeBgClass} ${result.badgeTextClass}`}>
          {result.label}
        </span>
      </div>

      {/* Progress Segments */}
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 rounded-full transition-colors ${
              level <= result.score ? result.colorClass : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {result.isCommon && (
        <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 p-1.5 rounded-lg">
          ⚠️ Common password detected. Please choose a more secure password.
        </p>
      )}

      {/* Checklist Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-gray-200/60">
        {result.rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-1.5 text-[11px]">
            {rule.met ? (
              <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[3]" />
            ) : (
              <X className="w-3 h-3 text-gray-400 shrink-0 stroke-[2]" />
            )}
            <span className={rule.met ? "text-gray-900 font-medium" : "text-gray-500"}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
