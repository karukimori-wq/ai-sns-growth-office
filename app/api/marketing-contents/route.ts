import { NextResponse } from "next/server";
import { handleCreateMarketingContentAsync } from "../../../src/domain/api-handlers.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  return NextResponse.json({ marketingContents: await repository.listMarketingContents() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handleCreateMarketingContentAsync({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
