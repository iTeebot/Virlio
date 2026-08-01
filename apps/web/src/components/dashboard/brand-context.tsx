"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface BrandContextType {
  currentBrand: any;
  userBrands: any[];
  loading: boolean;
  switchBrand: (targetBrandId: string) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({
  initialBrand,
  initialUserBrands,
  children,
}: {
  initialBrand: any;
  initialUserBrands: any[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentBrand, setCurrentBrand] = useState(initialBrand);
  const [userBrands, setUserBrands] = useState(initialUserBrands);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentBrand(initialBrand);
  }, [initialBrand]);

  useEffect(() => {
    setUserBrands(initialUserBrands);
  }, [initialUserBrands]);

  const switchBrand = (targetBrandId: string) => {
    if (!targetBrandId || targetBrandId === currentBrand?.id) return;

    // Preserve sub-route section if possible (e.g. /statistics -> /statistics)
    const parts = pathname.split("/");
    const brandIdIndex = parts.indexOf("brands");
    let currentSection = "overview";

    if (brandIdIndex !== -1 && parts[brandIdIndex + 2]) {
      currentSection = parts[brandIdIndex + 2];
    }

    setLoading(true);
    router.push(`/dashboard/brands/${targetBrandId}/${currentSection}`);
  };

  return (
    <BrandContext.Provider
      value={{
        currentBrand,
        userBrands,
        loading,
        switchBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    return {
      currentBrand: null,
      userBrands: [],
      loading: false,
      switchBrand: () => {},
    };
  }
  return context;
}
