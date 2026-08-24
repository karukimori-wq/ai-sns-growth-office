# External Intelligence Record: AI SNS Growth Office Sprint 1 Approval Follow-up Actions

Date: 2026-08-25

## Scope

This record documents the Sprint 1 implementation that connects CEO approval results to the next operational actions in the SNS marketing workflow.

## Decision

Approval APIs now return `followUpActions` after a CEO approval.

The current implementation does not persist the follow-up jobs yet. Instead, it returns:

- `created`: jobs that are valid to create after approval.
- `blocked`: explicit reasons a job cannot yet be created.

This keeps the workflow honest while the repository is still seed-backed.

## Implemented Rules

- Approved `image_asset` approvals can create an X media upload job.
- Approved `publish_schedule` approvals can create an X publish job only when:
  - the related draft approval is approved.
  - the related content draft exists.
  - image media is uploaded or explicitly marked as manual required.
- If media is not ready, publish creation is blocked with a specific reason.

## Files Changed

- `src/domain/workflow.mjs`
- `src/domain/repository.mjs`
- `src/domain/seed.mjs`
- `app/api/approvals/[approvalId]/approve/route.ts`
- `tests/workflow.test.mjs`
- `tests/repository.test.mjs`
- `README.md`

## Verification

Command:

```bash
node --test tests/*.test.mjs
```

Result:

- 12 passed
- 0 failed

Build verification was not run in this scratch workspace because `node_modules` is not installed.

## Follow-up

Next implementation should persist generated media upload jobs and publish jobs in the repository layer after the storage contract is stable.
