import { NextRequest } from "next/server";
import { authService, brandService } from "@/server/services";
import { brandPostRepository } from "@/server/repositories";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; generationId: string }>;
}

/**
 * GET /api/v1/brands/[id]/posts/generations/[generationId]/stream
 * Real-time Server-Sent Events stream for generation state progression.
 */
export async function GET(req: NextRequest, context: RouteParams) {
  const session = await authService.getCurrentSession();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id: brandId, generationId } = await context.params;

  const userRole = await brandService.getUserRole(brandId, session.user.id);
  if (!userRole) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      let isFinished = false;
      let checkCount = 0;
      const maxChecks = 30; // Max 45 seconds timeout

      while (!isFinished && checkCount < maxChecks && !req.signal.aborted) {
        try {
          const generation = await brandPostRepository.findGenerationById(generationId);
          if (!generation) {
            sendEvent("error", { message: "Generation not found" });
            break;
          }

          const variations = await brandPostRepository.findVariationsByGeneration(generationId);

          sendEvent("status", {
            generationId: generation.id,
            status: generation.status,
            errorMessage: generation.error_message,
            provider: generation.provider_used,
            model: generation.model_used,
            variationsCount: variations.length,
            variations,
          });

          if (generation.status === "completed" || generation.status === "failed") {
            isFinished = true;
            sendEvent("done", { status: generation.status });
            break;
          }

          checkCount++;
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (err: any) {
          sendEvent("error", { message: err.message || "Streaming error" });
          break;
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
