"use client";

import React, { useState } from "react";
import { useAnimation } from "@/providers/animation-provider";
import { toast } from "@/components/ui/toast";
import { Sparkles, EyeOff, Sliders, Check } from "lucide-react";

export function AccessibilityFloatingToggle() {
  const { animationsEnabled, toggleAnimations } = useAnimation();
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    const nextState = !animationsEnabled;
    toggleAnimations();
    if (nextState) {
      toast.info("Animated background tiles enabled.", "Background Motion");
    } else {
      toast.info("Motion disabled. Static background active.", "Background Motion");
    }
  };

  return (
    <div className="fixed bottom-4 right-20 z-[9990] flex flex-col items-end pointer-events-auto select-none">
      {/* Expanded Popover */}
      {open && (
        <div className="mb-2 p-3 rounded-2xl bg-white border border-gray-200 shadow-xl max-w-xs w-64 text-left animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Accessibility</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-gray-400 hover:text-gray-600 font-semibold"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-3 leading-snug">
            Toggle background animation mode across the entire application.
          </p>

          <button
            type="button"
            onClick={handleToggle}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
              animationsEnabled
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {animationsEnabled ? (
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              ) : (
                <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <div className="flex flex-col text-left">
                <span>{animationsEnabled ? "Animated Tiles" : "Static Background"}</span>
                <span className="text-[10px] font-normal opacity-80">
                  {animationsEnabled ? "Interactive motion" : "Static texture background"}
                </span>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${animationsEnabled ? "bg-blue-600 text-white" : "bg-amber-600 text-white"}`}>
              <Check className="w-3 h-3" />
            </div>
          </button>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-800 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-all"
        title="Accessibility Settings: Background Motion"
        aria-label="Toggle background motion accessibility setting"
      >
        {animationsEnabled ? (
          <>
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">Motion ON</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Static Bg Active</span>
          </>
        )}
      </button>
    </div>
  );
}

export default AccessibilityFloatingToggle;
