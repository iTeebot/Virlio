"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBrand } from "@/components/dashboard/brand-context";
import { toast } from "@/components/ui/toast";
import {
  Share2,
  Plus,
  CheckCircle2,
  Lock,
  ExternalLink,
  Trash2,
  Globe,
  Loader2,
  ShieldCheck,
  Zap,
  RefreshCw,
  LogOut,
  Users,
  Check,
  AlertCircle,
} from "lucide-react";

interface SocialConnection {
  id: string;
  brand_id: string;
  platform: string;
  account_id: string;
  page_id: string;
  page_name: string;
  page_image_url: string;
  is_active: boolean;
  created_at: string;
}

interface DiscoveredPage {
  id: string;
  name: string;
  picture?: string;
  category?: string;
  followers_count?: number;
  is_verified?: boolean;
  perms?: string[];
  raw_token: string;
}

const ALL_PLATFORMS = [
  { id: "facebook", name: "Facebook Page", category: "Social", implemented: true, icon: Share2, desc: "Connect Facebook Pages managed via official Meta OAuth." },
  { id: "instagram", name: "Instagram Business", category: "Social", implemented: false, desc: "Post carousels and reels to your brand Instagram profile." },
  { id: "threads", name: "Threads", category: "Social", implemented: false, desc: "Broadcast brand memes to Threads feed." },
  { id: "linkedin", name: "LinkedIn Company Page", category: "Social", implemented: false, desc: "Share professional branded memes on LinkedIn." },
  { id: "x", name: "X (Twitter)", category: "Social", implemented: false, desc: "Auto-tweet memes with hashtags & media attachments." },
  { id: "tiktok", name: "TikTok", category: "Social", implemented: false, desc: "Publish video and image memes to TikTok." },
  { id: "pinterest", name: "Pinterest Pins", category: "Social", implemented: false, desc: "Pin high resolution meme graphics to brand boards." },
  { id: "youtube", name: "YouTube Community", category: "Social", implemented: false, desc: "Share meme image posts to YouTube Community tab." },
  { id: "reddit", name: "Reddit Subreddit", category: "Social", implemented: false, desc: "Post memes to targeted subreddits automatically." },
  { id: "medium", name: "Medium Publication", category: "Publishing", implemented: false, desc: "Publish SEO articles generated from memes." },
  { id: "devto", name: "Dev.to", category: "Publishing", implemented: false, desc: "Cross-post developer memes & tech articles." },
  { id: "producthunt", name: "Product Hunt", category: "Publishing", implemented: false, desc: "Promote brand launches and meme campaigns." },
  { id: "googlebiz", name: "Google Business Profile", category: "Business", implemented: false, desc: "Share local offer memes on Google Business." },
  { id: "tumblr", name: "Tumblr Blog", category: "Social", implemented: false, desc: "Reblog memes to brand Tumblr." },
  { id: "bluesky", name: "Bluesky Feed", category: "Social", implemented: false, desc: "Post to decentralized Bluesky network." },
  { id: "mastodon", name: "Mastodon", category: "Social", implemented: false, desc: "Toot memes to your brand server." },
  { id: "discord", name: "Discord Server", category: "Messaging", implemented: false, desc: "Post meme announcements into Discord channels." },
  { id: "slack", name: "Slack Channel", category: "Messaging", implemented: false, desc: "Send brand memes to team Slack workspace." },
  { id: "telegram", name: "Telegram Channel", category: "Messaging", implemented: false, desc: "Broadcast memes to subscribers on Telegram." },
  { id: "wordpress", name: "WordPress Site", category: "Publishing", implemented: false, desc: "Draft and post articles directly to WordPress blog." },
  { id: "ghost", name: "Ghost CMS", category: "Publishing", implemented: false, desc: "Publish newsletters and posts to Ghost." },
  { id: "shopify", name: "Shopify Blog", category: "Publishing", implemented: false, desc: "Post e-commerce marketing memes to Shopify blog." },
];

