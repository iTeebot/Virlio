"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AnimationContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

const STORAGE_KEY = "virlio_animations_enabled";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage preference
    const savedPreference = localStorage.getItem(STORAGE_KEY);
    if (savedPreference !== null) {
      setAnimationsEnabledState(savedPreference === "true");
    } else {
      // Check system prefers-reduced-motion preference
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setAnimationsEnabledState(!prefersReduced);
    }
  }, []);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    setAnimationsEnabledState(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  }, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabledState((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        animationsEnabled: mounted ? animationsEnabled : true,
        toggleAnimations,
        setAnimationsEnabled,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
}

export default AnimationProvider;
