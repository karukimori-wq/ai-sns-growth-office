import { NextResponse } from "next/server";
import { handleCreateSnsAccountAsync } from "../../../src/domain/api-handlers.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  return NextResponse.json({ snsAccounts: await repository.listSnsAccounts() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handleCreateSnsAccountAsync({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
