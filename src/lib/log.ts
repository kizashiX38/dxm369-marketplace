// src/lib/log.ts
// DXM369 Structured Logging
// Consistent, structured logging across the entire application
// Local-first: logs to console, can be extended for production (e.g., CloudWatch, Datadog)

import { appConfig } from "./env";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private formatEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data) {
      if (data instanceof Error) {
        entry.error = {
          message: data.message,
          stack: data.stack,
          name: data.name,
        };
      } else if (typeof data === "object") {
        entry.data = data as Record<string, unknown>;
      } else {
        entry.data = { value: data };
      }
    }

    return entry;
  }

  private output(level: LogLevel, message: string, data?: unknown): void {
    const entry = this.formatEntry(level, message, data);
    
    // In development: pretty print
    if (appConfig.isDevelopment) {
      const prefix = `[${entry.level.toUpperCase()}]`;
      const time = new Date(entry.timestamp).toLocaleTimeString();
      
      console.log(`${prefix} ${time} ${message}`);
      
      if (entry.data) {
        console.log("  Data:", entry.data);
      }
      
      if (entry.error) {
        console.error("  Error:", entry.error.message);
        if (entry.error.stack) {
          console.error("  Stack:", entry.error.stack);
        }
      }
    } else {
      // In production: JSON format (for log aggregation)
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Log informational message
   */
  info(message: string, data?: unknown): void {
    this.output("info", message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    this.output("warn", message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: unknown): void {
    this.output("error", message, data);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: unknown): void {
    if (appConfig.isDevelopment) {
      this.output("debug", message, data);
    }
  }
}

/**
 * DXM369 Global Logger Instance
 * 
 * Usage:
 * ```ts
 * import { log } from "@/lib/log";
 * 
 * log.info("User logged in", { userId: "123" });
 * log.error("Failed to fetch data", error);
 * log.warn("Rate limit approaching", { remaining: 10 });
 * ```
 */
export const log = new Logger();

// Export default for convenience
export default log;

