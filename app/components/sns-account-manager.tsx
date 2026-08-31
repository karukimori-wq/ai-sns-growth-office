"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type SnsAccount = {
  channel: string;
  account: string;
  purpose: string;
};

const storageKey = "ai-sns-growth-office:sns-accounts";

export function SnsAccountManager({ initialAccounts }: { initialAccounts: SnsAccount[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as SnsAccount[];
      if (Array.isArray(parsed)) setAccounts(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  function saveAccounts(nextAccounts: SnsAccount[]) {
    setAccounts(nextAccounts);
    window.localStorage.setItem(storageKey, JSON.stringify(nextAccounts));
  }

  function addAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const channel = String(formData.get("channel") ?? "").trim();
    const account = String(formData.get("account") ?? "").trim() || "未設定";
    const purpose = String(formData.get("purpose") ?? "").trim() || "投稿・反応確認";

    if (!channel) return;

    saveAccounts([{ channel, account, purpose }, ...accounts.filter((item) => item.channel !== channel)]);
    form.reset();
    setIsFormOpen(false);
  }

  function removeAccount(channel: string) {
    saveAccounts(accounts.filter((item) => item.channel !== channel));
  }

  return (
    <>
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
            <input name="channel" placeholder="TikTok / YouTube / Threads" required />
          </label>
          <label>
            アカウント
            <input name="account" placeholder="@account_name" />
          </label>
          <label>
            用途
            <input name="purpose" placeholder="投稿公開、反応確認、プロフィール導線" />
          </label>
          <button type="submit">追加</button>
        </form>
      ) : null}
      <div className="settingsGrid snsAccountGrid">
        {accounts.map((item) => (
          <article className="settingsCard" key={item.channel}>
            <div className="cardHeaderLine">
              <strong>{item.channel}</strong>
              <button className="dangerButton" type="button" onClick={() => removeAccount(item.channel)}>
                削除
              </button>
            </div>
            <p>アカウント: {item.account}</p>
            <p>{item.purpose}</p>
          </article>
        ))}
      </div>
    </>
  );
}
