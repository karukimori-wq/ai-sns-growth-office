# External Intelligence Record: AI SNS Growth Office Sprint 1 Approval Follow-up Actions

Date: 2026-08-25

## Scope

This record documents the Sprint 1 implementation that connects CEO approval results to the next operational actions in the SNS marketing workflow.

## Decision

Approval APIs now return `followUpActions` after a CEO approval and persist valid generated jobs through the repository interface.

The seed-backed repository supports in-process persistence for:

- approvals
- media upload jobs
- publish jobs

The response still keeps explicit orchestration detail:

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

## Files Changed

- `src/domain/workflow.mjs`
- `src/domain/repository.mjs`
- `src/domain/seed.mjs`
- `app/api/approvals/[approvalId]/approve/route.ts`
- `app/api/approvals/[approvalId]/revision/route.ts`
- `tests/workflow.test.mjs`
- `tests/repository.test.mjs`
- `README.md`

## Verification

Command:

```bash
node --test tests/*.test.mjs
```

Result:

- 13 passed
- 0 failed

Build verification was not run in this scratch workspace because `node_modules` is not installed.

## Follow-up

Next implementation should replace in-process seed persistence with a database-backed repository after the storage contract is stable.
