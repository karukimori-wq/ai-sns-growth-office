# AI SNS Growth Office External Intelligence Record

Date: 2026-08-30

## Scope

Redesigned the Operations page after feedback that approvals and pre-publish checks did not belong as the main Operations experience.

## External Intelligence Used

- Approvals are decisions and should primarily live under Instructions.
- Operations should show active campaign work by project/content without sending the user back to Company once the work is in operations.
- Operations starts after post copy is created and approved, then covers scheduling, publishing, reactions, metrics, and improvement.
- Schedule visibility should cover upcoming posts, not only today's posts.

## Changes

- Removed the large approval next-action panel from Operations.
- Replaced it with a small route notice that links approval decisions to Instructions.
- Removed the "pre-publish check/execution management" panel from Operations.
- Rebuilt the main Operations section around active projects, including post content, publish state, next schedule, reactions, analysis, and improvement.
- Removed the Company jump from Operations project cards.
- Replaced today's-only schedule with an upcoming post schedule list.
- Added mobile-safe responsive styles for the redesigned Operations cards.

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
