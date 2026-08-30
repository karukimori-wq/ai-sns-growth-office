# AI SNS Growth Office External Intelligence Record

Date: 2026-08-30

## Scope

Continued the SNS workflow IA pass after Company and Operations were split by responsibility.

## External Intelligence Used

- The home dashboard should show the user where to start without requiring them to understand every menu.
- Content registration is source material management, not the place where post drafts are created.
- The menu responsibilities should stay consistent:
  - Content: register what to sell or promote.
  - Company: strategy, planning, and post creation.
  - Operations: scheduling, reactions, analysis, and improvement.

## Changes

- Added a Home flow overview that links to Company for steps 1-3 and Operations for steps 4-7.
- Renamed Home panels so the workflow split is visible from the dashboard.
- Reframed the Content page as PR target/source-material registration.
- Added a direct Content-to-Company action for moving from registered PR target to post creation.
- Added responsive styles for the new workflow cards.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run build:cloudflare
```

Results:

- `npm run typecheck`: passed after rerunning sequentially.
- `npm test`: 87 passed, 0 failed.
- `npm run build`: passed.
- `npm run build:cloudflare`: passed.

## Notes

- Production URL remains `https://ai-sns-growth-office.karukimori.workers.dev`.
- No Cloudflare routing, secret, account, or database settings were changed.
