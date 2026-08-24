import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository.mjs";
import { createXPublishJob } from "../../../src/domain/workflow.mjs";

export function GET() {
  return NextResponse.json({ publishJobs: repository.listPublishJobs() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const contentDraft = repository.getContentDraftById(body.contentDraftId);
  const draftApproval = repository.getApprovalById(body.draftApprovalId);
  const publishApproval = repository.getApprovalById(body.publishApprovalId);
  const mediaUploadJob = body.mediaUploadJobId
    ? repository.getMediaUploadJobById(body.mediaUploadJobId)
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
