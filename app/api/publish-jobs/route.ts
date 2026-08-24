import { NextResponse } from "next/server";
import { approvalRequests, contentDrafts, mediaUploadJobs, publishJobs } from "../../../src/domain/seed.mjs";
import { createXPublishJob } from "../../../src/domain/workflow.mjs";

export function GET() {
  return NextResponse.json({ publishJobs });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const contentDraft = contentDrafts.find((item) => item.id === body.contentDraftId);
  const draftApproval = approvalRequests.find((item) => item.id === body.draftApprovalId);
  const publishApproval = approvalRequests.find((item) => item.id === body.publishApprovalId);
  const mediaUploadJob = body.mediaUploadJobId
    ? mediaUploadJobs.find((item) => item.id === body.mediaUploadJobId)
    : undefined;

  if (!contentDraft) {
    return NextResponse.json({ error: "content_draft_not_found" }, { status: 404 });
  }

  if (!draftApproval) {
    return NextResponse.json({ error: "draft_approval_not_found" }, { status: 404 });
  }

  if (!publishApproval) {
    return NextResponse.json({ error: "publish_approval_not_found" }, { status: 404 });
  }

  try {
    const job = createXPublishJob({
      id: body.id ?? `x_publish_${contentDraft.id}`,
      contentDraftId: contentDraft.id,
      draftApproval,
      publishApproval,
      mediaUploadJob
    });

    return NextResponse.json({ publishJob: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "invalid_publish_job" }, { status: 409 });
  }
}
