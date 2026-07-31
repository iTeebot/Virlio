import {
  DatabaseError,
  DatabaseSchemaError,
  DatabaseConnectionError,
  ConflictError,
  ValidationError,
  AppError,
} from "@/lib/errors/errors";

/**
 * Classifies raw PostgreSQL / Drizzle exceptions into structured domain AppErrors
 */
export function classifyDatabaseError(err: any): AppError {
  if (!err) {
    return new DatabaseError("Unknown database error occurred.");
  }

  const code = String(err.code || "");
  const message = String(err.message || "");

  // 42P01: Undefined Table (e.g. missing accounts, users, sessions table)
  if (code === "42P01" || message.includes("does not exist") || message.includes("undefined_table")) {
    return new DatabaseSchemaError(
      `Database schema error: Table missing (${message}). Please run database migrations.`,
      { cause: err }
    );
  }

  // 23505: Unique Constraint Violation
  if (code === "23505" || message.includes("unique constraint")) {
    return new ConflictError("A record with this information already exists.", {
      cause: err,
    });
  }

  // 23503: Foreign Key Constraint Violation
  if (code === "23503" || message.includes("foreign key constraint")) {
    return new ValidationError("Referenced relational record does not exist.", undefined, {
      cause: err,
    });
  }

  // 23502: Not Null Constraint Violation
  if (code === "23502" || message.includes("null value in column")) {
    return new ValidationError("Required database field missing.", undefined, {
      cause: err,
    });
  }

  // 08000 - 08007: Connection Exceptions
  if (code.startsWith("08") || message.includes("connection") || message.includes("ECONNREFUSED") || message.includes("ETIMEDOUT")) {
    return new DatabaseConnectionError("Database connection failed or timed out.", {
      cause: err,
      retryable: true,
    });
  }

  // Fallback Database Error
  return new DatabaseError(message || "A database operation failed.", {
    cause: err,
  });
}

/**
 * Executes a transient database operation with bounded exponential backoff and jitter
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; initialDelayMs?: number; maxDelayMs?: number } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 150;
  const maxDelayMs = options.maxDelayMs ?? 2000;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const appErr = classifyDatabaseError(err);

      // Only retry if retryable connection failure and within retry bounds
      if (!appErr.retryable || attempt > maxRetries) {
        throw appErr;
      }

      const backoff = Math.min(initialDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      const jitter = Math.random() * 50;
      await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
    }
  }
}
