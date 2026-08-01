"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

function DeprecatedCreateMemeRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      const brandId = searchParams.get("brandId");

      if (brandId) {
        router.replace(`/dashboard/brands/${brandId}/generate`);
        return;
      }

      try {
        const res = await fetch("/api/v1/brands?mode=my");
        if (res.ok) {
          const json = await res.json();
          const brands = json.data || [];
          if (brands.length > 0) {
            router.replace(`/dashboard/brands/${brands[0].id}/generate`);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }

      router.replace("/dashboard/brands");
    }

    redirect();
  }, [searchParams, router]);

  return (
    <div className="py-24 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span>Redirecting to Brand Meme Studio...</span>
    </div>
  );
}

export default function DeprecatedCreateMemePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span>Loading...</span>
        </div>
      }
    >
      <DeprecatedCreateMemeRedirect />
    </Suspense>
  );
}
