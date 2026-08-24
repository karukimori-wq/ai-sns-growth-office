import { NextResponse } from "next/server";
import { mediaAssets } from "../../../src/domain/seed.mjs";

export function GET() {
  return NextResponse.json({ mediaAssets });
}
