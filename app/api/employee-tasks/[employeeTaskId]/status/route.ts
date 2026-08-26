import { NextResponse } from "next/server";
import { handleUpdateEmployeeTaskStatusAsync } from "../../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ employeeTaskId: string }> }) {
  const body = await request.json().catch(() => ({}));
  const { employeeTaskId } = await params;
  const result = await handleUpdateEmployeeTaskStatusAsync({ employeeTaskId, body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
