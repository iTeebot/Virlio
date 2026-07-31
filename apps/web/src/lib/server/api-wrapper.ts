import { NextRequest, NextResponse } from "next/server";
import { AppError, ValidationError } from "@/lib/errors/errors";
import { classifyDatabaseError } from "@/lib/database/db-errors";
import { logger } from "@/lib/logging/logger";

export type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse | Response>;

/**
 * Centralized API Route Wrapper for App Router
 * Attaches Request IDs, redacts secrets, classifies errors, and returns safe responses.
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    const startTime = Date.now();
    const requestId = req.headers.get("x-request-id") || `req_${Math.random().toString(36).substring(2, 10)}`;

    try {
      const response = await handler(req, context);

      // Attach X-Request-Id to outgoing response headers
      if (response instanceof NextResponse || response instanceof Response) {
        response.headers.set("X-Request-Id", requestId);
      }

      return response;
    } catch (rawError: any) {
      const durationMs = Date.now() - startTime;

      // 1. Classify database & raw errors into structured AppError
      let appError: AppError;

      if (rawError instanceof AppError) {
        appError = rawError;
      } else if (rawError?.name === "PostgresError" || rawError?.code || rawError?.routine) {
        appError = classifyDatabaseError(rawError);
      } else if (rawError instanceof SyntaxError && rawError.message.includes("JSON")) {
        appError = new ValidationError("Malformed JSON payload in request body.");
      } else {
        appError = new AppError(rawError?.message || "An unexpected internal error occurred.", {
          cause: rawError,
          status: 500,
          severity: "ERROR",
        });
      }

      appError.requestId = requestId;

      // 2. Log structured diagnostic entry (with secret redaction)
      logger.error(`API Route Error: ${req.method} ${req.nextUrl.pathname}`, {
        requestId,
        route: req.nextUrl.pathname,
        method: req.method,
        code: appError.code,
        category: appError.category,
        status: appError.status,
        durationMs,
        err: rawError,
      });

      // 3. Return standardized user-safe JSON response
      const jsonResponse = NextResponse.json(appError.toJSON(), {
        status: appError.status,
      });

      jsonResponse.headers.set("X-Request-Id", requestId);
      return jsonResponse;
    }
  };
}
