import { ErrorSeverity } from "@/lib/errors/errors";

const SENSITIVE_KEYS_REGEX = /(password|secret|token|authorization|cookie|set-cookie|key|credential|database_url|auth_secret)/i;

/**
 * Deeply redact sensitive properties from objects, arrays, and headers
 */
export function redactSensitiveData(data: unknown, depth = 0): unknown {
  if (depth > 6) return "[Truncated]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Redact connection strings or tokens in raw text
    if (data.includes("postgres://") || data.includes("postgresql://")) {
      return data.replace(/\/\/[^:]+:[^@]+@/, "//[REDACTED]:[REDACTED]@");
    }
    return data;
  }

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1));
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS_REGEX.test(key)) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = redactSensitiveData(value, depth + 1);
    }
  }

  return redacted;
}

export interface LogEntry {
  level: ErrorSeverity;
  message: string;
  timestamp: string;
  requestId?: string;
  category?: string;
  code?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(level: ErrorSeverity, message: string, meta: Record<string, unknown> = {}): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(meta.requestId ? { requestId: String(meta.requestId) } : {}),
      ...(meta.category ? { category: String(meta.category) } : {}),
      ...(meta.code ? { code: String(meta.code) } : {}),
      ...(meta.durationMs !== undefined ? { durationMs: Number(meta.durationMs) } : {}),
      metadata: redactSensitiveData(meta) as Record<string, unknown>,
    };

    if (meta.err && meta.err instanceof Error) {
      entry.error = {
        name: meta.err.name,
        message: meta.err.message,
        ...(process.env.NODE_ENV === "development" ? { stack: meta.err.stack } : {}),
      };
      if (entry.metadata) {
        delete entry.metadata.err;
      }
    }

    return entry;
  }

  public debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.log(JSON.stringify(this.formatLog("DEBUG", message, meta)));
    }
  }

  public info(message: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify(this.formatLog("INFO", message, meta)));
  }

  public warn(message: string, meta?: Record<string, unknown>) {
    console.warn(JSON.stringify(this.formatLog("WARNING", message, meta)));
  }

  public error(message: string, meta?: Record<string, unknown>) {
    console.error(JSON.stringify(this.formatLog("ERROR", message, meta)));
  }

  public critical(message: string, meta?: Record<string, unknown>) {
    console.error(JSON.stringify(this.formatLog("CRITICAL", message, meta)));
  }
}

export const logger = new Logger();
