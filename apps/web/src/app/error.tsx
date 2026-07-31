"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertOctagon } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception diagnostics safely without exposing sensitive client material
    if (process.env.NODE_ENV === "development") {
      console.error("Next.js App Error Boundary caught:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600 shadow-xs">
        <AlertOctagon className="w-7 h-7" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
        Something went wrong!
      </h1>

      <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
        We encountered an unexpected error while processing your request. Please try refreshing or return to the home page.
      </p>

      {error?.digest && (
        <p className="text-[11px] font-mono text-gray-400 mb-6 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
          Reference ID: {error.digest}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-colors"
        >
          <Home className="w-4 h-4 text-gray-500" />
          <span>Go to Home</span>
        </Link>
      </div>
    </div>
  );
}
