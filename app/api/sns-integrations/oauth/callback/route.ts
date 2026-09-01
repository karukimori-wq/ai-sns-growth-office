import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createConnectedSnsAccountFromOAuth,
  exchangeSnsOAuthCode
} from "../../../../../src/domain/sns-integration-catalog.mjs";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

function getEnv(): Record<string, unknown> {
  try {
    return { ...process.env, ...(getCloudflareContext().env ?? {}) };
  } catch {
    return process.env;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channel = url.searchParams.get("channel") ?? url.searchParams.get("provider") ?? "";
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error, state }, { status: 400 });
  }

  try {
    const exchange = await exchangeSnsOAuthCode({ channel, code, state, env: getEnv() });

    if (exchange.status !== "connected") {
      return NextResponse.json({ connection: exchange }, { status: 400 });
    }

    const accounts = await repository.listSnsAccounts() as Array<Record<string, unknown>>;
    const existingAccount = accounts.find(
      (account) => String(account.channel ?? "").toLowerCase() === String(exchange.channel ?? "").toLowerCase()
    );
    const snsAccount = await repository.saveSnsAccount(
      createConnectedSnsAccountFromOAuth({ exchange, existingAccount })
    );

    return NextResponse.json({ connected: true, snsAccount });
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "sns_oauth_callback_failed" },
      { status: 400 }
    );
  }
}
