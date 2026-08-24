import { NextResponse } from "next/server";
import { handleCreateMediaUploadJobAsync } from "../../../src/domain/api-handlers.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  return NextResponse.json({ mediaUploadJobs: await repository.listMediaUploadJobs() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handleCreateMediaUploadJobAsync({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
