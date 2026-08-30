# AI SNS Growth Office External Intelligence Record

Date: 2026-08-30

## Scope

Separated creation-side tasks from operations-side tasks around the approved post draft handoff.

## External Intelligence Used

- SNS workflow stage 3, post copy creation, belongs to Company.
- Once the post copy is approved, the next responsibility belongs to Operations.
- Company should not mix approved draft display with publish scheduling or publish status.
- Operations should visibly receive approved drafts before scheduling, publishing, reaction review, analysis, and improvement.

## Changes

- Removed publish-job status from Company task detail cards.
- Changed Company task draft details to show "approved then handed to Operations" instead of publish schedule/status.
- Added an Operations handoff section for approved draft copy.
- Added a "receive" step to the Operations execution flow before media, publish, and metrics.
- Passed approved draft and approval data into the execution queue.
- Added a regression test confirming approved draft output creates an Operations-side publish approval request without directly creating a publish job.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run build:cloudflare
```

Results:

- `npm run typecheck`: passed.
- `npm test`: 88 passed, 0 failed.
- `npm run build`: passed.
- `npm run build:cloudflare`: passed.

## Notes

- Production URL remains `https://ai-sns-growth-office.karukimori.workers.dev`.
- No Cloudflare routing, secret, account, or database settings were changed.
