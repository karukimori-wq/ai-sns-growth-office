import { NextResponse } from "next/server";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ publishJobId: string }> }) {
  const body = await request.json().catch(() => ({}));
  const { publishJobId } = await params;
  const job = await repository.getPublishJobById(publishJobId);

  if (!job) {
    return NextResponse.json({ error: "publish_job_not_found" }, { status: 404 });
  }

  if (job.status === "published") {
    return NextResponse.json({ error: "Published X publish job cannot be cancelled" }, { status: 409 });
  }

  const publishJob = await repository.savePublishJob({
    ...job,
    status: "cancelled",
    cancelReason: typeof body.reason === "string" ? body.reason : "cancelled by CEO"
  });

  return NextResponse.json({ publishJob });
}
