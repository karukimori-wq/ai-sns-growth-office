import { NextResponse } from "next/server";
import { handleCreatePublishApprovalRequestAsync } from "../../../src/domain/publish-approval-request.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handleCreatePublishApprovalRequestAsync({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
