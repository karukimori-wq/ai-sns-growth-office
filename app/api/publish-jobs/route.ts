import { NextResponse } from "next/server";
import { handleCreatePublishJob } from "../../../src/domain/api-handlers.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export function GET() {
  return NextResponse.json({ publishJobs: repository.listPublishJobs() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = handleCreatePublishJob({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
