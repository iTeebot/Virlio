"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert, Check, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUsername: string;
}

const REPORT_REASONS = [
  "Spam",
  "Impersonation",
  "Harassment",
  "Hate Speech",
  "Sexual Content",
  "Illegal Activity",
  "Scam",
  "Misleading Information",
  "Copyright",
  "Other",
];

export function ReportProfileModal({
  isOpen,
  onClose,
  targetUserId,
  targetUsername,
}: ReportProfileModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("Spam");
  const [details, setDetails] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: "user",
          entity_id: targetUserId,
          reason: selectedReason,
          details: details.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(`Report submitted for @${targetUsername}. Our moderation team will inspect this profile.`, "Report Submitted");
        onClose();
        setDetails("");
      } else {
        toast.error(json.error || "Failed to submit report. Please try again.", "Report Error");
      }
    } catch (err) {
      toast.error("Failed to submit report.", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-left relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Report Profile</h3>
            <p className="text-xs text-gray-500">
              Submit a report against creator profile @{targetUsername}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Reason for Report
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    selectedReason === r
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{r}</span>
                  {selectedReason === r && <Check className="w-3.5 h-3.5 text-red-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Additional Explanation (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific details or links explaining why this profile violates Virlio safety policies..."
              className="w-full p-3 text-xs rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
