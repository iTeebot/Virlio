import React from "react";
import { Metadata } from "next";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ERROR_PAGES_CATALOG } from "@/components/errors/ErrorPagesCatalog";

export const metadata: Metadata = {
  title: "Achievements Await | Virlio",
  description: "You haven't unlocked any achievements yet. Keep contributing to earn badges and recognition.",
};

export default function AchievementsAwaitPage() {
  const config = ERROR_PAGES_CATALOG.achievementsAwait;

  return (
    <ErrorPageLayout
      imageSrc={config.imageSrc}
      imageAlt={config.imageAlt}
      title={config.title}
      description={config.description}
      statusBadgeText={config.statusBadgeText}
      primaryButtonText={config.primaryButtonText}
      primaryButtonHref={config.primaryButtonHref}
      secondaryButtonText={config.secondaryButtonText}
      secondaryButtonHref={config.secondaryButtonHref}
      primaryButtonIconName={config.primaryButtonIconName}
      secondaryButtonIconName={config.secondaryButtonIconName}
    />
  );
}
