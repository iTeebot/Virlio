"use client";

import React from "react";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ERROR_PAGES_CATALOG } from "@/components/errors/ErrorPagesCatalog";

export default function MaintenancePage() {
  const config = ERROR_PAGES_CATALOG.wellBeRightBack;

  return (
    <ErrorPageLayout
      imageSrc={config.imageSrc}
      imageAlt={config.imageAlt}
      title={config.title}
      description={config.description}
      httpStatus={config.httpStatus}
      primaryButtonText={config.primaryButtonText}
      onPrimaryClick={() => window.location.reload()}
      secondaryButtonText={config.secondaryButtonText}
      secondaryButtonHref={config.secondaryButtonHref}
      primaryButtonIconName={config.primaryButtonIconName}
      secondaryButtonIconName={config.secondaryButtonIconName}
    />
  );
}
