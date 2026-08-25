import { NextResponse } from "next/server";
import { handleMarkMediaUploadManualReadyAsync } from "../../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request, { params }: { params: Promise<{ mediaUploadJobId: string }> }) {
  const { mediaUploadJobId } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await handleMarkMediaUploadManualReadyAsync({ mediaUploadJobId, body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
