# Database-backed Repository Plan

Date: 2026-08-25

## Purpose

AI SNS Growth Office currently uses a seed-backed repository with in-process persistence.

The next durable step is to replace the repository implementation without changing API handlers, workflow rules, or UI behavior.

## Repository Contract

The required repository methods are defined in:

- `src/domain/repository-contract.mjs`

Every repository implementation must satisfy this contract before use.

Required method groups:

- Company task reads
- Approval reads and writes
- App project reads
- Media asset reads
- Media upload job reads and writes
- Publish job reads and writes
- Content draft reads
- Performance snapshot reads

## Initial Tables

The first database-backed implementation should use separate tables for source-of-truth records owned by AI SNS Growth Office:

- `company_tasks`
- `approval_requests`
- `app_projects`
- `content_drafts`
- `media_assets`
- `media_upload_jobs`
- `publish_jobs`
- `performance_snapshots`

Initial migration:

- `migrations/0001_ai_sns_growth_office_json_tables.sql`

## Minimum Columns

Use explicit IDs and JSON payloads for early velocity.

Recommended minimum columns for every table:

- `id text primary key`
- `workspace_id text not null default 'default_workspace'`
- `record json not null`
- `created_at text not null`
- `updated_at text not null`

Indexes:

- `workspace_id`
- frequently queried foreign IDs inside dedicated columns once usage stabilizes

## Migration Order

1. Add database repository implementation behind the existing repository contract.
2. Add repository factory selection by environment variable.
3. Keep seed repository as fallback for local development.
4. Add roundtrip tests for approval, media upload job, and publish job persistence.
5. Convert API routes and mutation handlers to await repository methods for D1-compatible async persistence.
6. Update `/api/contracts/status` to expose repository driver and persistence readiness.
7. Run build verification in the target deployment environment.

## Driver Names

Use stable driver names:

- `seed`
- `json_table`
- `d1`
- `postgres`

`json_table` is the intermediate repository driver used to validate database-shaped persistence with the same table layout before binding the implementation to Cloudflare D1.

`d1` is implemented through a D1-backed JSON table store. It requires a D1 database binding to be provided as `AI_SNS_D1_DATABASE`, `DB`, or `AI_SNS_GROWTH_OFFICE_DB`.

## Non-goals

Do not move source-of-truth responsibilities from other apps into AI SNS Growth Office.

AI SNS Growth Office should not become the source of truth for:

- Customer master
- Reservation
- Payment
- AI usage
- Numeria reports
- Communication inbox/messages
- SNS Planner generic PostDrafts

## Current Verification

The repository contract and API handler behavior are covered by Node standard tests.

Command:

```bash
node --test tests/*.test.mjs
```

Current result:

- 33 tests passed
- 0 tests failed

## Async Repository Readiness

The API route layer now awaits repository reads and writes, and mutation workflows have async handler variants for approval, revision, media upload job creation, and publish job creation.

The original synchronous handlers remain available for direct domain tests and seed repository compatibility.

## D1 Adapter Readiness

The first D1 adapter is implemented as a JSON table store behind the existing repository contract.

It uses D1 prepared statements and parameter binding for workspace, ID, and record values. Table names are limited to the AI SNS Growth Office owned table allowlist.

If `AI_SNS_REPOSITORY_DRIVER=d1` is requested without a D1 binding, the runtime falls back to `seed` and reports the missing binding in `/api/contracts/status`.
