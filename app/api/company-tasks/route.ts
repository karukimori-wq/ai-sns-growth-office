import { NextResponse } from "next/server";
import { companyTasks } from "../../../src/domain/seed.mjs";

export function GET() {
  return NextResponse.json({ tasks: companyTasks });
}
