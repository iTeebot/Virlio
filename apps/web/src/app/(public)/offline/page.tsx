"use client";

import React from "react";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ERROR_PAGES_CATALOG } from "@/components/errors/ErrorPagesCatalog";

export default function OfflinePage() {
  const config = ERROR_PAGES_CATALOG.youAreOffline;

  return (
    <ErrorPageLayout
      imageSrc={config.imageSrc}
      imageAlt={config.imageAlt}
      title={config.title}
      description={config.description}
      statusBadgeText={config.statusBadgeText}
      primaryButtonText={config.primaryButtonText}
      onPrimaryClick={() => window.location.reload()}
      secondaryButtonText={config.secondaryButtonText}
      secondaryButtonHref={config.secondaryButtonHref}
      primaryButtonIconName={config.primaryButtonIconName}
      secondaryButtonIconName={config.secondaryButtonIconName}
    />
  );
}
