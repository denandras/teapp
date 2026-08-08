import { NextRequest, NextResponse } from "next/server";

/**
 * Returns the visitor's country based on Cloudflare's CF-IPCountry header.
 * Falls back to 'HU' for local development where the header is absent.
 */
export async function GET(request: NextRequest) {
  const cfCountry = request.headers.get("cf-ipcountry");
  const country = cfCountry && cfCountry.trim() !== "" ? cfCountry.toUpperCase() : "HU";

  return NextResponse.json({ country });
}
