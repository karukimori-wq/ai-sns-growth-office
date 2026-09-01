import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import {
  createLineMessageDeliveryRecord,
  createLineRuntimeStatus,
  createLineWebhookEventRecords,
  sendLinePushMessage,
  verifyLineWebhookSignature
} from "../src/domain/line-messaging.mjs";

test("LINE runtime status reports missing and ready configuration", () => {
  assert.equal(createLineRuntimeStatus({}).status, "missing_configuration");
  assert.equal(
    createLineRuntimeStatus({
      LINE_CHANNEL_ACCESS_TOKEN: "token",
      LINE_CHANNEL_SECRET: "secret"
    }).status,
    "ready"
  );
});

test("LINE webhook signature verifies raw request body", () => {
  const bodyText = JSON.stringify({ destination: "Utest", events: [] });
  const channelSecret = "line-secret";
  const signature = createHmac("sha256", channelSecret).update(bodyText).digest("base64");

  assert.equal(verifyLineWebhookSignature({ bodyText, signature, channelSecret }), true);
  assert.equal(verifyLineWebhookSignature({ bodyText: `${bodyText}\n`, signature, channelSecret }), false);
});

test("LINE webhook event records preserve source and message", () => {
  const bodyText = JSON.stringify({
    destination: "Ubot",
    events: [
      {
        webhookEventId: "event_1",
        type: "message",
        replyToken: "reply_token",
        source: { type: "user", userId: "Uuser" },
        message: { type: "text", text: "予約したいです" }
      }
    ]
  });

  const records = createLineWebhookEventRecords({
    body: JSON.parse(bodyText),
    bodyText,
    signature: "signature",
    verified: true,
    receivedAt: "2026-09-01T00:00:00.000Z"
  });

  assert.equal(records.length, 1);
  assert.equal(records[0].lineEventType, "message");
  assert.equal(records[0].source.userId, "Uuser");
  assert.equal(records[0].message.text, "予約したいです");
});

test("LINE push delivery uses official push payload", async () => {
  const calls = [];
  const delivery = await sendLinePushMessage({
    env: { LINE_CHANNEL_ACCESS_TOKEN: "access-token" },
    body: { to: "Uuser", text: "本日の投稿をLINE配信します" },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });

      return new Response("", {
        status: 200,
        headers: { "x-line-request-id": "line-request-1" }
      });
    }
  });

  assert.equal(delivery.status, "sent");
  assert.equal(calls[0].url, "https://api.line.me/v2/bot/message/push");
  assert.equal(calls[0].options.headers.Authorization, "Bearer access-token");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    to: "Uuser",
    messages: [{ type: "text", text: "本日の投稿をLINE配信します" }]
  });
});

test("LINE push delivery validates recipient and message", () => {
  assert.throws(() => createLineMessageDeliveryRecord({ body: { text: "hello" } }), /line_to_required/);
  assert.throws(() => createLineMessageDeliveryRecord({ body: { to: "Uuser" } }), /line_message_required/);
});
