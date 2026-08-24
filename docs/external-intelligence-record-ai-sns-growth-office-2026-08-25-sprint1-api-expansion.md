# External Intelligence Record: AI SNS Growth Office Sprint 1 API Expansion

Date: 2026-08-25
Project: AI SNS Growth Office
Record type: implementation_result
Repository: karukimori-wq/ai-sns-growth-office

## Context

After the first implementation skeleton, Sprint 1 continued by exposing the core MVP data through API routes.

The goal was to make the CEO dashboard data and approval/publish workflow accessible through stable Next.js route handlers before adding persistence.

## Implemented

- Extended seed data with:
  - approval status and history
  - content drafts
  - media assets
  - media upload jobs
  - publish jobs
  - performance snapshots
- Added API routes:
  - GET /api/company-tasks
  - GET /api/approvals
  - POST /api/approvals/{approvalId}/approve
  - POST /api/approvals/{approvalId}/revision
  - GET /api/app-projects
  - GET /api/media-assets
  - GET /api/media-upload-jobs
  - POST /api/media-upload-jobs
  - GET /api/publish-jobs
  - POST /api/publish-jobs
  - GET /api/performance-snapshots
- Connected API routes to existing domain workflow rules:
  - image upload jobs require approved image assets
  - publish jobs require draft approval and publish approval
  - daily metrics are normalized before bottleneck rates are calculated
- Adjusted dynamic approval route params for Next.js 15 route handler compatibility.
- Added workflow tests for:
  - pending image approval blocking media upload jobs
  - manual-required media upload path allowing publish gate after CEO approvals

## Verification

Command:

```bash
node --test tests/*.test.mjs
```

Result:

- tests: 6
- pass: 6
- fail: 0

Validated rules:

1. X publish job cannot be created before draft and publish approvals.
2. Image-based X publish job requires approved image and uploaded media.
3. Revision requests preserve approval history.
4. Missing daily metrics are treated as `unknown`, not zero.
5. Pending image approval cannot create an X media upload job.
6. Manual-required media upload status can pass the publish gate after CEO approvals.

## Notes

The API layer still uses seed data. It does not persist mutations yet. This is intentional for Sprint 1 because the domain contracts and approval boundaries are still being stabilized.

## Next Actions

1. Add an in-memory repository abstraction that can later be replaced by D1/Postgres.
2. Add UI screens for approval center, media assets, publish queue, and daily metrics.
3. Add API tests once a route test harness is introduced.
4. Update professional-platform-contracts with the new AI SNS Growth Office endpoints.
