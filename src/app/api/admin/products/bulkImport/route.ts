// POST /api/admin/products/bulkImport
// Bulk import products from CSV or JSON

import { NextRequest, NextResponse } from "next/server";
import { bulkImportProducts } from "@/lib/services/adminProducts";
import { apiSafe } from "@/lib/apiSafe";

function parseCSV(content: string): Array<{ asin: string; category: string; title?: string }> {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const asinIdx = headers.indexOf("asin");
  const categoryIdx = headers.indexOf("category");
  const titleIdx = headers.indexOf("title");

  if (asinIdx === -1 || categoryIdx === -1) {
    throw new Error("CSV must have 'asin' and 'category' columns");
  }

  return lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim());
    return {
      asin: cols[asinIdx],
      category: cols[categoryIdx],
      title: titleIdx !== -1 ? cols[titleIdx] : undefined
    };
  });
}

export const POST = apiSafe(async (request: NextRequest) => {
  const contentType = request.headers.get("content-type") || "";
  let products: Array<{ asin: string; category: string; title?: string }> = [];

  if (contentType.includes("application/json")) {
    const body = await request.json();
    products = body.products || [];
  } else if (contentType.includes("text/csv")) {
    const text = await request.text();
    products = parseCSV(text);
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    if (file.name.endsWith(".json")) {
      products = JSON.parse(text).products || [];
    } else if (file.name.endsWith(".csv")) {
      products = parseCSV(text);
    } else {
      return NextResponse.json(
        { ok: false, error: "File must be JSON or CSV" },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { ok: false, error: "Content-Type must be application/json, text/csv, or multipart/form-data" },
      { status: 400 }
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No products to import" },
      { status: 400 }
    );
  }

  const result = await bulkImportProducts(products);

  return NextResponse.json({
    ok: true,
    data: result
  });
});
