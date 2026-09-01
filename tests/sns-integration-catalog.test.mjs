import assert from "node:assert/strict";
import test from "node:test";
import {
  createSnsConnectionIntent,
  createConnectedSnsAccountFromOAuth,
  createSnsOAuthStartIntent,
  exchangeSnsOAuthCode,
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
  assert.deepEqual(intent.missing, ["X_CLIENT_ID", "X_REDIRECT_URI", "X_CODE_VERIFIER"]);
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

test("SNS OAuth callback exchange reports missing token settings", async () => {
  const exchange = await exchangeSnsOAuthCode({ channel: "Instagram", code: "code_1", env: {} });

  assert.equal(exchange.status, "missing_configuration");
  assert.deepEqual(exchange.missing, ["META_CLIENT_ID", "META_CLIENT_SECRET", "META_REDIRECT_URI"]);
});

test("SNS OAuth callback exchange posts token request", async () => {
  const calls = [];
  const exchange = await exchangeSnsOAuthCode({
    channel: "TikTok",
    code: "code_1",
    state: "state_1",
    env: {
      TIKTOK_CLIENT_KEY: "client-key",
      TIKTOK_CLIENT_SECRET: "client-secret",
      TIKTOK_REDIRECT_URI: "https://example.com/oauth/tiktok/callback",
      TIKTOK_CODE_VERIFIER: "verifier"
    },
    exchangedAt: "2026-09-01T10:00:00.000Z",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });

      return new Response(JSON.stringify({
        access_token: "access-token",
        refresh_token: "refresh-token",
        token_type: "Bearer",
        expires_in: 86400,
        scope: "video.publish,video.upload"
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
  });
  const body = calls[0].options.body;

  assert.equal(exchange.status, "connected");
  assert.equal(exchange.token.accessToken, "access-token");
  assert.equal(calls[0].url, "https://open.tiktokapis.com/v2/oauth/token/");
  assert.equal(body.get("client_key"), "client-key");
  assert.equal(body.get("code_verifier"), "verifier");
});

test("connected SNS account record preserves existing account label", () => {
  const account = createConnectedSnsAccountFromOAuth({
    exchange: {
      channel: "X",
      status: "connected",
      account: "接続済み",
      connectedAt: "2026-09-01T10:00:00.000Z",
      token: { accessToken: "access", refreshToken: "refresh", tokenType: "Bearer", expiresIn: 7200, scope: "tweet.write" }
    },
    existingAccount: {
      id: "sns_x",
      channel: "X",
      account: "@numeria",
      purpose: "投稿",
      integrationType: "posting",
      createdAt: "2026-08-01T00:00:00.000Z"
    }
  });

  assert.equal(account.id, "sns_x");
  assert.equal(account.status, "connected");
  assert.equal(account.account, "@numeria");
  assert.equal(account.connection.scope, "tweet.write");
});
