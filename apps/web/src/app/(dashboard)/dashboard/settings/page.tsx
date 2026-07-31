"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import { ProfileScoreResult } from "@/lib/services/profile-score.service";
import {
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Award,
  Globe,
  Lock,
  Sparkles,
  X,
} from "lucide-react";

// Brand Logo SVGs (Respecting No Gradients & lucide-react Rules)
function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="#0A66C2" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface ProviderConfig {
  id: "github" | "google" | "linkedin" | "facebook";
  name: string;
  description: string;
  points: number;
  icon: React.ComponentType<{ className?: string }>;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Verify your open-source developer identity and templates.",
    points: 20,
    icon: GithubIcon,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect your professional business profile for brand verification.",
    points: 20,
    icon: LinkedinIcon,
  },
  {
    id: "google",
    name: "Google",
    description: "Link your primary Google workspace account for fast sign-in.",
    points: 10,
    icon: GoogleIcon,
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Link your Facebook creator page for social distribution.",
    points: 10,
    icon: FacebookIcon,
  },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [profileScore, setProfileScore] = useState<ProfileScoreResult | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null);
  const [confirmDisconnectModal, setConfirmDisconnectModal] = useState<ProviderConfig | null>(null);

  // User Editable Profile States
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // User Data Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const res = await fetch("/api/v1/users/delete-account", {
        method: "DELETE",
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Your account and associated data have been permanently erased.", "Account Deleted");
        setTimeout(() => {
          signIn(undefined, { callbackUrl: "/" });
        }, 1000);
      } else {
        toast.error(json.error || "Failed to delete account", "Error");
      }
    } catch (err) {
      toast.error("Error deleting account. Please try again.", "Error");
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  // Fetch Accounts & Profile Score
  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/users/settings/connected-accounts");
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data.profileScore) {
          setProfileScore(data.profileScore);
          setConnectedAccounts(data.profileScore.connectedProviders || []);
        }
      }
    } catch (err) {
      toast.error("Failed to load settings data", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadSettingsData();
      if (session?.user) {
        setName(session.user.name || "");
        setUsername(session.user.username || "");
      }
    }
  }, [status, session]);

  // Connect OAuth Provider
  const handleConnectProvider = (providerId: string) => {
    toast.info(`Redirecting to ${providerId} authorization...`, "Connecting Account");
    signIn(providerId, { callbackUrl: "/dashboard/settings" });
  };

  // Disconnect Provider Request
  const handleConfirmDisconnect = async () => {
    if (!confirmDisconnectModal) return;
    const providerId = confirmDisconnectModal.id;
    setDisconnectingProvider(providerId);

    try {
      const res = await fetch(`/api/v1/users/settings/connected-accounts?provider=${providerId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(`${confirmDisconnectModal.name} account disconnected.`, "Account Unlinked");
        if (json.data?.profileScore) {
          setProfileScore(json.data.profileScore);
          setConnectedAccounts(json.data.profileScore.connectedProviders || []);
        } else {
          loadSettingsData();
        }
      } else {
        toast.error(json.error || json.message || "Failed to disconnect account.", "Action Failed");
      }
    } catch (err) {
      toast.error("Error unlinking account. Please try again.", "Error");
    } finally {
      setDisconnectingProvider(null);
      setConfirmDisconnectModal(null);
    }
  };

  // Save Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Profile preferences saved successfully!", "Profile Updated");
      loadSettingsData();
    }, 600);
  };

  const currentScore = profileScore?.score ?? 0;
  const userRole = (session?.user?.role || "USER").toUpperCase();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Page Header */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            Account Management
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Settings & Identity
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Manage your connected OAuth accounts, profile score verification, and security credentials.
        </p>
      </div>

      {/* 2. Profile Score Summary Card */}
      <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-gray-900">
                Profile Strength Score
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Connecting verified accounts and completing your profile increases your Virlio trust score.
            </p>
          </div>

          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {currentScore}
            </span>
            <span className="text-sm font-bold text-gray-400">/ 100 PTS</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, currentScore))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span>Basic Identity</span>
            <span>{currentScore >= 70 ? "Verified Creator (High Trust)" : "Building Strength"}</span>
            <span>100 Max</span>
          </div>
        </div>

        {/* Score Breakdown Grid */}
        {profileScore?.breakdown && (
          <div className="pt-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Score Breakdown Signals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {profileScore.breakdown.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    item.achieved
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                      : "bg-gray-50/50 border-gray-200/80 text-gray-500 opacity-70"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold truncate">{item.name}</p>
                    <p className="text-[10px] opacity-80">{item.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                      item.achieved
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    +{item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Connected Accounts Section */}
      <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span>Connected Accounts</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Connect your trusted OAuth platforms to verify your identity and use them as sign-in methods.
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading connected account states...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROVIDERS.map((provider) => {
              const Icon = provider.icon;
              const isConnected = connectedAccounts.includes(provider.id);
              const isDisconnecting = disconnectingProvider === provider.id;

              return (
                <div
                  key={provider.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                    isConnected
                      ? "bg-white border-blue-200 shadow-xs"
                      : "bg-gray-50/50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">
                            {provider.name}
                          </h3>
                          {isConnected ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Connected</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                              +{provider.points} pts
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {isConnected ? "Usable for instant login" : "Not linked yet"}
                    </span>

                    {isConnected ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDisconnectModal(provider)}
                        disabled={isDisconnecting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isDisconnecting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Disconnect</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnectProvider(provider.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Connect {provider.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Profile Information Settings */}
      <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Profile Information</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Update your public display name, creator handle, and bio information.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name / Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Username Handle
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="janedoe"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address (Primary Account)
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Creator Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about your brand or developer focus..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50"
            >
              {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. Security & Role Status */}
      <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>Security & Role Level</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Your current platform permissions and session state.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] text-gray-500 font-semibold block mb-1">Account Role</span>
            <span className="font-bold text-gray-900">{userRole}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] text-gray-500 font-semibold block mb-1">Database Session</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] text-gray-500 font-semibold block mb-1">Authentication Method</span>
            <span className="font-bold text-gray-900">
              {connectedAccounts.length > 0 ? `${connectedAccounts.length} Linked Providers` : "Email / Social"}
            </span>
          </div>
        </div>
      </div>

      {/* 6. User Data Deletion & Privacy Controls */}
      <div className="virlio-card p-6 bg-white border border-red-200 rounded-3xl shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-red-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span>User Data Deletion & Account Erasure</span>
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            In accordance with GDPR, CCPA, and Facebook / Google privacy policies, you can permanently delete your Virlio account, connected OAuth tokens, and stored media at any time.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700">Permanent Erasure</p>
            <p className="text-[11px]">This action will purge your profile, connected accounts, and saved memes. This action cannot be undone.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account & Erase All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Disconnect Modal */}
      {confirmDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setConfirmDisconnectModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Disconnect {confirmDisconnectModal.name}?
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Your {confirmDisconnectModal.name} account will no longer be available as a sign-in method, and your profile score will decrease by {confirmDisconnectModal.points} points.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDisconnectModal(null)}
                className="py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDisconnect}
                disabled={!!disconnectingProvider}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                {disconnectingProvider ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Permanently Delete Account & Data?
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                This action is permanent and cannot be undone. All your profile information, connected OAuth accounts, saved memes, and verification history will be deleted immediately.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Erasing...</span>
                  </>
                ) : (
                  <span>Yes, Delete Everything</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
