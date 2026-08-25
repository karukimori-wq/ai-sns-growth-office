import { NextResponse } from "next/server";
import { handleMaterializePerformanceActionsAsync } from "../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../src/domain/repository-runtime.mjs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handleMaterializePerformanceActionsAsync({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
