import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSnsOAuthStartIntent } from "../../../../../src/domain/sns-integration-catalog.mjs";

function getEnv(): Record<string, unknown> {
  try {
    return { ...process.env, ...(getCloudflareContext().env ?? {}) };
  } catch {
    return process.env;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  try {
    const connection = createSnsOAuthStartIntent({
      channel: body.channel,
      env: getEnv(),
      state: body.state
    });

    return NextResponse.json({ connection }, { status: connection.status === "ready" ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "sns_oauth_start_failed" },
      { status: 400 }
    );
  }
}
