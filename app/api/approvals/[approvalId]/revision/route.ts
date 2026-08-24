import { NextResponse } from "next/server";
import { approvalRequests } from "../../../../../src/domain/seed.mjs";
import { requestRevision } from "../../../../../src/domain/workflow.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ approvalId: string }> }) {
  const { approvalId } = await params;
  const approval = approvalRequests.find((item) => item.id === approvalId);

  if (!approval) {
    return NextResponse.json({ error: "approval_not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const revised = requestRevision(approval, body.reason ?? "revision requested by CEO");

  return NextResponse.json({ approval: revised });
}
