import React from "react";
import { redirect, notFound } from "next/navigation";
import { authService, brandService } from "@/server/services";
import { BrandLayoutClient } from "./brand-layout-client";

export default async function BrandLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const session = await authService.getCurrentSession();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch active brand and user's brand list
  const userBrands = await brandService.getByOwner(session.user.id);
  const currentBrand = userBrands.find((b: any) => b.id === id || b.slug === id);

  if (!currentBrand) {
    notFound();
  }

  return (
    <BrandLayoutClient
      currentBrand={currentBrand}
      userBrands={userBrands}
      user={session.user}
    >
      {children}
    </BrandLayoutClient>
  );
}
