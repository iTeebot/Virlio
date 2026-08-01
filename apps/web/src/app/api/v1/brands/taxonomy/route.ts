import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";
import { db } from "@virlio/database";
import { brandTaxonomies } from "@virlio/database/schema";
import { validateSafetyAndProfanity, normalizeTitleCase } from "@/lib/validations/safety-filter";
import { eq, and, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json({ message: "Category parameter is required" }, { status: 400 });
    }

    // Return both approved entries and entries suggested by user/moderator
    const entries = await db.query.brandTaxonomies.findMany({
      where: and(
        eq(brandTaxonomies.category, category),
        or(eq(brandTaxonomies.status, "approved"), eq(brandTaxonomies.status, "pending"))
      ),
      orderBy: (bt, { desc }) => [desc(bt.created_at)],
    });

    return NextResponse.json({ data: entries });
  } catch (error: any) {
    console.error("GET taxonomy error:", error);
    return NextResponse.json({ message: "Failed to fetch taxonomy entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, parent_value, name } = body;

    if (!category || !name) {
      return NextResponse.json({ message: "Category and name are required" }, { status: 400 });
    }

    // Safety & Profanity Check via Centralized Filter
    const safetyCheck = validateSafetyAndProfanity(name);
    if (!safetyCheck.isValid) {
      return NextResponse.json({ message: safetyCheck.reason || "Invalid custom taxonomy entry." }, { status: 400 });
    }

    const normalizedName = normalizeTitleCase(name);
    const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    // Check duplicate taxonomy entries
    const existing = await db.query.brandTaxonomies.findFirst({
      where: and(
        eq(brandTaxonomies.category, category),
        eq(brandTaxonomies.slug, slug)
      ),
    });

    if (existing) {
      return NextResponse.json({
        data: { name: existing.name, status: existing.status },
        message: "Taxonomy entry already exists.",
      });
    }

    // Insert pending taxonomy entry for admin/AI moderation
    const inserted = await db
      .insert(brandTaxonomies)
      .values({
        category,
        parent_value: parent_value || null,
        name: normalizedName,
        slug,
        status: "pending",
        suggested_by: user.id,
      })
      .returning();

    return NextResponse.json({
      data: {
        id: inserted[0].id,
        name: inserted[0].name,
        status: inserted[0].status,
      },
      message: "Custom taxonomy submitted for review.",
    });
  } catch (error: any) {
    console.error("Taxonomy API error:", error);
    return NextResponse.json({ message: error.message || "Failed to submit custom taxonomy" }, { status: 500 });
  }
}
