import { NextResponse } from "next/server";
import { repository } from "../../../../../src/domain/repository.mjs";
import { approveRequest, createFollowUpActionsAfterApproval } from "../../../../../src/domain/workflow.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ approvalId: string }> }) {
  const { approvalId } = await params;
  const approval = repository.getApprovalById(approvalId);

  if (!approval) {
    return NextResponse.json({ error: "approval_not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const approved = approveRequest(approval, body.reason ?? "approved by CEO");
  repository.saveApproval(approved);

  const followUpActions = createFollowUpActionsAfterApproval({ approval: approved, repository });
  const persistedFollowUpActions = {
    ...followUpActions,
    created: followUpActions.created.map((action) => {
      if (action.type === "media_upload_job") {
        return { ...action, job: repository.saveMediaUploadJob(action.job) };
      }

      if (action.type === "publish_job") {
        return { ...action, job: repository.savePublishJob(action.job) };
      }

      return action;
    })
  };

  return NextResponse.json({ approval: approved, followUpActions: persistedFollowUpActions });
}
