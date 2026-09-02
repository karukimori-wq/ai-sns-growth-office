import { NextResponse } from "next/server";
import {
  createSnsOAuthCallbackUrl,
  createSnsConnectionIntent,
  listSnsIntegrationProviders
} from "../../../src/domain/sns-integration-catalog.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getEnv(): Record<string, unknown> {
  try {
    return { ...process.env, ...(getCloudflareContext().env ?? {}) };
  } catch {
    return process.env;
  }
}

export async function GET(request: Request) {
  const accounts = await repository.listSnsAccounts();
  const origin = new URL(request.url).origin;
  const providers = listSnsIntegrationProviders({ accounts, env: getEnv() }).map((provider) => ({
    ...provider,
    recommendedCallbackUrl: createSnsOAuthCallbackUrl({ channel: provider.channel, origin })
  }));

  return NextResponse.json({ providers });
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