export default function SocialConnectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentBrand } = useBrand();

  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Page Selection Modal State (Discovered Facebook Pages)
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredPage[]>([]);
  const [loadingDiscovered, setLoadingDiscovered] = useState(false);
  const [connectingPageId, setConnectingPageId] = useState<string | null>(null);

  const fetchConnections = async () => {
    if (!currentBrand?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/socials`);
      if (res.ok) {
        const json = await res.json();
        setConnections(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch social connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoveredPages = async () => {
    if (!currentBrand?.id) return;
    try {
      setLoadingDiscovered(true);
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/socials/facebook/discovered`);
      if (res.ok) {
        const json = await res.json();
        setDiscoveredPages(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch discovered pages:", err);
    } finally {
      setLoadingDiscovered(false);
    }
  };

  useEffect(() => {
    fetchConnections();

    // If returning from Meta OAuth flow with ?facebook_select=1
    if (searchParams.get("facebook_select") === "1") {
      setShowPageSelector(true);
      fetchDiscoveredPages();
    }
  }, [currentBrand?.id, searchParams]);

  if (!currentBrand) return null;

  // Initiate Meta OAuth Login Flow
  const handleConnectFacebookOAuth = () => {
    toast.info("Redirecting to Meta OAuth 2.0 Login...", "Meta Authentication");
    window.location.href = `/api/v1/auth/facebook/connect?brandId=${currentBrand.id}`;
  };

  // Connect Selected Discovered Facebook Page
  const handleConnectSelectedPage = async (page: DiscoveredPage) => {
    setConnectingPageId(page.id);
    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/socials/facebook/connect-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_id: page.id,
          page_name: page.name,
          page_image_url: page.picture,
          access_token: page.raw_token,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Connected Facebook Page "${page.name}"!`, "Meta Integration");
        await fetchConnections();
      } else {
        toast.error(json.error || "Failed to connect Facebook Page", "Error");
      }
    } catch {
      toast.error("Network error connecting Facebook Page", "Error");
    } finally {
      setConnectingPageId(null);
    }
  };

  // Disconnect Page Connection
  const handleDisconnect = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this Facebook Page connection? (Publishing history will remain intact)")) return;

    setDisconnectingId(connectionId);
    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/socials/${connectionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        toast.success("Disconnected Facebook Page", "Social Connection");
      }
    } catch {
      toast.error("Failed to disconnect social connection", "Error");
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 uppercase tracking-wider">
            Brand Integrations
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
          <Share2 className="w-7 h-7 text-blue-600" />
          Social Connections
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Authenticate with official Meta OAuth 2.0 to manage connected Facebook Pages and automate multi-channel publishing.
        </p>
      </div>

      {/* CONNECTED ACCOUNTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Connected Accounts ({connections.length})
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPageSelector(true);
                fetchDiscoveredPages();
              }}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl cursor-pointer shadow-2xs"
            >
              Select Discovered Pages
            </button>

            <button
              type="button"
              onClick={handleConnectFacebookOAuth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Facebook (Meta OAuth)</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 bg-white border border-gray-200 rounded-3xl text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500">Loading connected accounts...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-blue-950">No Facebook Pages Connected</h3>
                <p className="text-[11px] text-blue-700">
                  Click below to authenticate with official Meta OAuth 2.0 and select managed Facebook Pages for {currentBrand.name}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConnectFacebookOAuth}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Login with Facebook</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={conn.page_image_url || "/images/placeholders/brand-avatar.png"}
                      alt={conn.page_name}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{conn.page_name}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold uppercase">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono truncate">Page ID: {conn.page_id}</p>
                    </div>
                  </div>

                  <a
                    href={`https://facebook.com/${conn.page_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="View Facebook Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="text-[10px]">Connected {new Date(conn.created_at).toLocaleDateString()}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConnectFacebookOAuth}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Reconnect Facebook OAuth"
                    >
                      <RefreshCw className="w-3 h-3" /> Reconnect
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(conn.id)}
                      disabled={disconnectingId === conn.id}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      title="Disconnect Page"
                    >
                      <LogOut className="w-3 h-3" /> Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DISCOVERED FACEBOOK PAGES SELECTOR MODAL */}
      {showPageSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  Select Managed Facebook Pages
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Discovered Pages managed by your authenticated Meta Facebook account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPageSelector(false)}
                className="text-gray-400 hover:text-gray-900 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingDiscovered ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">Discovering managed Facebook Pages...</p>
              </div>
            ) : discoveredPages.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No managed Facebook Pages found for this account.</p>
                <button
                  type="button"
                  onClick={handleConnectFacebookOAuth}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Authenticate another Facebook Account
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {discoveredPages.map((page) => {
                  const isConnected = connections.some((c) => c.page_id === page.id);
                  const isConnecting = connectingPageId === page.id;

                  return (
                    <div
                      key={page.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={page.picture || "/images/placeholders/brand-avatar.png"}
                          alt={page.name}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{page.name}</h4>
                            {page.is_verified && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-extrabold uppercase">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold mt-0.5">
                            <span>{page.category}</span>
                            <span>•</span>
                            <span>{page.followers_count?.toLocaleString()} Followers</span>
                          </div>
                        </div>
                      </div>

                      {isConnected ? (
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" /> Connected
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isConnecting}
                          onClick={() => handleConnectSelectedPage(page)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                        >
                          {isConnecting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Connect Page</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleConnectFacebookOAuth}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-authenticate with Meta OAuth
              </button>

              <button
                type="button"
                onClick={() => setShowPageSelector(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORTED PLATFORMS GRID */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
          Available Social Platforms
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_PLATFORMS.map((platform) => {
            const Icon = platform.icon || Globe;
            const isConnected = connections.some((c) => c.platform === platform.id);

            return (
              <div
                key={platform.id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3 transition-all ${
                  platform.implemented
                    ? "border-blue-200 hover:border-blue-400"
                    : "border-gray-200 opacity-75"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          platform.implemented ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900">{platform.name}</h3>
                        <span className="text-[10px] text-gray-400 font-semibold">{platform.category}</span>
                      </div>
                    </div>

                    {platform.implemented ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold uppercase">
                        Meta OAuth
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-extrabold uppercase flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Soon
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">{platform.desc}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  {platform.implemented ? (
                    isConnected ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected via Meta OAuth
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectFacebookOAuth}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Login with Facebook</span>
                      </button>
                    )
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Available in a future Virlio release</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
