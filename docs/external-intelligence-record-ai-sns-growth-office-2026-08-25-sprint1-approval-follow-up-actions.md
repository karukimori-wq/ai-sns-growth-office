# External Intelligence Record: AI SNS Growth Office Sprint 1 Approval Follow-up Actions

Date: 2026-08-25

## Scope

This record documents the Sprint 1 implementation that connects CEO approval results to the next operational actions in the SNS marketing workflow.

## Decision

Approval APIs now return `followUpActions` after a CEO approval and persist valid generated jobs through the repository interface.

A testable API handler layer was added under `src/domain/api-handlers.mjs`. Next.js route files now stay thin and delegate business behavior to this layer. This allows Node standard tests to verify API-like status codes, response bodies, and persistence side effects without requiring `node_modules` or Next.js runtime imports in the scratch workspace.

The seed-backed repository supports in-process persistence for:

- approvals
- media upload jobs
- publish jobs

The response keeps explicit orchestration detail:

- `created`: jobs that were valid and persisted after approval.
- `blocked`: explicit reasons a job could not be created yet.

This gives the UI a concrete result while keeping the later D1/Postgres replacement isolated behind the repository layer.

## Implemented Rules

- Approved `image_asset` approvals create and persist an X media upload job.
- Approved `publish_schedule` approvals create and persist an X publish job only when:
  - the related draft approval is approved.
  - the related content draft exists.
  - image media is uploaded or explicitly marked as manual required.
- If media is not ready, publish creation is blocked with a specific reason.
- Revision requests are also persisted back to the repository.
- Media upload and publish POST routes now share the same handler/test pattern as approval routes.

## Files Changed

- `src/domain/api-handlers.mjs`
- `src/domain/workflow.mjs`
- `src/domain/repository.mjs`
- `src/domain/seed.mjs`
- `app/api/approvals/[approvalId]/approve/route.ts`
- `app/api/approvals/[approvalId]/revision/route.ts`
- `app/api/media-upload-jobs/route.ts`
- `app/api/publish-jobs/route.ts`
- `tests/api-handlers.test.mjs`
- `tests/workflow.test.mjs`
- `tests/repository.test.mjs`
- `README.md`

## Verification

Command:

```bash
node --test tests/*.test.mjs
```

Result:

- 21 passed
- 0 failed

Build verification was not run in this scratch workspace because `node_modules` is not installed.

## Follow-up

Next implementation should replace in-process seed persistence with a database-backed repository after the storage contract is stable.
