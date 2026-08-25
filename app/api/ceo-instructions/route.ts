import { NextResponse } from "next/server";
import { handleCreateCeoInstructionAsync } from "../../../src/domain/api-handlers.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  return NextResponse.json({ instructions: await repository.listCeoInstructions() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await handleCreateCeoInstructionAsync({ body, repository });

  return NextResponse.json(result.body, { status: result.status });
}
