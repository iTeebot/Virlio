"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy /dashboard/generator route redirection.
 * Replaced by Virlio Template -> Brand -> Meme product model:
 * - Templates are created by Users (/dashboard/templates)
 * - Memes are created by Verified Brands (/dashboard/memes/create)
 */
export default function LegacyGeneratorRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirectContextually() {
      try {
        const res = await fetch("/api/v1/brands");
        if (res.ok) {
          const json = await res.json();
          const brands = json.data || [];
          const hasVerifiedBrand = brands.some(
            (b: any) => b.verification_status?.toLowerCase() === "verified"
          );

          if (hasVerifiedBrand) {
            router.replace("/dashboard/memes/create");
          } else {
            router.replace("/dashboard/templates");
          }
        } else {
          router.replace("/dashboard/templates");
        }
      } catch (err) {
        router.replace("/dashboard/templates");
      }
    }

    redirectContextually();
  }, [router]);

  return (
    <div className="py-16 text-center text-xs text-gray-500 font-medium">
      Redirecting to Virlio creation workspace...
    </div>
  );
}
