import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createLineWebhookEventRecords,
  verifyLineWebhookSignature
} from "../../../../src/domain/line-messaging.mjs";
import { repository } from "../../../../src/domain/repository-runtime.mjs";

function getEnv(): Record<string, unknown> {
  try {
    return { ...process.env, ...(getCloudflareContext().env ?? {}) };
  } catch {
    return process.env;
  }
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";
  const channelSecret = String(getEnv().LINE_CHANNEL_SECRET ?? "").trim();
  const verified = verifyLineWebhookSignature({ bodyText, signature, channelSecret });

  if (!verified) {
    return NextResponse.json({ error: "line_signature_invalid" }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(bodyText || "{}");
  } catch {
    return NextResponse.json({ error: "line_webhook_body_invalid" }, { status: 400 });
  }
  const records = createLineWebhookEventRecords({ body, bodyText, signature, verified });
  const savedEvents = [];

  for (const record of records) {
    savedEvents.push(await repository.saveLineWebhookEvent(record));
  }

  return NextResponse.json({ received: true, eventCount: savedEvents.length, events: savedEvents });
}
