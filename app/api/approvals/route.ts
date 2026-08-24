import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  return NextResponse.json({ approvals: await repository.listApprovals() });
}
