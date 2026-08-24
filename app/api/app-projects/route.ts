import { NextResponse } from "next/server";
import { appProjects } from "../../../src/domain/seed.mjs";

export function GET() {
  return NextResponse.json({ appProjects });
}
