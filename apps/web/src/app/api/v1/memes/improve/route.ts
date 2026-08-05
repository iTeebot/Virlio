import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { z } from "zod";

export const dynamic = "force-dynamic";

const improveMemeSchema = z.object({
  id: z.string().uuid(),
  field: z.enum(["title", "description", "hashtags"]).optional(),
  currentValue: z.string().optional(),
});

const improveOutputSchema = z.object({
  title: z.string().max(100),
  description: z.string().max(300),
  hashtags: z.array(z.string().max(50)).max(25).default([]),
});

/**
 * Direct LLM call that bypasses the meme-generation provider (which enforces
 * a `{ memes: [] }` schema). This endpoint asks the AI for a simpler
 * { title, description, hashtags } suggestion object.
 */
async function callLLMForImprovement(prompt: string): Promise<{
  title: string;
  description: string;
  hashtags: string[];
}> {
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

  const errors: string[] = [];

  for (const p of providers) {
    if (!p.apiKey) {
      errors.push(`${p.name}: missing API key`);
      continue;
    }

    try {
      const payload: Record<string, any> = {
        model: p.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.75,
        max_tokens: 512,
      };
      if (p.jsonMode) payload.response_format = { type: "json_object" };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
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

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 150)}`);
      }

      const data = await res.json();
      const content: string = data.choices?.[0]?.message?.content ?? "";
      if (!content) throw new Error("Empty response");

      // Extract JSON — handle markdown fences
      let jsonStr = content.trim();
      const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fence?.[1]) jsonStr = fence[1].trim();
      if (!jsonStr.startsWith("{")) {
        const m = jsonStr.match(/\{[\s\S]*\}/);
        if (!m) throw new Error("No JSON object found in response");
        jsonStr = m[0];
      }

      const raw = JSON.parse(jsonStr);
      const validated = improveOutputSchema.parse(raw);
      return validated;
    } catch (err: any) {
      errors.push(`${p.name}: ${err.message}`);
      continue;
    }
  }

  throw new Error(`All LLM providers failed:\n${errors.join("\n")}`);
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) {
      return apiUnauthorized();
    }

    const body = await req.json();
    const { id, field, currentValue } = improveMemeSchema.parse(body);

    const { db } = await import("@virlio/database");
    const { memes, templates } = await import("@virlio/database/schema");
    const { eq, and } = await import("drizzle-orm");

    // Fetch meme with authorization check
    const meme = await db.query.memes.findFirst({
      where: and(eq(memes.id, id), eq(memes.generator_id, session.user.id)),
    });

    if (!meme) {
      return apiError("Meme not found or unauthorized.", 404);
    }

    // Fetch template title for context
    let templateTitle = "Meme Template";
    if (meme.template_id) {
      const template = await db.query.templates.findFirst({
        where: eq(templates.id, meme.template_id),
      });
      if (template) templateTitle = template.title || "Meme Template";
    }

    const captionSummary = meme.region_captions
      ? Object.entries(meme.region_captions as Record<string, string>)
          .map(([k, v]) => `${k}: "${v}"`)
          .join(", ")
      : [
          meme.top_text ? `Top: "${meme.top_text}"` : "",
          meme.bottom_text ? `Bottom: "${meme.bottom_text}"` : "",
        ]
          .filter(Boolean)
          .join(", ") || "No captions";

    const memeContext = `Meme Topic: "${meme.prompt || "Branded Meme"}"
Template: "${templateTitle}"
Caption Text: ${captionSummary}`;

    // Build a field-specific prompt when a single field is requested
    let prompt: string;
    if (field === "title") {
      const action = currentValue?.trim()
        ? `Improve this existing title: "${currentValue.trim()}"`
        : "Generate a concise 3-8 word human readable title (no quotes, no emojis, no generic words like Untitled)";
      prompt = `You are Virlio's AI meme copywriter.
${memeContext}

Task: ${action}

Return ONLY valid JSON (no markdown):
{ "title": "<3-8 word title>", "description": "", "hashtags": [] }`;
    } else if (field === "description") {
      const action = currentValue?.trim()
        ? `Improve this existing description: "${currentValue.trim()}"`
        : "Generate an informative 40-100 word SEO-friendly paragraph explaining the joke and context naturally";
      prompt = `You are Virlio's AI meme copywriter.
${memeContext}

Task: ${action}

Return ONLY valid JSON (no markdown):
{ "title": "", "description": "<40-100 word description>", "hashtags": [] }`;
    } else if (field === "hashtags") {
      prompt = `You are Virlio's AI meme copywriter.
${memeContext}

Task: Generate up to 25 highly relevant, trending hashtags for this meme (include the # prefix).

Return ONLY valid JSON (no markdown):
{ "title": "", "description": "", "hashtags": ["#Tag1", "#Tag2", ...] }`;
    } else {
      // All fields at once
      prompt = `You are Virlio's AI meme copywriter. Based on the meme details below, return a JSON object with a concise 3-8 word title, an informative 40-100 word SEO-friendly description, and up to 25 relevant trending hashtags (including the # prefix).

${memeContext}

Return ONLY valid JSON (no markdown, no prose):
{
  "title": "<3-8 word title>",
  "description": "<40-100 word SEO description>",
  "hashtags": ["#Tag1", "#Tag2", ...]
}`;
    }

    const result = await callLLMForImprovement(prompt);

    const { validateSafetyAndProfanity } = await import("@/lib/validations/safety-filter");
    const { ensureValidTitle, ensureValidDescription } = await import("@/server/services/meme-engine/meme-metadata.service");

    if (result.title) {
      result.title = ensureValidTitle(result.title, { topic: meme.prompt || "Branded Meme", templateTitle });
      if (!validateSafetyAndProfanity(result.title).isValid) {
        result.title = ensureValidTitle(null, { topic: meme.prompt || "Branded Meme", templateTitle });
      }
    }

    if (result.description) {
      result.description = ensureValidDescription(result.description, {
        topic: meme.prompt || "Branded Meme",
        templateTitle,
        topText: meme.top_text,
        bottomText: meme.bottom_text,
      });
      if (!validateSafetyAndProfanity(result.description).isValid) {
        result.description = ensureValidDescription(null, {
          topic: meme.prompt || "Branded Meme",
          templateTitle,
          topText: meme.top_text,
          bottomText: meme.bottom_text,
        });
      }
    }

    result.hashtags = (result.hashtags || [])
      .slice(0, 25)
      .filter((tag) => validateSafetyAndProfanity(tag).isValid);

    return apiSuccess({ ...result, field: field ?? "all" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiValidationError(error.issues);
    }
    console.error("[POST /api/v1/memes/improve Error]", error);
    return apiError(error.message || "Failed to generate suggestions", 500);
  }
}

