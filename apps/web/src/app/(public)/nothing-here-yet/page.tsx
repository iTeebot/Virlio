import React from "react";
import { Metadata } from "next";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ERROR_PAGES_CATALOG } from "@/components/errors/ErrorPagesCatalog";

export const metadata: Metadata = {
  title: "Nothing Here Yet | Virlio",
  description: "There's nothing to display right now. Check back later or explore the community.",
};

export default function NothingHereYetPage() {
  const config = ERROR_PAGES_CATALOG.nothingHereYet;

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
