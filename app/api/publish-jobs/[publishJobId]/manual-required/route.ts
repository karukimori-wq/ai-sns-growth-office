import { NextResponse } from "next/server";
import { handleMarkPublishJobManualRequiredAsync } from "../../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ publishJobId: string }> }) {
  const body = await request.json().catch(() => ({}));
  const { publishJobId } = await params;
  const result = await handleMarkPublishJobManualRequiredAsync({ publishJobId, body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
