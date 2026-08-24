# External Intelligence Record: AI SNS Growth Office Sprint 1 Repository Runtime Factory

Date: 2026-08-25

## Purpose

Record the repository runtime factory work for AI SNS Growth Office.

This change prepares the app for D1 or Postgres persistence without changing API route handlers again.

## Implemented Changes

### Repository Factory

Added `src/domain/repository-factory.mjs`.

The factory reads `AI_SNS_REPOSITORY_DRIVER` and currently supports:

- `seed`

Planned drivers are explicitly listed for future implementation:

- `seed`
- `d1`
- `postgres`

Current behavior:

- Missing driver defaults to `seed`.
- Unknown driver normalizes to `seed`.
- `d1` or `postgres` are reported as planned but not implemented, and fallback to seed is explicitly marked.

### Repository Runtime Export

Added `src/domain/repository-runtime.mjs`.

It exports:

- `repository`
- `repositoryRuntimeStatus`

API routes now import runtime repository state from this file instead of importing the seed repository directly.

### Contracts Status

Updated `GET /api/contracts/status` to include repository runtime state:

- `requestedDriver`
- `activeDriver`
- `supportedRepositoryDrivers`
- `plannedRepositoryDrivers`
- `durablePersistenceRequested`
- `databaseBackedPersistenceReady`
- `fallbackUsed`
- `issues`

This gives Platform Admin and professional-platform-contracts a stable place to inspect persistence readiness.

### API Routes Updated

The following routes now use `src/domain/repository-runtime.mjs`:

- `GET /api/company-tasks`
- `GET /api/approvals`
- `POST /api/approvals/{approvalId}/approve`
- `POST /api/approvals/{approvalId}/revision`
- `GET /api/app-projects`
- `GET /api/media-assets`
- `GET /api/media-upload-jobs`
- `POST /api/media-upload-jobs`
- `GET /api/publish-jobs`
- `POST /api/publish-jobs`
- `GET /api/performance-snapshots`

## Verification

Command run locally:

```bash
node --test tests/*.test.mjs
```

Result:

- 26 tests passed.
- 0 tests failed.

Build verification was not run in the scratch workspace because `node_modules` is not installed.

## Current Persistence Status

Runtime persistence is still seed-backed.

`AI_SNS_REPOSITORY_DRIVER=d1` will currently report:

- `requestedDriver: "d1"`
- `activeDriver: "seed"`
- `durablePersistenceRequested: true`
- `databaseBackedPersistenceReady: false`
- `fallbackUsed: true`

This is intentional until the first database-backed implementation is added.

## Next Required Work

- Decide initial production persistence target: Cloudflare D1 is likely the best fit for the user's Cloudflare cost direction.
- Add D1 repository implementation behind the existing repository contract.
- Add D1 roundtrip tests for approval, media upload job, and publish job persistence.
- Update `/api/contracts/status` to report D1 configured/reachable once implemented.
- Sync the endpoint readiness status to `professional-platform-contracts`.
