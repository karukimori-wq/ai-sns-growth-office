const providerCatalog = [
  {
    channel: "X",
    accountType: "Developer App + user OAuth",
    authType: "oauth2_pkce",
    oauth: {
      authorizationUrl: "https://twitter.com/i/oauth2/authorize",
      clientIdEnv: "X_CLIENT_ID",
      redirectUriEnv: "X_REDIRECT_URI",
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"]
    },
    status: "connectable",
    capabilities: ["post_text", "post_media", "read_reactions"],
    requiredSetup: ["X Developer App", "Callback URL", "tweet.read / tweet.write / users.read"]
  },
  {
    channel: "Instagram",
    accountType: "Business or Creator account",
    authType: "meta_oauth",
    oauth: {
      authorizationUrl: "https://www.facebook.com/v23.0/dialog/oauth",
      clientIdEnv: "META_CLIENT_ID",
      redirectUriEnv: "META_REDIRECT_URI",
      scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"]
    },
    status: "connectable",
    capabilities: ["publish_media", "publish_reels", "read_insights"],
    requiredSetup: ["Meta App", "Instagram Professional account", "Facebook Page link"]
  },
  {
    channel: "TikTok",
    accountType: "TikTok creator account",
    authType: "tiktok_oauth",
    oauth: {
      authorizationUrl: "https://www.tiktok.com/v2/auth/authorize/",
      clientIdEnv: "TIKTOK_CLIENT_KEY",
      redirectUriEnv: "TIKTOK_REDIRECT_URI",
      scopes: ["user.info.basic", "video.publish", "video.upload"]
    },
    status: "connectable",
    capabilities: ["direct_post", "upload_draft", "read_creator_info"],
    requiredSetup: ["TikTok Developer App", "Content Posting API access", "Redirect URI"]
  },
  {
    channel: "YouTube",
    accountType: "Google account / channel",
    authType: "google_oauth",
    oauth: {
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      clientIdEnv: "GOOGLE_CLIENT_ID",
      redirectUriEnv: "GOOGLE_REDIRECT_URI",
      scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"]
    },
    status: "connectable",
    capabilities: ["upload_video", "update_metadata", "read_analytics"],
    requiredSetup: ["Google Cloud project", "YouTube Data API", "OAuth consent screen"]
  },
  {
    channel: "LINE",
    accountType: "LINE Official Account",
    authType: "channel_token_webhook_secret",
    status: "pending_official_account",
    capabilities: ["push_message", "receive_webhook", "handoff_to_communication_planner"],
    requiredSetup: ["LINE Official Account", "Channel access token", "Channel secret"]
  }
];

/**
 * @param {{ accounts?: Array<Record<string, any>> }} [input]
 */
export function listSnsIntegrationProviders({ accounts = [] } = {}) {
  return providerCatalog.map((provider) => {
    const account = accounts.find((item) => normalizeChannel(item.channel) === normalizeChannel(provider.channel));
    const connectionStatus = account?.status === "connected" ? "connected" : provider.status;

    return {
      ...provider,
      connectionStatus,
      account: account?.account ?? "未設定",
      accountId: account?.id ?? null,
      purpose: account?.purpose ?? "",
      handoffTarget: account?.handoffTarget ?? ""
    };
  });
}

export function getSnsIntegrationProvider(channel) {
  return providerCatalog.find((provider) => normalizeChannel(provider.channel) === normalizeChannel(channel)) ?? null;
}

/**
 * @param {{ channel?: string, accounts?: Array<Record<string, any>> }} [input]
 */
export function createSnsConnectionIntent({ channel, accounts = [] } = {}) {
  const provider = getSnsIntegrationProvider(channel);

  if (!provider) {
    throw new Error("sns_provider_not_supported");
  }

  const connectedAccount = accounts.find((account) => normalizeChannel(account.channel) === normalizeChannel(channel));

  return {
    channel: provider.channel,
    status: connectedAccount?.status === "connected" ? "already_connected" : "setup_required",
    authType: provider.authType,
    accountType: provider.accountType,
    requiredSetup: provider.requiredSetup,
    capabilities: provider.capabilities,
    nextAction: connectedAccount?.status === "connected" ? "接続済みです" : "開発者アプリとOAuth情報を設定してください"
  };
}

/**
 * @param {{ channel?: string, env?: Record<string, any>, state?: string }} [input]
 */
export function createSnsOAuthStartIntent({ channel, env = process.env, state } = {}) {
  const provider = getSnsIntegrationProvider(channel);

  if (!provider) {
    throw new Error("sns_provider_not_supported");
  }

  if (!provider.oauth) {
    return {
      channel: provider.channel,
      status: "manual_setup_required",
      reason: "このSNSはOAuthではなく、管理画面で発行したトークンを設定します",
      requiredSetup: provider.requiredSetup
    };
  }

  const clientId = String(env[provider.oauth.clientIdEnv] ?? "").trim();
  const redirectUri = String(env[provider.oauth.redirectUriEnv] ?? "").trim();
  const missing = [
    clientId ? null : provider.oauth.clientIdEnv,
    redirectUri ? null : provider.oauth.redirectUriEnv
  ].filter(Boolean);

  if (missing.length > 0) {
    return {
      channel: provider.channel,
      status: "missing_configuration",
      missing,
      requiredSetup: provider.requiredSetup,
      nextAction: `${missing.join(" / ")} をCloudflare環境変数へ設定してください`
    };
  }

  const oauthState = state || `sns_${normalizeChannel(provider.channel)}_${Date.now()}`;
  const url = new URL(provider.oauth.authorizationUrl);
  const scope = provider.oauth.scopes.join(provider.channel === "TikTok" ? "," : " ");
  const clientIdParam = provider.channel === "TikTok" ? "client_key" : "client_id";

  url.searchParams.set(clientIdParam, clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", oauthState);

  if (provider.channel === "X") {
    url.searchParams.set("code_challenge", "plain_dev_challenge");
    url.searchParams.set("code_challenge_method", "plain");
  }

  if (provider.channel === "Google" || provider.channel === "YouTube") {
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
  }

  return {
    channel: provider.channel,
    status: "ready",
    authorizationUrl: url.toString(),
    state: oauthState,
    scopes: provider.oauth.scopes
  };
}

function normalizeChannel(channel) {
  return String(channel ?? "").trim().toLowerCase();
}
