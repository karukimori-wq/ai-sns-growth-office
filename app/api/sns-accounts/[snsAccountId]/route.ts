import { NextResponse } from "next/server";
import {
  handleDeleteSnsAccountAsync,
  handleUpdateSnsAccountAsync
} from "../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../src/domain/repository-runtime.mjs";

type RouteContext = {
  params: Promise<{ snsAccountId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { snsAccountId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const result = await handleUpdateSnsAccountAsync({ id: snsAccountId, body, repository });

  return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { snsAccountId } = await context.params;
  const result = await handleDeleteSnsAccountAsync({ id: snsAccountId, repository });

  return NextResponse.json(result.body, { status: result.status });
}
