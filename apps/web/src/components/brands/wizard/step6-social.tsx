"use client";

import React, { useState, useEffect, useRef } from "react";
import { Step6SocialPresence } from "@/lib/validations/brand-wizard";
import { SocialPlatform, VerificationResult } from "@/lib/social-verification/types";
import { WebsiteVerificationWidget } from "../website-verification-widget";
import { EmailOTPVerificationWidget } from "../email-otp-verification-widget";
import {
  Share2,
  Globe,
  Mail,
  Phone,
  Camera,
  Briefcase,
  Video,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Check,
  Edit3,
} from "lucide-react";

interface Step6Props {
  data: Step6SocialPresence;
  onChange: (updated: Partial<Step6SocialPresence>) => void;
}

interface PlatformConfig {
  id: SocialPlatform;
  key: keyof Step6SocialPresence;
  label: string;
  prefix: string;
  placeholder: string;
  icon: React.ElementType;
  iconColor: string;
  themeColor: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "instagram",
    key: "instagram",
    label: "Instagram Username",
    prefix: "instagram.com/",
    placeholder: "teezyonofficial or @teezyonofficial",
    icon: Camera,
    iconColor: "text-pink-600",
    themeColor: "pink",
  },
  {
    id: "facebook",
    key: "facebook",
    label: "Facebook Page Handle",
    prefix: "facebook.com/",
    placeholder: "yourbrand",
    icon: Share2,
    iconColor: "text-blue-600",
    themeColor: "blue",
  },
  {
    id: "linkedin",
    key: "linkedin",
    label: "LinkedIn Company Handle",
    prefix: "linkedin.com/company/",
    placeholder: "yourbrand",
    icon: Briefcase,
    iconColor: "text-blue-700",
    themeColor: "indigo",
  },
  {
    id: "x",
    key: "x",
    label: "X (Twitter) Handle",
    prefix: "x.com/",
    placeholder: "@yourbrand",
    icon: MessageSquare,
    iconColor: "text-sky-500",
    themeColor: "sky",
  },
  {
    id: "youtube",
    key: "youtube",
    label: "YouTube Channel Handle",
    prefix: "youtube.com/@",
    placeholder: "@yourbrand",
    icon: Video,
    iconColor: "text-red-600",
    themeColor: "red",
  },
  {
    id: "google_business",
    key: "google_business",
    label: "Google Business Short Link",
    prefix: "g.co/kgs/",
    placeholder: "yourbusiness",
    icon: Globe,
    iconColor: "text-amber-600",
    themeColor: "amber",
  },
];

interface TransientVerificationState {
  rawInput: string;
  status: "idle" | "checking" | "found" | "not_found" | "error";
  data: VerificationResult | null;
  confirmed: boolean;
  errorMsg?: string;
}

