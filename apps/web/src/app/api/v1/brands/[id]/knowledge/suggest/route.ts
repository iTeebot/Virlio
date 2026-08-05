import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { z } from "zod";

export const dynamic = "force-dynamic";

const suggestSchema = z.object({
  section: z.string().min(1),
  currentValue: z.any().optional(),
});

async function callLLMForSection(prompt: string): Promise<any> {
  const providers = [
    {
      name: "groq",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      jsonMode: true,
    },
    {
      name: "openrouter",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      model: "google/gemini-2.5-flash",
      apiKey: process.env.OPENROUTER_API_KEY,
      jsonMode: false,
    },
    {
      name: "mistral",
      endpoint: "https://api.mistral.ai/v1/chat/completions",
      model: "mistral-large-latest",
      apiKey: process.env.MISTRAL_API_KEY,
      jsonMode: true,
    },
  ];

  for (const p of providers) {
    if (!p.apiKey) continue;
    try {
      const payload: Record<string, any> = {
        model: p.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 512,
      };
      if (p.jsonMode) payload.response_format = { type: "json_object" };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      let res: Response;
      try {
        res = await fetch(p.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${p.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) continue;
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      if (!content) continue;

      let jsonStr = content.trim();
      const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fence?.[1]) jsonStr = fence[1].trim();
      if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[")) {
        const m = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (m) jsonStr = m[0];
      }
      return JSON.parse(jsonStr);
    } catch {
      continue;
    }
  }

  throw new Error("AI provider unavailable for suggestion");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { section, currentValue } = suggestSchema.parse(body);

    const { db } = await import("@virlio/database");
    const { brands } = await import("@virlio/database/schema");
    const { eq } = await import("drizzle-orm");

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });

    if (!brand) return apiError("Brand not found", 404);

    const prompt = `You are Virlio's AI Brand Strategist.
Brand Name: "${brand.name}"
Industry: "${brand.industry || "General"}"
Section to refine: "${section}"
Current Input: ${JSON.stringify(currentValue || {})}

Task: Provide a refined, highly professional and creative AI suggestion for this section.

Return ONLY valid JSON (no markdown):
{ "suggestion": ${typeof currentValue === "string" ? '"<refined text>"' : Array.isArray(currentValue) ? '["item1", "item2"]' : '{"key": "value"}'} }`;

    const result = await callLLMForSection(prompt);
    return apiSuccess(result);
  } catch (error: any) {
    return apiError(error.message || "Failed to generate AI suggestion", 500);
  }
}
