import { NextResponse } from "next/server";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ publishJobId: string }> }) {
  const body = await request.json().catch(() => ({}));
  const { publishJobId } = await params;
  const job = await repository.getPublishJobById(publishJobId);

  if (!job) {
    return NextResponse.json({ error: "publish_job_not_found" }, { status: 404 });
  }

  if (["published", "cancelled"].includes(job.status)) {
    return NextResponse.json({ error: `X publish job is already closed: ${job.status}` }, { status: 409 });
  }

  const publishJob = await repository.savePublishJob({
    ...job,
    status: "published",
    publishedAt: typeof body.publishedAt === "string" ? body.publishedAt : new Date().toISOString()
  });

  return NextResponse.json({ publishJob });
}
