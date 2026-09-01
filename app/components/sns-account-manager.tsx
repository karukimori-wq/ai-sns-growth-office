"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type SnsAccount = {
  id: string;
  channel: string;
  account: string;
  purpose: string;
  integrationType: string;
  status: string;
  handoffTarget?: string;
};

type SnsProvider = {
  channel: string;
  accountType: string;
  authType: string;
  connectionStatus: string;
  capabilities: string[];
  requiredSetup: string[];
  account: string;
  oauth?: {
    authorizationUrl: string;
    clientIdEnv: string;
    redirectUriEnv: string;
    scopes: string[];
  };
};

export function SnsAccountManager({ initialAccounts }: { initialAccounts: SnsAccount[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [providers, setProviders] = useState<SnsProvider[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setAccounts(initialAccounts), [initialAccounts]);
  useEffect(() => {
    void refreshProviders();
  }, []);

  async function refreshProviders() {
    const response = await fetch("/api/sns-integrations");
    const payload = (await response.json()) as { providers?: SnsProvider[] };

    setProviders(payload.providers ?? []);
  }

  async function addAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const channel = String(formData.get("channel") ?? "").trim();
    const account = String(formData.get("account") ?? "").trim() || "未設定";
    const purpose = String(formData.get("purpose") ?? "").trim() || "投稿・反応確認";
    const integrationType = String(formData.get("integrationType") ?? "").trim() || "posting";
    const handoffTarget = String(formData.get("handoffTarget") ?? "").trim();

    if (!channel) return;

    const response = await fetch("/api/sns-accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel, account, purpose, integrationType, handoffTarget })
    });
    const payload = (await response.json()) as { snsAccount?: SnsAccount; error?: string };

    if (!response.ok || !payload.snsAccount) {
      setMessage(payload.error ?? "SNS接続先の追加に失敗しました");
      return;
    }

    setAccounts((current) => [payload.snsAccount as SnsAccount, ...current.filter((item) => item.channel !== channel)]);
    await refreshProviders();
    form.reset();
    setIsFormOpen(false);
    setMessage(`${payload.snsAccount.channel} を追加しました`);
  }

  async function removeAccount(account: SnsAccount) {
    const response = await fetch(`/api/sns-accounts/${encodeURIComponent(account.id)}`, { method: "DELETE" });
    const payload = (await response.json()) as { deleted?: boolean; error?: string };

    if (!response.ok || !payload.deleted) {
      setMessage(payload.error ?? "削除に失敗しました");
      return;
    }

    setAccounts(accounts.filter((item) => item.id !== account.id));
    await refreshProviders();
    setMessage(`${account.channel} を削除しました`);
  }

  async function checkConnection(channel: string) {
    const response = await fetch("/api/sns-integrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel })
    });
    const payload = (await response.json()) as { connection?: { nextAction?: string }; error?: string };

    setMessage(payload.connection?.nextAction ?? payload.error ?? "接続状態を確認しました");
  }

  async function startOAuth(channel: string) {
    const response = await fetch("/api/sns-integrations/oauth/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel })
    });
    const payload = (await response.json()) as {
      connection?: { authorizationUrl?: string; nextAction?: string; reason?: string; missing?: string[] };
      error?: string;
    };

    if (payload.connection?.authorizationUrl) {
      window.location.href = payload.connection.authorizationUrl;
      return;
    }

    setMessage(
      payload.connection?.nextAction ??
        payload.connection?.reason ??
        payload.error ??
        "OAuth開始に必要な設定が不足しています"
    );
  }

  return (
    <>
      <div className="snsProviderGrid">
        {providers.map((provider) => (
          <article className="snsProviderCard" key={provider.channel}>
            <div className="snsProviderTop">
              <strong>{provider.channel}</strong>
              <span className={`snsStatusPill ${provider.connectionStatus}`}>
                {connectionStatusLabel(provider.connectionStatus)}
              </span>
            </div>
            <small>{provider.accountType}</small>
            <div className="snsCapabilityRow">
              {provider.capabilities.slice(0, 3).map((capability) => (
                <span key={capability}>{capabilityLabel(capability)}</span>
              ))}
            </div>
            <p>{provider.requiredSetup.join(" / ")}</p>
            <div className="snsProviderActions">
              <button type="button" onClick={() => checkConnection(provider.channel)}>
                準備確認
              </button>
              <button type="button" disabled={!provider.oauth} onClick={() => startOAuth(provider.channel)}>
                接続開始
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="contentAddBar">
        <div>
          <strong>SNS接続先</strong>
          <small>{accounts.length}件登録中</small>
        </div>
        <button
          aria-expanded={isFormOpen}
          className="roundAddButton"
          type="button"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          ＋
        </button>
      </div>
      {isFormOpen ? (
        <form className="snsAccountForm" onSubmit={addAccount}>
          <label>
          SNS
            <select name="channel" defaultValue="LINE" required>
              <option value="X">X</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="LINE">LINE</option>
              <option value="YouTube">YouTube</option>
              <option value="Threads">Threads</option>
            </select>
          </label>
          <label>
            アカウント
            <input name="account" placeholder="@account_name" />
          </label>
          <label>
            用途
            <input name="purpose" placeholder="投稿公開、LINE配信、反応確認、プロフィール導線" />
          </label>
          <label>
            連携種別
            <select name="integrationType" defaultValue="posting">
              <option value="posting">投稿・公開</option>
              <option value="messaging">配信・メッセージ</option>
              <option value="login">ログイン・会員導線</option>
              <option value="analytics">反応・分析</option>
            </select>
          </label>
          <label>
            返信の引き渡し先
            <input name="handoffTarget" placeholder="Communication Planner / 手動対応" />
          </label>
          <button type="submit">追加</button>
        </form>
      ) : null}
      {message ? <p className="actionMessage">{message}</p> : null}
      <div className="settingsGrid snsAccountGrid">
        {accounts.map((item) => (
          <article className="settingsCard" key={item.id}>
            <div className="cardHeaderLine">
              <strong>{item.channel}</strong>
              <button className="dangerButton" type="button" onClick={() => removeAccount(item)}>
                削除
              </button>
            </div>
            <p>アカウント: {item.account}</p>
            <p>{item.purpose}</p>
            <small>連携: {integrationTypeLabel(item.integrationType)}</small>
            {item.handoffTarget ? <small>返信引き渡し: {item.handoffTarget}</small> : null}
          </article>
        ))}
      </div>
    </>
  );
}

function integrationTypeLabel(type: string) {
  const labels: Record<string, string> = {
    posting: "投稿・公開",
    messaging: "配信・メッセージ",
    login: "ログイン・会員導線",
    analytics: "反応・分析"
  };

  return labels[type] ?? type;
}

function connectionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    connected: "接続済み",
    connectable: "接続可",
    pending_official_account: "公式アカウント待ち"
  };

  return labels[status] ?? "準備中";
}

function capabilityLabel(capability: string) {
  const labels: Record<string, string> = {
    post_text: "本文投稿",
    post_media: "画像投稿",
    read_reactions: "反応取得",
    publish_media: "画像公開",
    publish_reels: "リール",
    read_insights: "分析",
    direct_post: "直接投稿",
    upload_draft: "下書き",
    read_creator_info: "投稿者情報",
    upload_video: "動画投稿",
    update_metadata: "説明更新",
    push_message: "配信",
    receive_webhook: "受信",
    handoff_to_communication_planner: "返信引継ぎ"
  };

  return labels[capability] ?? capability;
}
