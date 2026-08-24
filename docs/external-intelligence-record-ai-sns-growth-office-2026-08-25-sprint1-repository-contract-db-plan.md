# External Intelligence Record: AI SNS Growth Office Sprint 1 Repository Contract and DB Plan

Date: 2026-08-25

## Purpose

Record the repository contract hardening work and the database-backed repository migration plan for AI SNS Growth Office.

This record exists so future implementation agents can replace the seed repository with D1 or Postgres without changing the route handlers, domain workflows, or CEO dashboard behavior.

## Implemented Changes

### Repository Contract Guard

Added `src/domain/repository-contract.mjs`.

It defines the required repository methods used by current API handlers and domain workflows:

- `listCompanyTasks`
- `listApprovals`
- `getApprovalById`
- `saveApproval`
- `listAppProjects`
- `listMediaAssets`
- `getMediaAssetById`
- `listMediaUploadJobs`
- `getMediaUploadJobById`
- `saveMediaUploadJob`
- `listPublishJobs`
- `savePublishJob`
- `listContentDrafts`
- `getContentDraftById`
- `listPerformanceSnapshots`

The guard throws a clear error when a repository implementation is missing required methods.

### Seed Repository Validation

Updated `src/domain/repository.mjs` so `createSeedRepository()` validates the seed implementation against the repository contract before returning it.

This makes future persistence driver regressions visible early.

### Repository Tests

Updated `tests/repository.test.mjs` with contract coverage:

- Seed repository satisfies the contract.
- Contract lists the methods required by the current API handler surface.
- Contract fails fast when a method is missing.

## Database-backed Repository Plan

Added `docs/database-backed-repository-plan.md`.

Planned initial tables:

- `company_tasks`
- `approval_requests`
- `app_projects`
- `content_drafts`
- `media_assets`
- `media_upload_jobs`
- `publish_jobs`
- `performance_snapshots`

Minimum MVP column shape:

- `id text primary key`
- `workspace_id text not null default 'default_workspace'`
- `record json not null`
- `created_at text not null`
- `updated_at text not null`

Planned driver names:

- `seed`
- `d1`
- `postgres`

Planned migration order:

1. Add database-backed repository implementation behind the repository contract.
2. Add repository factory selection by environment variable.
3. Keep seed fallback for local and preview environments.
4. Add roundtrip tests for approval, media upload, and publish persistence.
5. Update `/api/contracts/status` with repository driver and persistence readiness.
6. Run build verification in the target deployment environment.

## Verification

Command run locally:

```bash
node --test tests/*.test.mjs
```

Result:

- 23 tests passed.
- 0 tests failed.

Build verification was not run in the scratch workspace because `node_modules` is not installed.

## Boundaries Preserved

AI SNS Growth Office still coordinates marketing operations only.

It does not become the source of truth for:

- Customer master data.
- Reservations.
- Payments.
- AI usage/activity records.
- Numeria reports.
- Communication messages or inbox context.
- Generic SNS Planner `PostDraft` records.

## Next Required Work

- Implement repository factory selection by environment variable.
- Add the first database-backed repository implementation.
- Update `/api/contracts/status` to expose repository driver and persistence readiness.
- Sync the current endpoint contract expectations to `professional-platform-contracts`.
- Run build verification in the deployment environment.
