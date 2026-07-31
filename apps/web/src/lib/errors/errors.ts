import { ErrorCodes, type ErrorCode } from "./codes";

export type ErrorSeverity = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface AppErrorOptions {
  code?: ErrorCode;
  category?: string;
  userSafeMessage?: string;
  status?: number;
  severity?: ErrorSeverity;
  retryable?: boolean;
  cause?: unknown;
  metadata?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Base Application Error Class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly category: string;
  public readonly userSafeMessage: string;
  public readonly status: number;
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly cause?: unknown;
  public readonly metadata?: Record<string, unknown>;
  public requestId?: string;
  public readonly timestamp: string;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || ErrorCodes.INTERNAL_ERROR;
    this.category = options.category || "SYSTEM";
    this.userSafeMessage = options.userSafeMessage || "An unexpected error occurred. Please try again.";
    this.status = options.status || 500;
    this.severity = options.severity || "ERROR";
    this.retryable = options.retryable ?? false;
    this.cause = options.cause;
    this.metadata = options.metadata;
    this.requestId = options.requestId;
    this.timestamp = new Date().toISOString();

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.userSafeMessage,
        requestId: this.requestId,
        ...(process.env.NODE_ENV === "development" ? { internalMessage: this.message, category: this.category } : {}),
      },
    };
  }
}

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>, options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.VALIDATION_ERROR,
      category: "VALIDATION",
      status: 400,
      severity: "INFO",
      userSafeMessage: "Please check your input and try again.",
      ...options,
    });
    this.fields = fields;
  }

  public override toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      error: {
        ...base.error,
        ...(this.fields ? { fields: this.fields } : {}),
      },
    };
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required.", options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.AUTHENTICATION_ERROR,
      category: "AUTH",
      status: 401,
      severity: "WARNING",
      userSafeMessage: "Authentication failed. Please sign in to continue.",
      ...options,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied.", options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.AUTHORIZATION_ERROR,
      category: "AUTH",
      status: 403,
      severity: "WARNING",
      userSafeMessage: "You do not have permission to perform this action.",
      ...options,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found.", options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.NOT_FOUND_ERROR,
      category: "RESOURCE",
      status: 404,
      severity: "INFO",
      userSafeMessage: "The requested resource was not found.",
      ...options,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict.", options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.CONFLICT_ERROR,
      category: "RESOURCE",
      status: 409,
      severity: "INFO",
      userSafeMessage: "A resource with this information already exists.",
      ...options,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.DATABASE_ERROR,
      category: "DATABASE",
      status: 500,
      severity: "ERROR",
      userSafeMessage: "A database error occurred. Please try again later.",
      ...options,
    });
  }
}

export class DatabaseSchemaError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.DATABASE_SCHEMA_ERROR,
      category: "DATABASE",
      status: 503,
      severity: "CRITICAL",
      userSafeMessage: "Service is temporarily unavailable due to a schema mismatch. Please try again shortly.",
      retryable: false,
      ...options,
    });
  }
}

export class DatabaseConnectionError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.DATABASE_CONNECTION_ERROR,
      category: "DATABASE",
      status: 503,
      severity: "CRITICAL",
      userSafeMessage: "Unable to connect to the database. Please try again in a moment.",
      retryable: true,
      ...options,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded.", options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.RATE_LIMIT_ERROR,
      category: "RATE_LIMIT",
      status: 429,
      severity: "WARNING",
      userSafeMessage: "Too many requests. Please slow down and try again shortly.",
      retryable: true,
      ...options,
    });
  }
}

export class OAuthError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, {
      code: ErrorCodes.OAUTH_ERROR,
      category: "AUTH",
      status: 400,
      severity: "WARNING",
      userSafeMessage: "Social sign-in could not be completed. Please try again.",
      ...options,
    });
  }
}
