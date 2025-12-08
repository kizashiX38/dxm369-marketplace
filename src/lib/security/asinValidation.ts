// src/lib/security/asinValidation.ts
// DXM369 ASIN Validation — Shared security utility

/**
 * ASIN Validation Rules:
 * - Format: [A-Z0-9] only
 * - Length: 8-12 characters
 * - Typically starts with 'B' but not enforced
 */

const ASIN_REGEX = /^[A-Z0-9]{8,12}$/;
const MAX_ASINS_PER_REQUEST = 20;

export interface ValidationResult {
  valid: string[];
  invalid: string[];
  errors: string[];
}

/**
 * Validate and normalize ASINs
 * @param input - String (comma/newline separated) or array of ASINs
 * @param maxCount - Maximum ASINs allowed (default: 20)
 * @returns Validation result with valid/invalid ASINs and errors
 */
export function validateAsins(
  input: string | string[],
  maxCount: number = MAX_ASINS_PER_REQUEST
): ValidationResult {
  const result: ValidationResult = {
    valid: [],
    invalid: [],
    errors: [],
  };

  // Normalize input to array
  let candidates: string[];
  if (typeof input === 'string') {
    candidates = input
      .split(/[\s,\n]+/) // Split on whitespace, comma, newline
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } else if (Array.isArray(input)) {
    candidates = input.map((s) => String(s).trim()).filter((s) => s.length > 0);
  } else {
    result.errors.push('Invalid input type');
    return result;
  }

  // Check count limit
  if (candidates.length > maxCount) {
    result.errors.push(`Maximum ${maxCount} ASINs allowed per request`);
    return result;
  }

  if (candidates.length === 0) {
    result.errors.push('No ASINs provided');
    return result;
  }

  // Validate each ASIN
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const normalized = candidate.toUpperCase();

    // Check for duplicates
    if (seen.has(normalized)) {
      result.invalid.push(candidate);
      continue;
    }
    seen.add(normalized);

    // Validate format
    if (ASIN_REGEX.test(normalized)) {
      result.valid.push(normalized);
    } else {
      result.invalid.push(candidate);
    }
  }

  // Add error messages for invalid ASINs
  if (result.invalid.length > 0) {
    result.errors.push(
      `${result.invalid.length} invalid ASIN(s): ${result.invalid.slice(0, 5).join(', ')}${
        result.invalid.length > 5 ? '...' : ''
      }`
    );
  }

  return result;
}

/**
 * Quick validation check (returns boolean)
 */
export function isValidAsin(asin: string): boolean {
  return ASIN_REGEX.test(asin.toUpperCase().trim());
}

/**
 * Sanitize ASIN for safe logging/display
 */
export function sanitizeAsin(asin: string): string {
  return asin.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}
