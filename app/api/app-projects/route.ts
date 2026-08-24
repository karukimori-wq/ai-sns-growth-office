import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository.mjs";

export function GET() {
  return NextResponse.json({ appProjects: repository.listAppProjects() });
}
