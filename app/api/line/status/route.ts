import { NextResponse } from "next/server";
import { createLineRuntimeStatus } from "../../../../src/domain/line-messaging.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getEnv(): Record<string, unknown> {
  try {
    return { ...process.env, ...(getCloudflareContext().env ?? {}) };
  } catch {
    return process.env;
  }
}

export async function GET() {
  return NextResponse.json(createLineRuntimeStatus(getEnv() as NodeJS.ProcessEnv));
}
