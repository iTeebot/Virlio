"use client";

import React from "react";
import { useAnimation } from "@/providers/animation-provider";
import { VirlioSplash } from "@/components/auth/virlio-splash";

export function SiteBackground() {
  const { animationsEnabled } = useAnimation();

  if (animationsEnabled) {
    return (
      <div className="fixed inset-0 z-[-1] w-screen h-screen overflow-hidden pointer-events-none">
        <VirlioSplash logoSrc="/favicon.ico" showCenterText={false} />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] w-screen h-screen overflow-hidden pointer-events-none bg-[url('/images/bg.png')] bg-repeat bg-top bg-white"
    />
  );
}

export default SiteBackground;
