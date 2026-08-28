import { NextResponse } from "next/server";
import {
  handleDeleteMarketingContentAsync,
  handleUpdateMarketingContentAsync
} from "../../../../src/domain/api-handlers.mjs";
import { repository } from "../../../../src/domain/repository-runtime.mjs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const result = await handleUpdateMarketingContentAsync({ id, body, repository });

  return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await handleDeleteMarketingContentAsync({ id, repository });

  return NextResponse.json(result.body, { status: result.status });
}
