import { NextResponse } from "next/server";
import {
  createSnsConnectionIntent,
  listSnsIntegrationProviders
} from "../../../src/domain/sns-integration-catalog.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  const accounts = await repository.listSnsAccounts();

  return NextResponse.json({ providers: listSnsIntegrationProviders({ accounts }) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const accounts = await repository.listSnsAccounts();

  try {
    return NextResponse.json({
      connection: createSnsConnectionIntent({ channel: body.channel, accounts })
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "sns_connection_failed" },
      { status: 400 }
    );
  }
}
