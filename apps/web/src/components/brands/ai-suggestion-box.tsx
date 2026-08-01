"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, RefreshCw, Lightbulb } from "lucide-react";

interface AISuggestionBoxProps {
  step: number;
  field: string;
  currentValue: string;
  brandContext: Record<string, any>;
  onAccept: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
  className?: string;
  helperText?: string;
}

export function AISuggestionBox({
  step,
  field,
  currentValue,
  brandContext,
  onAccept,
  label,
  placeholder,
  multiline = false,
  rows = 3,
  type = "text",
  className = "",
  helperText,
}: AISuggestionBoxProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAISuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/brands/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, field, currentValue, brandContext }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setSuggestion(json.data.suggestion);
        setExplanation(json.data.explanation || null);
        const rawAlts = json.data.alternativeSuggestions;
        let altsArray: string[] = [];
        if (Array.isArray(rawAlts)) {
          altsArray = rawAlts.map((item) => (typeof item === "string" ? item : String(item)));
        } else if (typeof rawAlts === "string") {
          altsArray = rawAlts.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
        }
        setAlternatives(altsArray);
      } else {
        setError(json.message || "Failed to fetch AI suggestion");
      }
    } catch (err: any) {
      setError(err.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (valToAccept?: string) => {
    const val = valToAccept ?? suggestion;
    if (val) {
      onAccept(val);
      setSuggestion(null);
      setExplanation(null);
      setAlternatives([]);
    }
  };

  const handleReject = () => {
    setSuggestion(null);
    setExplanation(null);
    setAlternatives([]);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-semibold text-gray-800">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={fetchAISuggestion}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading
            ? "AI Thinking..."
            : currentValue && currentValue.trim().length > 0
            ? "Improve with AI"
            : "Generate with AI"}
        </button>
      </div>

      {/* Input or Textarea Field */}
      {multiline ? (
        <textarea
          rows={rows}
          value={currentValue}
          onChange={(e) => onAccept(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs"
        />
      ) : (
        <input
          type={type}
          value={currentValue}
          onChange={(e) => onAccept(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs"
        />
      )}

      {helperText && !suggestion && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}

      {/* AI Suggestion Card */}
      {suggestion !== null && (
        <div className="mt-2 p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
              <span>AI Suggested Improvement</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleAccept()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Accept
              </button>
              <button
                type="button"
                onClick={fetchAISuggestion}
                disabled={loading}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>

          <div className="p-3 bg-white border border-blue-100 rounded-lg text-sm text-gray-900 font-medium whitespace-pre-line shadow-xs">
            {suggestion}
          </div>

          {explanation && (
            <p className="text-xs text-blue-800 italic">
              Why AI recommends this: {explanation}
            </p>
          )}

          {Array.isArray(alternatives) && alternatives.length > 0 && (
            <div className="pt-2 border-t border-blue-100 space-y-1.5">
              <span className="text-xs font-semibold text-blue-900">Other Variations:</span>
              <div className="flex flex-wrap gap-1.5">
                {alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAccept(alt)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-blue-100/60 text-gray-800 rounded-lg border border-blue-200 transition-colors text-left font-medium"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
