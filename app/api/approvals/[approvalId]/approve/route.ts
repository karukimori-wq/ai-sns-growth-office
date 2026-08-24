import { NextResponse } from "next/server";
import { repository } from "../../../../../src/domain/repository.mjs";
import { approveRequest } from "../../../../../src/domain/workflow.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ approvalId: string }> }) {
  const { approvalId } = await params;
  const approval = repository.getApprovalById(approvalId);

  if (!approval) {
    return NextResponse.json({ error: "approval_not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const approved = approveRequest(approval, body.reason ?? "approved by CEO");

  return NextResponse.json({ approval: approved });
}
