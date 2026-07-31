import React from "react";
import { Metadata } from "next";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ERROR_PAGES_CATALOG } from "@/components/errors/ErrorPagesCatalog";

export const metadata: Metadata = {
  title: "Access Restricted (403) | Virlio",
  description: "You don't have permission to access this page.",
  robots: { index: false, follow: false },
};

export default function AccessRestrictedPage() {
  const config = ERROR_PAGES_CATALOG.accessRestricted;

  return (
    <ErrorPageLayout
      imageSrc={config.imageSrc}
      imageAlt={config.imageAlt}
      title={config.title}
      description={config.description}
      httpStatus={config.httpStatus}
      primaryButtonText={config.primaryButtonText}
      primaryButtonHref={config.primaryButtonHref}
      secondaryButtonText={config.secondaryButtonText}
      secondaryButtonHref={config.secondaryButtonHref}
      primaryButtonIconName={config.primaryButtonIconName}
      secondaryButtonIconName={config.secondaryButtonIconName}
    />
  );
}
