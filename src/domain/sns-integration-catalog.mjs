const providerCatalog = [
  {
    channel: "X",
    accountType: "Developer App + user OAuth",
    authType: "oauth2_pkce",
    status: "connectable",
    capabilities: ["post_text", "post_media", "read_reactions"],
    requiredSetup: ["X Developer App", "Callback URL", "tweet.read / tweet.write / users.read"]
  },
  {
    channel: "Instagram",
    accountType: "Business or Creator account",
    authType: "meta_oauth",
    status: "connectable",
    capabilities: ["publish_media", "publish_reels", "read_insights"],
    requiredSetup: ["Meta App", "Instagram Professional account", "Facebook Page link"]
  },
  {
    channel: "TikTok",
    accountType: "TikTok creator account",
    authType: "tiktok_oauth",
    status: "connectable",
    capabilities: ["direct_post", "upload_draft", "read_creator_info"],
    requiredSetup: ["TikTok Developer App", "Content Posting API access", "Redirect URI"]
  },
  {
    channel: "YouTube",
    accountType: "Google account / channel",
    authType: "google_oauth",
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

function normalizeChannel(channel) {
  return String(channel ?? "").trim().toLowerCase();
}
