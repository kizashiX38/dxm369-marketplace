// src/app/api/email/subscribe/route.ts
// Email Newsletter Subscription API
// Handle newsletter signups with preferences
// Dual-write: emailMarketing service + PostgreSQL

import { NextRequest, NextResponse } from "next/server";
import { apiSafe, safeJsonParse } from "@/lib/apiSafe";
import { log } from "@/lib/log";
import { emailMarketing } from "@/lib/emailMarketing";
import { subscribe as dbSubscribe } from "@/lib/services/newsletter";
import { HardwareCategory } from "@/lib/dealRadar";

interface SubscribeBody {
  email: string;
  firstName?: string;
  lastName?: string;
  categories?: HardwareCategory[];
  priceRange?: { min: number; max: number };
  dealThreshold?: number;
  frequency?: "instant" | "daily" | "weekly";
  dxmScoreThreshold?: number;
  source?: string;
}

export const POST = apiSafe(async (req: NextRequest) => {
  const body = await safeJsonParse<SubscribeBody>(req);
  
  if (!body) {
    return NextResponse.json({
      ok: false,
      error: "Invalid JSON in request body"
    }, { status: 400 });
  }

  const { 
    email, 
    firstName, 
    lastName, 
    categories, 
    priceRange, 
    dealThreshold, 
    frequency, 
    dxmScoreThreshold,
    source 
  } = body;

  // Validate required fields
  if (!email) {
    return NextResponse.json({
      ok: false,
      error: "Email address is required"
    }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({
      ok: false,
      error: "Invalid email address format"
    }, { status: 400 });
  }

  // Validate categories if provided
  const validCategories: HardwareCategory[] = ["gpu", "cpu", "laptop", "monitor", "ssd", "psu", "motherboard", "ram", "case", "cooling", "keyboard", "mouse", "headset"];
  if (categories && !Array.isArray(categories)) {
    return NextResponse.json({
      ok: false,
      error: "Categories must be an array"
    }, { status: 400 });
  }

  if (categories && categories.some((cat: string) => !validCategories.includes(cat as HardwareCategory))) {
    return NextResponse.json({
      ok: false,
      error: `Invalid category. Valid categories: ${validCategories.join(", ")}`
    }, { status: 400 });
  }

  // Validate frequency if provided
  const validFrequencies = ["instant", "daily", "weekly"];
  if (frequency && !validFrequencies.includes(frequency)) {
    return NextResponse.json({
      ok: false,
      error: `Invalid frequency. Valid options: ${validFrequencies.join(", ")}`
    }, { status: 400 });
  }

  // Build preferences object
  const preferences: any = {};
  
  if (categories) preferences.categories = categories;
  if (priceRange) {
    if (typeof priceRange.min === "number" && typeof priceRange.max === "number") {
      preferences.priceRange = priceRange;
    }
  }
  if (typeof dealThreshold === "number" && dealThreshold >= 0 && dealThreshold <= 100) {
    preferences.dealThreshold = dealThreshold;
  }
  if (frequency) preferences.frequency = frequency;
  if (typeof dxmScoreThreshold === "number" && dxmScoreThreshold >= 0 && dxmScoreThreshold <= 10) {
    preferences.dxmScoreThreshold = dxmScoreThreshold;
  }

  log.info("[EMAIL_SUBSCRIBE] New subscription attempt", { 
    email, 
    source,
    hasPreferences: Object.keys(preferences).length > 0
  });

  // Subscribe user to email marketing service (SendGrid, etc.)
  const emailResult = await emailMarketing.subscribe(
    email,
    preferences,
    source || "api",
    firstName,
    lastName
  );

  // Also store in PostgreSQL (dual-write for redundancy)
  const dbResult = await dbSubscribe(email, source || "api");
  
  // If email service fails but DB succeeds, still return success (graceful degradation)
  const success = emailResult.success || dbResult.success;

  if (success) {
    return NextResponse.json({
      ok: true,
      data: {
        message: dbResult.message || "Successfully subscribed to DXM369 newsletter",
        subscriberId: emailResult.subscriberId || dbResult.subscriber?.id,
        email,
        preferences,
        status: "pending", // Will be activated after email confirmation
        storedInDB: dbResult.success,
        storedInEmailService: emailResult.success
      }
    });
  } else {
    return NextResponse.json({
      ok: false,
      error: emailResult.error || dbResult.message || "Subscription failed"
    }, { status: 400 });
  }
});

export const GET = apiSafe(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  switch (action) {
    case "stats":
      const stats = emailMarketing.getSubscriberStats();
      return NextResponse.json({
        ok: true,
        data: stats
      });

    case "preferences":
      // Return available subscription preferences
      return NextResponse.json({
        ok: true,
        data: {
          categories: ["gpu", "cpu", "laptop", "monitor", "ssd", "psu", "motherboard", "ram", "case", "cooling", "keyboard", "mouse", "headset"],
          frequencies: ["instant", "daily", "weekly"],
          defaultPreferences: {
            categories: ["gpu", "cpu", "laptop"],
            dealThreshold: 15,
            frequency: "daily",
            dxmScoreThreshold: 8.0
          }
        }
      });

    default:
      return NextResponse.json({
        ok: false,
        error: "Invalid action. Use 'stats' or 'preferences'"
      }, { status: 400 });
  }
});
