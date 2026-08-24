import { NextResponse } from "next/server";
import { approvalRequests } from "../../../src/domain/seed.mjs";

export function GET() {
  return NextResponse.json({ approvals: approvalRequests });
}
