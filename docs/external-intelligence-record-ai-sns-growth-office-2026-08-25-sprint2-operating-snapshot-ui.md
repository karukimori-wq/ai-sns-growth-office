# External Intelligence Record: Operating Snapshot UI

Date: 2026-08-25

## Purpose

`GET /api/ceo-operating-snapshot` で定義した社長向け運用スナップショットを、ダッシュボードの第一画面で確認できるようにした。

## Implemented Scope

- `app/page.tsx` に `createCeoOperatingSnapshot` を接続
- 主要指標の直下に「社長運用スナップショット」を追加
- 表示項目
  - 今日の状態
  - 社長確認待ち件数
  - 公開ブロック件数
  - 次アクション上位3件
- モバイルでは1カラムに折り返すCSSを追加

## Product Decision

社長ビューでは、詳細一覧より先に「今止まっている理由」と「次に判断すること」を表示する。
これにより、秘書AIが社長へ確認すべき内容を画面上部で固定できる。

## Verification

Run:

```bash
node --test tests/*.test.mjs
```

Result:

- 54 tests passed

Build was not run in the local workspace because `node_modules` is not installed.