export function Step6SocialComponent({ data, onChange }: Step6Props) {
  // Helper to extract clean handle from full URL or stored value
  const extractHandleFromUrl = (val?: any): string => {
    if (!val) return "";
    const str = typeof val === "string" ? val : (typeof val === "object" && val.handle ? String(val.handle) : String(val));
    let clean = str.trim();

    // Strip protocol
    clean = clean.replace(/^https?:\/\/(www\.)?/, "");

    // Strip platform domains (including optional trailing slash)
    clean = clean.replace(/^(instagram\.com|facebook\.com|linkedin\.com\/company|linkedin\.com\/in|x\.com|twitter\.com|youtube\.com\/@?|g\.co\/kgs\/)\/?/i, "");

    // Strip leading slash if present
    clean = clean.replace(/^\//, "");

    // Strip trailing slashes or URL query parameters
    clean = clean.replace(/[\/\?#].*$/, "");

    // Strip leading @
    return clean.replace(/^@/, "").trim();
  };

  // Transient runtime verification state (NOT persisted in DB)
  const [verifications, setVerifications] = useState<Record<SocialPlatform, TransientVerificationState>>(() => {
    const initial: Partial<Record<SocialPlatform, TransientVerificationState>> = {};
    for (const p of PLATFORMS) {
      const existingVal = (data[p.key] as string) || "";
      const handle = extractHandleFromUrl(existingVal);
      const isConfirmed = Boolean(existingVal && handle);

      initial[p.id] = {
        rawInput: handle,
        status: isConfirmed ? "found" : "idle",
        data: isConfirmed ? {
          exists: true,
          platform: p.id,
          username: handle,
          displayName: handle,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${handle}`,
          profileUrl: existingVal.startsWith("http") ? existingVal : `https://${p.prefix}${handle}`,
        } : null,
        confirmed: isConfirmed,
      };
    }
    return initial as Record<SocialPlatform, TransientVerificationState>;
  });

  // Sync state when data props update (e.g., resuming a draft)
  useEffect(() => {
    setVerifications((prev) => {
      let updated = false;
      const next = { ...prev };

      for (const p of PLATFORMS) {
        const rawVal = data[p.key];
        const existingVal = typeof rawVal === "string" ? rawVal : (rawVal && typeof rawVal === "object" && "profileUrl" in rawVal ? (rawVal as any).profileUrl : "");
        const handle = extractHandleFromUrl(existingVal);

        if (existingVal && handle) {
          const current = next[p.id];
          if (!current || !current.confirmed || current.rawInput !== handle) {
            updated = true;
            next[p.id] = {
              rawInput: handle,
              status: "found",
              data: {
                exists: true,
                platform: p.id,
                username: handle,
                displayName: handle,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${handle}`,
                profileUrl: existingVal.startsWith("http") ? existingVal : `https://${p.prefix}${handle}`,
              },
              confirmed: true,
            };
          }
        }
      }

      return updated ? next : prev;
    });
  }, [data]);

  const abortControllers = useRef<Partial<Record<SocialPlatform, AbortController>>>({});

  // Debounced verification function
  const triggerVerification = async (platformId: SocialPlatform, rawInput: string) => {
    if (!rawInput || !rawInput.trim()) {
      setVerifications((prev) => ({
        ...prev,
        [platformId]: { rawInput: "", status: "idle", data: null, confirmed: false },
      }));
      onChange({ [PLATFORMS.find((p) => p.id === platformId)!.key]: "" });
      return;
    }

    // Cancel previous inflight request if user is still typing
    if (abortControllers.current[platformId]) {
      abortControllers.current[platformId]?.abort();
    }

    const controller = new AbortController();
    abortControllers.current[platformId] = controller;

    setVerifications((prev) => ({
      ...prev,
      [platformId]: { ...prev[platformId], rawInput, status: "checking", confirmed: false },
    }));

    try {
      const res = await fetch("/api/v1/brands/verify-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId, input: rawInput }),
        signal: controller.signal,
      });

      const json = await res.json();
      if (res.ok && json.data?.exists) {
        setVerifications((prev) => ({
          ...prev,
          [platformId]: {
            rawInput,
            status: "found",
            data: json.data,
            confirmed: false,
          },
        }));
      } else {
        setVerifications((prev) => ({
          ...prev,
          [platformId]: {
            rawInput,
            status: json.data?.error ? "error" : "not_found",
            data: json.data || null,
            confirmed: false,
            errorMsg: json.message || "Profile could not be found automatically.",
          },
        }));
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setVerifications((prev) => ({
        ...prev,
        [platformId]: {
          rawInput,
          status: "error",
          data: null,
          confirmed: false,
          errorMsg: "Network timeout or verification failed.",
        },
      }));
    }
  };

  const handleInputChange = (platformId: SocialPlatform, value: string) => {
    setVerifications((prev) => ({
      ...prev,
      [platformId]: { ...prev[platformId], rawInput: value, confirmed: false },
    }));
  };

  const handleConfirmProfile = (platformId: SocialPlatform) => {
    const verif = verifications[platformId];
    if (!verif || !verif.data) return;

    setVerifications((prev) => ({
      ...prev,
      [platformId]: { ...prev[platformId], confirmed: true },
    }));

    // Update parent wizard state with the canonical full URL
    const pConfig = PLATFORMS.find((p) => p.id === platformId)!;
    onChange({ [pConfig.key]: verif.data.profileUrl });
  };

  const handleResetVerification = (platformId: SocialPlatform) => {
    const pConfig = PLATFORMS.find((p) => p.id === platformId)!;
    setVerifications((prev) => ({
      ...prev,
      [platformId]: { rawInput: "", status: "idle", data: null, confirmed: false },
    }));
    onChange({ [pConfig.key]: "" });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          Step 6: Social Presence & Contact Info
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Enter handles, @usernames, or profile URLs. The runtime system verifies public profiles live so you can confirm ownership.
        </p>
      </div>

      {/* Email OTP Verification & Business Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmailOTPVerificationWidget
          email={data.business_email}
          onEmailChange={(email) => onChange({ business_email: email })}
          onVerifiedStatusChange={(verified) => onChange({ email_verified: verified } as any)}
          isVerified={Boolean((data as any).email_verified)}
        />

        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
          <label className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-blue-600" />
            Business Phone (WhatsApp Business)
          </label>
          <input
            type="tel"
            value={data.business_phone || ""}
            onChange={(e) => onChange({ business_phone: e.target.value, whatsapp_business: e.target.value })}
            placeholder="+92 300 1234567"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs"
          />
        </div>
      </div>

      {/* Official Website & Ownership Verification */}
      <WebsiteVerificationWidget
        websiteUrl={data.website || ""}
        onWebsiteChange={(url) => onChange({ website: url })}
      />

      {/* Generic Social Verification System Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Official Social Media Profiles</h3>
          <span className="text-xs text-gray-500">Supports handle, @name, or full URL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLATFORMS.map((p) => {
            const IconComp = p.icon;
            const state = verifications[p.id] || { rawInput: "", status: "idle", data: null, confirmed: false };

            return (
              <div key={p.id} className="p-4 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <IconComp className={`w-4 h-4 ${p.iconColor}`} />
                    {p.label}
                  </label>

                  {/* Status Badges */}
                  {state.confirmed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                    </span>
                  ) : state.status === "checking" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> Checking...
                    </span>
                  ) : state.status === "found" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      Profile Found
                    </span>
                  ) : state.status === "not_found" || state.status === "error" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                      Unverified
                    </span>
                  ) : null}
                </div>

                {/* Input & Verify Action */}
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="flex flex-1 rounded-xl shadow-xs min-w-0">
                    <span className="inline-flex items-center px-2.5 text-xs bg-gray-50 border border-r-0 border-gray-300 text-gray-500 rounded-l-xl select-none font-medium truncate max-w-[130px] sm:max-w-none">
                      {p.prefix}
                    </span>
                    <input
                      type="text"
                      value={state.rawInput}
                      onChange={(e) => handleInputChange(p.id, e.target.value)}
                      disabled={state.confirmed}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          triggerVerification(p.id, state.rawInput);
                        }
                      }}
                      placeholder={p.placeholder}
                      className="flex-1 min-w-0 px-3 py-2 text-xs bg-white border border-gray-300 text-gray-900 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                    />
                  </div>

                  {!state.confirmed ? (
                    <button
                      type="button"
                      onClick={() => triggerVerification(p.id, state.rawInput)}
                      disabled={state.status === "checking" || !state.rawInput.trim()}
                      className="px-3.5 py-2 text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 shrink-0 text-center"
                    >
                      Verify
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResetVerification(p.id)}
                      className="px-3.5 py-2 text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shrink-0 text-center"
                    >
                      <Edit3 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  )}
                </div>

                {/* Runtime Profile Preview Card (Transient - Not persisted in DB) */}
                {state.status === "found" && state.data && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-3">
                      {state.data.avatar && (
                        <img
                          src={state.data.avatar}
                          alt={state.data.displayName}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${state.data?.username}`;
                          }}
                          className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-xs shrink-0 bg-white"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{state.data.displayName}</h4>
                          {state.data.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">@{state.data.username}</p>
                      </div>

                      <a
                        href={state.data.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {state.data.bio && (
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed bg-white p-2 rounded-lg border border-gray-200">
                        {state.data.bio}
                      </p>
                    )}

                    {!state.confirmed ? (
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-600 font-medium">
                          Please confirm this is your official profile.
                        </span>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConfirmProfile(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirm
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed official profile handle
                      </div>
                    )}
                  </div>
                )}

                {/* Error / Not Found Message */}
                {(state.status === "not_found" || state.status === "error") && (
                  <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {state.errorMsg || "Profile unverified. You can still confirm manually or edit the handle."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
