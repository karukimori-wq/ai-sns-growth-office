# External Intelligence Record: CEO Operating Snapshot

Date: 2026-08-25

## Purpose

社長が毎朝見るべき状態を、複数APIの断片ではなく1つの運用スナップショットとして取得できるようにした。

## Implemented Scope

- `createCeoOperatingSnapshot` を追加
- `GET /api/ceo-operating-snapshot` を追加
- 契約カタログに新APIを登録
- テストで以下を固定
  - 社長判断待ちキュー
  - 秘書から部署への指示
  - 公開までの運用ゲート
  - 次アクション
  - 稼働社員数とブロック数

## Product Decision

社長ビューは「情報を眺める画面」ではなく「判断を下す画面」として扱う。
そのためスナップショットは `decisionQueue` と `nextActions` を明示的に返す。

## API Contract

`GET /api/ceo-operating-snapshot`

Response root:

- `snapshot.status`
- `snapshot.executiveSummary`
- `snapshot.decisionQueue`
- `snapshot.dispatchPlan`
- `snapshot.operationGates`
- `snapshot.nextActions`
- `snapshot.metrics`

## Verification

Run:

```bash
node --test tests/*.test.mjs
```
