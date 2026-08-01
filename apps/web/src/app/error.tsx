"use client";

import { useEffect } from "react";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception diagnostics safely in development
    if (process.env.NODE_ENV === "development") {
      console.error("Next.js App Error Boundary caught:", error);
    }
  }, [error]);

  return (
    <ErrorPageLayout
      imageSrc="/images/errors/something_went_wrong.png"
      imageAlt="Something Went Wrong Illustration"
      title="Something Went Wrong"
      description="We encountered an unexpected error while processing your request. Please try refreshing or return to the home page."
      httpStatus={500}
      primaryButtonText="Try Again"
      onPrimaryClick={() => reset()}
      primaryButtonIconName="refresh"
      secondaryButtonText="Return to Home"
      secondaryButtonHref="/"
      secondaryButtonIconName="home"
    />
  );
}
