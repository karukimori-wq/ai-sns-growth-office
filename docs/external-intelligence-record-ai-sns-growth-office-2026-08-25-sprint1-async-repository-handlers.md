# External Intelligence Record: Sprint 1 Async Repository Handlers

Date: 2026-08-25

## Context

AI SNS Growth Office is moving from seed-backed in-process data toward database-backed persistence.

Cloudflare D1-style repositories return promises, so API handlers and routes must be able to await repository reads and writes before a real D1 adapter is introduced.

## Decision

Keep the existing synchronous domain handlers for seed compatibility and direct tests, and add async handler variants for mutation workflows that will run through Next API routes.

Async handler variants:

- `handleApproveApprovalAsync`
- `handleRequestApprovalRevisionAsync`
- `handleCreateMediaUploadJobAsync`
- `handleCreatePublishJobAsync`

Next API routes now await repository calls for read and mutation endpoints.

## Scope

Updated behavior covers:

- Approval approval
- Approval revision request
- Approval follow-up job creation
- Media upload job creation
- Publish job creation
- App project reads
- Approval reads
- Company task reads
- Media asset reads
- Media upload job reads
- Publish job reads
- Performance snapshot reads

## Verification

Command:

```bash
node --test tests/*.test.mjs
```

Result:

- 31 tests passed
- 0 tests failed

## Remaining Work

- Implement the real D1 repository adapter.
- Bind D1 status into `/api/contracts/status`.
- Run build verification in the target deployment environment.
