"use client";

import React, { useState } from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Server,
  Code,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { WebsiteVerificationResult } from "@/lib/services/website-verification.service";

interface WebsiteVerificationWidgetProps {
  websiteUrl: string;
  onWebsiteChange?: (url: string) => void;
  onVerificationUpdate?: (result: Partial<WebsiteVerificationResult>) => void;
  initialVerified?: boolean;
  initialToken?: string;
}

export function WebsiteVerificationWidget({
  websiteUrl,
  onWebsiteChange,
  onVerificationUpdate,
  initialVerified = false,
  initialToken = "",
}: WebsiteVerificationWidgetProps) {
  const [method, setMethod] = useState<"dns_txt" | "html_meta">("dns_txt");
  const [verifying, setVerifying] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [localUrl, setLocalUrl] = useState(websiteUrl || "");

  // Keep local URL synced with incoming props if changed upstream
  React.useEffect(() => {
    if (websiteUrl !== undefined && websiteUrl !== localUrl) {
      setLocalUrl(websiteUrl);
    }
  }, [websiteUrl]);

  const [result, setResult] = useState<WebsiteVerificationResult | null>(() => {
    if (initialVerified || initialToken) {
      return {
        verified: initialVerified,
        method: "dns_txt",
        verifiedAt: new Date().toISOString(),
        domain: (websiteUrl || "").replace(/^https?:\/\//i, "").replace(/\/.*$/, ""),
        token: initialToken || "",
        provider: { name: "DNS Host", instructions: [] },
      };
    }
    return null;
  });

  const handleRunVerification = async () => {
    const targetUrl = (localUrl || websiteUrl || "").trim();
    if (!targetUrl) return;
    setVerifying(true);

    try {
      const res = await fetch("/api/v1/brands/verify-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: targetUrl }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setResult(json.data);
        if (onVerificationUpdate) {
          onVerificationUpdate(json.data);
        }
      } else {
        setResult({
          verified: false,
          method: null,
          verifiedAt: null,
          domain: targetUrl,
          token: "",
          provider: { name: "DNS Host", instructions: [] },
          error: json.message || "Failed to check website verification.",
        });
      }
    } catch (err: any) {
      setResult({
        verified: false,
        method: null,
        verifiedAt: null,
        domain: targetUrl,
        token: "",
        provider: { name: "DNS Host", instructions: [] },
        error: "Network error checking verification status.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const isVerified = result?.verified;
  const currentUrlValue = localUrl;

  return (
    <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
          <h3 className="text-sm font-bold text-gray-900">Website Ownership Verification</h3>
        </div>

        {/* Status Badge */}
        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
          </span>
        ) : result?.error ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Verification Pending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            Not Verified
          </span>
        )}
      </div>

      {/* Website Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Official Website URL</label>
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <input
            type="url"
            value={currentUrlValue}
            onChange={(e) => {
              const val = e.target.value;
              setLocalUrl(val);
              if (onWebsiteChange) onWebsiteChange(val);
              setResult(null);
            }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://yourbrand.com"
            className="flex-1 w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
          />
          <button
            type="button"
            onClick={handleRunVerification}
            disabled={verifying || !currentUrlValue.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} />
            {verifying ? "Checking..." : isVerified ? "Verify Again" : "Start Verification"}
          </button>
        </div>
      </div>

      {/* Verified Success Box */}
      {isVerified && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Website Ownership Confirmed!</h4>
              <p className="text-xs text-emerald-800">
                Verified domain: <code className="font-bold">{result?.domain}</code> via{" "}
                {result?.method === "dns_txt" ? "DNS TXT Record" : "HTML Meta Tag"}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRunVerification}
            disabled={verifying}
            className="px-3 py-1.5 text-xs font-semibold bg-white text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shrink-0 shadow-xs"
          >
            Verify Again
          </button>
        </div>
      )}

      {/* Verification Instructions Panel (When unverified or in progress) */}
      {!isVerified && websiteUrl.trim().length > 3 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
          {/* Method Tabs */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800">Choose Verification Method:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMethod("dns_txt")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  method === "dns_txt" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Server className="w-3.5 h-3.5" /> DNS TXT Record (Primary)
              </button>
              <button
                type="button"
                onClick={() => setMethod("html_meta")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  method === "html_meta" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Code className="w-3.5 h-3.5" /> HTML Meta Tag (Fallback)
              </button>
            </div>
          </div>

          {/* DNS TXT Method Instructions & Provider Guidance */}
          {method === "dns_txt" ? (
            <div className="space-y-3 pt-1">
              {result?.provider?.name && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs">
                  <span className="font-bold text-blue-900">Detected DNS Provider: {result.provider.name}</span>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-blue-800">
                    {result.provider.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-500 block">Record Type:</span>
                  <span className="font-bold text-gray-900">TXT</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Host / Name:</span>
                  <span className="font-bold text-gray-900">@ (or root)</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Value / Content:</span>
                  <span className="font-bold text-blue-700 truncate">
                    {result?.token ? "virlio-site-verification=..." : "Pending generation"}
                  </span>
                </div>
              </div>

              {result?.token && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`virlio-site-verification=${result.token}`}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 font-mono text-gray-800 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`virlio-site-verification=${result.token}`)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-xs"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedToken ? "Copied!" : "Copy Value"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* HTML Meta Tag Method Instructions */
            <div className="space-y-3 pt-1 text-xs">
              <p className="text-gray-600">
                Copy and paste the following HTML meta tag into the <code className="bg-white px-1 py-0.5 rounded border border-gray-200 font-bold">&lt;head&gt;</code> section of your website homepage:
              </p>

              {result?.token && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`<meta name="virlio-site-verification" content="${result.token}" />`}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 font-mono text-gray-800 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`<meta name="virlio-site-verification" content="${result.token}" />`)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-xs"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedToken ? "Copied!" : "Copy Tag"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium">
              After setting up DNS TXT or Meta Tag, click Verify Again.
            </span>
            <button
              type="button"
              onClick={handleRunVerification}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} />
              {verifying ? "Checking..." : "Verify Again"}
            </button>
          </div>

          {result?.error && (
            <p className="text-xs text-amber-800 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              {result.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
