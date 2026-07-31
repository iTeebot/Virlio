"use client";

import { RefreshCw, AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600 shadow-sm">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Application Exception
        </h1>

        <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
          A critical system error occurred. Please refresh the page to restore application state.
        </p>

        {error?.digest && (
          <p className="text-[11px] font-mono text-gray-400 mb-6 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            Error Digest: {error.digest}
          </p>
        )}

        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Application</span>
        </button>
      </body>
    </html>
  );
}
