// src/lib/sentry-local.ts
// DXM369 Local Sentry Stub
// Provides Sentry-like interface without external network calls
// Perfect for local development and testing

import { log } from "./log";

interface SentryScope {
  setTag(key: string, value: string): void;
  setContext(key: string, context: Record<string, unknown>): void;
  setLevel(level: "debug" | "info" | "warning" | "error" | "fatal"): void;
  setUser(user: { id?: string; email?: string; username?: string }): void;
}

interface SentryOptions {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
  beforeSend?: (event: unknown) => unknown | null;
}

class LocalSentryScope implements SentryScope {
  private tags: Record<string, string> = {};
  private contexts: Record<string, Record<string, unknown>> = {};
  private level: "debug" | "info" | "warning" | "error" | "fatal" = "error";
  private user: { id?: string; email?: string; username?: string } | null = null;

  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  setContext(key: string, context: Record<string, unknown>): void {
    this.contexts[key] = context;
  }

  setLevel(level: "debug" | "info" | "warning" | "error" | "fatal"): void {
    this.level = level;
  }

  setUser(user: { id?: string; email?: string; username?: string }): void {
    this.user = user;
  }

  getMetadata() {
    return {
      tags: this.tags,
      contexts: this.contexts,
      level: this.level,
      user: this.user,
    };
  }
}

/**
 * DXM369 Local Sentry Implementation
 * 
 * Provides Sentry-like API for local development:
 * - No external network calls
 * - Logs to console with structured format
 * - Same API as real Sentry (easy swap in production)
 */
export const Sentry = {
  /**
   * Initialize Sentry (stub - no-op in local mode)
   */
  init(options?: SentryOptions): void {
    if (options?.dsn) {
      log.info("[SENTRY_LOCAL] Initialized (local mode - no external calls)");
    } else {
      log.info("[SENTRY_LOCAL] Running in local mode (no DSN provided)");
    }
  },

  /**
   * Capture an exception
   */
  captureException(
    exception: Error | unknown,
    scope?: (scope: SentryScope) => void
  ): string {
    const err = exception instanceof Error ? exception : new Error(String(exception));
    const localScope = new LocalSentryScope();
    
    if (scope) {
      scope(localScope);
    }

    const metadata = localScope.getMetadata();
    
    log.error("[SENTRY_LOCAL] Exception captured:", {
      message: err.message,
      stack: err.stack,
      ...metadata,
    });

    // Return a fake event ID
    return `local-${Date.now()}`;
  },

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: "debug" | "info" | "warning" | "error" | "fatal" = "info",
    scope?: (scope: SentryScope) => void
  ): string {
    const localScope = new LocalSentryScope();
    localScope.setLevel(level);
    
    if (scope) {
      scope(localScope);
    }

    const metadata = localScope.getMetadata();
    
    const logMethod = level === "error" ? log.error : 
                     level === "warning" ? log.warn : 
                     log.info;
    
    logMethod("[SENTRY_LOCAL] Message captured:", {
      message,
      ...metadata,
    });

    // Return a fake event ID
    return `local-${Date.now()}`;
  },

  /**
   * Configure scope (stub)
   */
  configureScope(callback: (scope: SentryScope) => void): void {
    const localScope = new LocalSentryScope();
    callback(localScope);
  },

  /**
   * Set user context (stub)
   */
  setUser(user: { id?: string; email?: string; username?: string } | null): void {
    if (user) {
      log.info("[SENTRY_LOCAL] User set:", user);
    }
  },

  /**
   * Set tag (stub)
   */
  setTag(key: string, value: string): void {
    log.debug("[SENTRY_LOCAL] Tag set:", { key, value });
  },

  /**
   * Set context (stub)
   */
  setContext(key: string, context: Record<string, unknown>): void {
    log.debug("[SENTRY_LOCAL] Context set:", { key, context });
  },

  /**
   * Add breadcrumb (stub)
   */
  addBreadcrumb(breadcrumb: {
    message?: string;
    category?: string;
    level?: "debug" | "info" | "warning" | "error" | "fatal";
    data?: Record<string, unknown>;
  }): void {
    log.debug("[SENTRY_LOCAL] Breadcrumb:", breadcrumb);
  },
};

// Export default for convenience
export default Sentry;

