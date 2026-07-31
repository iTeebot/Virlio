import React from "react";
import { Metadata } from "next";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ERROR_PAGES_CATALOG } from "@/components/errors/ErrorPagesCatalog";

export const metadata: Metadata = {
  title: "Content Removed | Virlio",
  description: "This content is no longer available because it violated our community guidelines or was removed by its owner.",
  robots: { index: false, follow: false },
};

export default function ContentRemovedPage() {
  const config = ERROR_PAGES_CATALOG.contentRemoved;

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
