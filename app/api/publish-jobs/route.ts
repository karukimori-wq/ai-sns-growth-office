import { NextResponse } from "next/server";
import { handleCreatePublishJobAsync } from "../../../src/domain/api-handlers.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  return NextResponse.json({ publishJobs: await repository.listPublishJobs() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handleCreatePublishJobAsync({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
