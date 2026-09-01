import assert from "node:assert/strict";
import test from "node:test";
import {
  createSnsConnectionIntent,
  createSnsOAuthStartIntent,
  listSnsIntegrationProviders
} from "../src/domain/sns-integration-catalog.mjs";

test("SNS integration catalog exposes connectable posting channels", () => {
  const providers = listSnsIntegrationProviders();
  const channels = providers.map((provider) => provider.channel);

  assert.deepEqual(channels, ["X", "Instagram", "TikTok", "YouTube", "LINE"]);
  assert.equal(providers.find((provider) => provider.channel === "X").authType, "oauth2_pkce");
  assert.ok(providers.find((provider) => provider.channel === "Instagram").capabilities.includes("read_insights"));
  assert.ok(providers.find((provider) => provider.channel === "TikTok").capabilities.includes("upload_draft"));
  assert.ok(providers.find((provider) => provider.channel === "YouTube").capabilities.includes("upload_video"));
});

test("SNS integration catalog overlays saved account connection state", () => {
  const providers = listSnsIntegrationProviders({
    accounts: [{ id: "sns_x", channel: "X", account: "@numeria", status: "connected", purpose: "投稿" }]
  });
  const x = providers.find((provider) => provider.channel === "X");

  assert.equal(x.connectionStatus, "connected");
  assert.equal(x.account, "@numeria");
  assert.equal(x.accountId, "sns_x");
});

test("SNS connection intent returns required setup before OAuth is configured", () => {
  const intent = createSnsConnectionIntent({ channel: "Instagram", accounts: [] });

  assert.equal(intent.status, "setup_required");
  assert.equal(intent.authType, "meta_oauth");
  assert.ok(intent.requiredSetup.includes("Meta App"));
});

test("SNS OAuth start intent reports missing configuration", () => {
  const intent = createSnsOAuthStartIntent({ channel: "X", env: {} });

  assert.equal(intent.status, "missing_configuration");
  assert.deepEqual(intent.missing, ["X_CLIENT_ID", "X_REDIRECT_URI"]);
});

test("SNS OAuth start intent creates authorization URL when configured", () => {
  const intent = createSnsOAuthStartIntent({
    channel: "YouTube",
    env: {
      GOOGLE_CLIENT_ID: "google-client",
      GOOGLE_REDIRECT_URI: "https://example.com/oauth/youtube/callback"
    },
    state: "state_1"
  });
  const url = new URL(intent.authorizationUrl);

  assert.equal(intent.status, "ready");
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.searchParams.get("client_id"), "google-client");
  assert.equal(url.searchParams.get("state"), "state_1");
  assert.ok(url.searchParams.get("scope").includes("youtube.upload"));
});

test("SNS OAuth start intent keeps LINE as manual token setup", () => {
  const intent = createSnsOAuthStartIntent({ channel: "LINE", env: {} });

  assert.equal(intent.status, "manual_setup_required");
  assert.ok(intent.requiredSetup.includes("Channel secret"));
});
