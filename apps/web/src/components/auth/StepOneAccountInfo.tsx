"use client";

import React, { useState, useEffect } from "react";
import { User, AtSign, Mail, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface StepOneAccountInfoProps {
  fullName: string;
  setFullName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  onNext: () => void;
}

export function StepOneAccountInfo({
  fullName,
  setFullName,
  username,
  setUsername,
  email,
  setEmail,
  onNext,
}: StepOneAccountInfoProps) {
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");

  // Debounced server-side username availability check
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
        setUsernameMessage("Network error checking username.");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  // Email format validation
  const validateEmailFormat = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Name validation
  const validateName = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setNameError("Full Name is required.");
      return false;
    }
    if (trimmed.length < 2) {
      setNameError("Full Name must be at least 2 characters.");
      return false;
    }
    setNameError("");
    return true;
  };

  const isStepValid =
    fullName.trim().length >= 2 &&
    username.trim().length >= 3 &&
    usernameStatus === "available" &&
    !emailError &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isNameOk = validateName(fullName);
    const isEmailOk = validateEmailFormat(email);

    if (isNameOk && isEmailOk && usernameStatus === "available") {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1">
        <label htmlFor="fullName" className="block text-xs font-semibold text-gray-800">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <User className="w-4 h-4" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (nameError) validateName(e.target.value);
            }}
            onBlur={(e) => validateName(e.target.value)}
            placeholder="Alex Morgan"
            autoComplete="name"
            required
            autoFocus
            className={`block w-full pl-10 pr-3.5 py-2.5 text-xs text-gray-900 bg-white border rounded-xl placeholder-gray-400 focus:outline-none transition-colors ${
              nameError ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            }`}
          />
        </div>
        {nameError && <p className="text-[11px] font-semibold text-red-600">⚠️ {nameError}</p>}
      </div>

      {/* Username */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="username" className="block text-xs font-semibold text-gray-800">
            Username Handle <span className="text-red-500">*</span>
          </label>

          {usernameStatus === "checking" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Checking...</span>
            </span>
          )}
          {usernameStatus === "available" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>Available</span>
            </span>
          )}
          {(usernameStatus === "taken" || usernameStatus === "invalid") && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              <XCircle className="w-3 h-3" />
              <span>Unavailable</span>
            </span>
          )}
        </div>

        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <AtSign className="w-4 h-4" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            placeholder="alexmorgan"
            autoComplete="username"
            required
            className={`block w-full pl-10 pr-3.5 py-2.5 text-xs text-gray-900 bg-white border rounded-xl placeholder-gray-400 focus:outline-none transition-colors ${
              usernameStatus === "taken" || usernameStatus === "invalid"
                ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : usernameStatus === "available"
                ? "border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                : "border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            }`}
          />
        </div>

        {usernameMessage && (
          <p
            className={`text-[11px] font-medium ${
              usernameStatus === "available"
                ? "text-emerald-600 font-semibold"
                : usernameStatus === "taken" || usernameStatus === "invalid"
                ? "text-red-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {usernameMessage}
          </p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-xs font-semibold text-gray-800">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmailFormat(e.target.value);
            }}
            onBlur={(e) => validateEmailFormat(e.target.value)}
            placeholder="alex@example.com"
            autoComplete="email"
            required
            className={`block w-full pl-10 pr-3.5 py-2.5 text-xs text-gray-900 bg-white border rounded-xl placeholder-gray-400 focus:outline-none transition-colors ${
              emailError ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            }`}
          />
        </div>
        {emailError && <p className="text-[11px] font-semibold text-red-600">⚠️ {emailError}</p>}
      </div>

      {/* Next Step Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!isStepValid}
          className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all ${
            isStepValid
              ? "bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <span>Next: Security & Terms</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
