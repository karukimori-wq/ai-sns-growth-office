import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sendLinePushMessage } from "../../../../../src/domain/line-messaging.mjs";
import { repository } from "../../../../../src/domain/repository-runtime.mjs";

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
    const delivery = await sendLinePushMessage({ body, env: getEnv() as NodeJS.ProcessEnv });
    const savedDelivery = await repository.saveLineMessageDelivery(delivery);

    return NextResponse.json({ delivery: savedDelivery }, { status: delivery.status === "sent" ? 201 : 502 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "line_push_failed" },
      { status: 400 }
    );
  }
}
