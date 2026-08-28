import { NextResponse } from "next/server";
import { handleCancelCompanyTaskAsync } from "../../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ companyTaskId: string }> }) {
  const body = await request.json().catch(() => ({}));
  const { companyTaskId } = await params;
  const result = await handleCancelCompanyTaskAsync({ companyTaskId, body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
