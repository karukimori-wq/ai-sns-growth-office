# External Intelligence Record: AI SNS Growth Office Sprint 1 JSON Table Repository

Date: 2026-08-25

## Purpose

Record the database-shaped repository step before Cloudflare D1 binding.

AI SNS Growth Office needs durable persistence, but the existing API handler surface is currently synchronous. This step validates the table layout and repository contract with a JSON table store before wiring the implementation to a real D1 binding.

## Implemented Changes

### JSON Table Repository

Added `src/domain/json-table-repository.mjs`.

It implements the existing repository contract using database-shaped JSON tables:

- `company_tasks`
- `approval_requests`
- `app_projects`
- `content_drafts`
- `media_assets`
- `media_upload_jobs`
- `publish_jobs`
- `performance_snapshots`

The repository supports:

- list records by table and workspace
- get record by id
- upsert record
- workspace-scoped records
- structured clone protection for in-memory tests

### Migration

Added `migrations/0001_ai_sns_growth_office_json_tables.sql`.

The migration creates the initial source-of-truth tables for AI SNS Growth Office owned records.

Each table uses:

- `id text primary key`
- `workspace_id text not null default 'default_workspace'`
- `record text not null`
- `created_at text not null`
- `updated_at text not null`
- `workspace_id` index

`record` is stored as text for D1/SQLite compatibility and should contain serialized JSON.

### Repository Factory

Updated `src/domain/repository-factory.mjs`.

Supported drivers now include:

- `seed`
- `json_table`

Planned drivers still include:

- `d1`
- `postgres`

`json_table` is an intermediate driver that proves the database-shaped repository can satisfy the same repository contract and workflow behavior.

### Roundtrip Tests

Added `tests/json-table-repository.test.mjs`.

Covered flows:

- approval persistence
- media upload job creation and update
- publish job creation
- approval handler update persistence

## Verification

Command run locally:

```bash
node --test tests/*.test.mjs
```

Result:

- 28 tests passed.
- 0 tests failed.

Build verification was not run in the scratch workspace because `node_modules` is not installed.

## Current Persistence Status

The app now has a database-shaped repository implementation, but production D1 binding is not wired yet.

Current driver behavior:

- `seed`: supported, default
- `json_table`: supported, in-memory database-shaped store
- `d1`: planned, still falls back to seed
- `postgres`: planned, still falls back to seed

## Next Required Work

1. Add an async D1 adapter or a D1-compatible repository layer.
2. Decide whether API handlers should become async now, or whether a boot-time repository cache should be used.
3. Wire Cloudflare D1 binding into repository runtime.
4. Update `/api/contracts/status` to report `d1Configured`, `d1Reachable`, and `databaseBackedPersistenceReady`.
5. Run build verification in the target Cloudflare deployment environment.
