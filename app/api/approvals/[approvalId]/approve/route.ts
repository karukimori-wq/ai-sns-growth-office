import { NextResponse } from "next/server";
import { handleApproveApprovalAsync } from "../../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ approvalId: string }> }) {
  const { approvalId } = await params;
  const body = await request.json().catch(() => ({}));

  const result = await handleApproveApprovalAsync({ approvalId, body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
