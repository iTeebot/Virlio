"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Send, KeyRound } from "lucide-react";

interface EmailOTPVerificationWidgetProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerifiedStatusChange: (isVerified: boolean) => void;
  isVerified?: boolean;
}

export function EmailOTPVerificationWidget({
  email,
  onEmailChange,
  onVerifiedStatusChange,
  isVerified = false,
}: EmailOTPVerificationWidgetProps) {
  const [codeSent, setCodeSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatusMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/v1/brands/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const json = await res.json();
      if (res.ok) {
        setCodeSent(true);
        setCooldown(json.cooldownSeconds || 60);
        setStatusMsg({ type: "success", text: json.message || "Verification code sent to your email." });
      } else {
        if (json.cooldownSeconds) setCooldown(json.cooldownSeconds);
        setStatusMsg({ type: "error", text: json.message || "Failed to send verification code." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Connection error sending verification code." });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setStatusMsg({ type: "error", text: "Please enter the 6-digit verification code." });
      return;
    }

    setVerifying(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/v1/brands/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: otpCode.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.data?.verified) {
        onVerifiedStatusChange(true);
        setCodeSent(false);
        setStatusMsg({ type: "success", text: "Business email verified successfully!" });
      } else {
        setStatusMsg({ type: "error", text: json.message || "Invalid verification code." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Connection error verifying code." });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-blue-600" />
          Business Contact Email *
        </label>

        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> OTP Verification Required
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
            if (isVerified) onVerifiedStatusChange(false);
            setStatusMsg(null);
          }}
          disabled={isVerified}
          placeholder="contact@yourbrand.com"
          className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs disabled:bg-gray-100"
        />

        {!isVerified && (
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={sending || cooldown > 0 || !email.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs shrink-0"
          >
            {sending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {sending
              ? "Sending..."
              : cooldown > 0
              ? `Resend (${cooldown}s)`
              : codeSent
              ? "Resend Code"
              : "Send Code"}
          </button>
        )}
      </div>

      {/* OTP Code Entry Input Form */}
      {codeSent && !isVerified && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Enter 6-Digit Email Verification Code
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-36 px-3.5 py-2 text-center text-base font-mono font-bold tracking-widest bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={verifying || otpCode.length !== 6}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </div>
      )}

      {statusMsg && (
        <p
          className={`text-xs font-medium p-2.5 rounded-lg border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {statusMsg.text}
        </p>
      )}
    </div>
  );
}
