import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export function GET() {
  return NextResponse.json({ tasks: repository.listCompanyTasks() });
}
