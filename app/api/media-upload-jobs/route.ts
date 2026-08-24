import { NextResponse } from "next/server";
import { handleCreateMediaUploadJob } from "../../../src/domain/api-handlers.mjs";
import { repository } from "../../../src/domain/repository.mjs";

export function GET() {
  return NextResponse.json({ mediaUploadJobs: repository.listMediaUploadJobs() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = handleCreateMediaUploadJob({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
