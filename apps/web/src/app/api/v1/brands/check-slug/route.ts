import { NextResponse } from "next/server";
import { db } from "@virlio/database";
import { brands } from "@virlio/database/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug || !slug.trim()) {
      return NextResponse.json({ available: false, message: "Slug is required" }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase();

    // Validate format: only lowercase letters, numbers, and hyphens
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      return NextResponse.json({
        available: false,
        message: "Slug can only contain lowercase letters, numbers, and hyphens.",
      });
    }

    if (cleanSlug.length < 2) {
      return NextResponse.json({ available: false, message: "Slug must be at least 2 characters long." });
    }

    // Check if slug exists in database
    const existing = await db.query.brands.findFirst({
      where: eq(brands.slug, cleanSlug),
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        message: `@${cleanSlug} is already taken by another brand.`,
      });
    }

    return NextResponse.json({ available: true, message: `@${cleanSlug} is available!` });
  } catch (error: any) {
    console.error("Check slug error:", error);
    return NextResponse.json({ available: false, message: "Server error checking slug availability" }, { status: 500 });
  }
}
