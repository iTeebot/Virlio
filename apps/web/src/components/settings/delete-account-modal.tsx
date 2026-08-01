"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import { Trash2, X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (confirmText.trim() !== "DELETE") {
      setError("Please type 'DELETE' exactly to confirm account deletion.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/users/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User triggered self account deletion in settings" }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Account deleted successfully.", "Goodbye");
        await signOut({ callbackUrl: "/login?deleted=true" });
      } else {
        const errMsg = json.error || json.message || "Failed to delete account.";
        setError(errMsg);
        toast.error(errMsg, "Deletion Failed");
      }
    } catch (err: any) {
      const msg = err.message || "Network error deleting account.";
      setError(msg);
      toast.error(msg, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Your Virlio Account</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review what will be permanently removed vs retained.
            </p>
          </div>
        </div>

        {/* Removed vs Retained Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-2xl space-y-1.5">
            <span className="font-bold text-red-700 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Trash2 className="w-3.5 h-3.5" /> What will be removed
            </span>
            <ul className="text-red-900 space-y-1 text-[11px] leading-tight">
              <li>• Profile & username</li>
              <li>• Brand workspaces</li>
              <li>• Private memes & drafts</li>
              <li>• Active sessions & OAuth links</li>
              <li>• Streak & follower history</li>
            </ul>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> What will be retained
            </span>
            <ul className="text-emerald-900 space-y-1 text-[11px] leading-tight">
              <li>• Approved public templates</li>
              <li>• Templates anonymized as &quot;Deleted User&quot;</li>
              <li>• Community upvote counts</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleConfirmDelete} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Type <strong className="text-red-600 font-mono">DELETE</strong> below to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold font-mono text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || confirmText.trim() !== "DELETE"}
              className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm Deletion</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
