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
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;

  if (error) {
    if (!wantsJson) {
      return NextResponse.redirect(settingsRedirectUrl(url, { status: "error", channel, message: error }));
    }

    return NextResponse.json({ error, state }, { status: 400 });
  }

  try {
    const exchange = await exchangeSnsOAuthCode({ channel, code, state, env: getEnv() });

    if (exchange.status !== "connected") {
      if (!wantsJson) {
        return NextResponse.redirect(settingsRedirectUrl(url, {
          status: exchange.status,
          channel: exchange.channel ?? channel,
          message: exchange.nextAction ?? exchange.error ?? "SNS接続を完了できませんでした"
        }));
      }

      return NextResponse.json({ connection: exchange }, { status: 400 });
    }

    const accounts = await repository.listSnsAccounts() as Array<Record<string, unknown>>;
    const existingAccount = accounts.find(
      (account) => String(account.channel ?? "").toLowerCase() === String(exchange.channel ?? "").toLowerCase()
    );
    const snsAccount = await repository.saveSnsAccount(
      createConnectedSnsAccountFromOAuth({ exchange, existingAccount })
    );

    if (!wantsJson) {
      return NextResponse.redirect(settingsRedirectUrl(url, {
        status: "connected",
        channel: snsAccount.channel,
        message: `${snsAccount.channel} の接続が完了しました`
      }));
    }

    return NextResponse.json({ connected: true, snsAccount });
  } catch (caught) {
    if (!wantsJson) {
      return NextResponse.redirect(settingsRedirectUrl(url, {
        status: "error",
        channel,
        message: caught instanceof Error ? caught.message : "sns_oauth_callback_failed"
      }));
    }

    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "sns_oauth_callback_failed" },
      { status: 400 }
    );
  }
}

function settingsRedirectUrl(
  sourceUrl: URL,
  input: { status: string; channel?: string; message?: string }
) {
  const redirectUrl = new URL("/settings/sns-accounts", sourceUrl.origin);

  redirectUrl.searchParams.set("connection", input.status);
  if (input.channel) redirectUrl.searchParams.set("channel", input.channel);
  if (input.message) redirectUrl.searchParams.set("message", input.message);

  return redirectUrl;
}
