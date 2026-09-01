import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const linePushEndpoint = "https://api.line.me/v2/bot/message/push";

export function createLineRuntimeStatus(env = process.env) {
  const channelAccessTokenConfigured = Boolean(String(env.LINE_CHANNEL_ACCESS_TOKEN ?? "").trim());
  const channelSecretConfigured = Boolean(String(env.LINE_CHANNEL_SECRET ?? "").trim());

  return {
    status: channelAccessTokenConfigured && channelSecretConfigured ? "ready" : "missing_configuration",
    channelAccessTokenConfigured,
    channelSecretConfigured,
    webhookPath: "/api/line/webhook",
    pushPath: "/api/line/messages/push"
  };
}

export function verifyLineWebhookSignature({ bodyText, signature, channelSecret }) {
  const resolvedSignature = String(signature ?? "").trim();
  const resolvedSecret = String(channelSecret ?? "").trim();

  if (!resolvedSignature || !resolvedSecret) {
    return false;
  }

  const expected = createHmac("sha256", resolvedSecret).update(bodyText).digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(resolvedSignature);

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export function createLineWebhookEventRecords({ body, bodyText, signature, verified, receivedAt = new Date().toISOString() }) {
  const events = Array.isArray(body?.events) ? body.events : [];

  return events.map((event, index) => ({
    id: `line_webhook_${event.webhookEventId ?? Date.now()}_${index}`,
    provider: "line",
    eventName: "ai_company.line_webhook.received.v1",
    destination: body?.destination ?? null,
    lineEventType: event.type ?? "unknown",
    replyToken: event.replyToken ?? null,
    source: event.source ?? null,
    message: event.message ?? null,
    rawEvent: event,
    bodyHash: createHash("sha256").update(bodyText).digest("hex"),
    signatureVerified: verified,
    signaturePresent: Boolean(signature),
    status: verified ? "received" : "rejected",
    receivedAt,
    createdAt: receivedAt,
    updatedAt: receivedAt
  }));
}

export function createLineMessageDeliveryRecord({
  body = {},
  status = "queued",
  lineRequestId = null,
  error = null,
  createdAt = new Date().toISOString()
} = {}) {
  const to = String(body.to ?? "").trim();
  const text = String(body.text ?? "").trim();
  const messages = normalizeLineMessages(body.messages ?? (text ? [{ type: "text", text }] : []));

  if (!to) {
    throw new Error("line_to_required");
  }

  if (messages.length === 0) {
    throw new Error("line_message_required");
  }

  return {
    id: body.id ?? `line_delivery_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    provider: "line",
    eventName: "ai_company.line_message.sent.v1",
    to,
    messages,
    status,
    lineRequestId,
    error,
    createdAt,
    updatedAt: createdAt
  };
}

export async function sendLinePushMessage({ body = {}, env = process.env, fetchImpl = fetch }) {
  const channelAccessToken = String(env.LINE_CHANNEL_ACCESS_TOKEN ?? "").trim();

  if (!channelAccessToken) {
    throw new Error("line_channel_access_token_missing");
  }

  const delivery = createLineMessageDeliveryRecord({ body, status: "queued" });
  const response = await fetchImpl(linePushEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: delivery.to,
      messages: delivery.messages
    })
  });
  const responseText = await response.text().catch(() => "");
  const lineRequestId = response.headers?.get?.("x-line-request-id") ?? null;

  if (!response.ok) {
    return {
      ...delivery,
      status: "failed",
      lineRequestId,
      error: responseText || `LINE push failed with ${response.status}`,
      updatedAt: new Date().toISOString()
    };
  }

  return {
    ...delivery,
    status: "sent",
    lineRequestId,
    updatedAt: new Date().toISOString()
  };
}

function normalizeLineMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message) => {
      if (message?.type === "text") {
        const text = String(message.text ?? "").trim();

        return text ? { type: "text", text } : null;
      }

      return message && typeof message === "object" ? message : null;
    })
    .filter(Boolean)
    .slice(0, 5);
}
