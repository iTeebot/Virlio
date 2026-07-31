import React from "react";
import { Metadata } from "next";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ERROR_PAGES_CATALOG } from "@/components/errors/ErrorPagesCatalog";

export const metadata: Metadata = {
  title: "404 Page Not Found | Virlio",
  description: "The page you're looking for doesn't exist or may have been moved.",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  const config = ERROR_PAGES_CATALOG.notFound;

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
      primaryButtonIconName={config.primaryButtonIconName}
      secondaryButtonIconName={config.secondaryButtonIconName}
    />
  );
}
