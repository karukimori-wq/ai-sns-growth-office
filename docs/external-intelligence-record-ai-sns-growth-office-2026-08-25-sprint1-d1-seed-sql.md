# External Intelligence Record: Sprint 1 D1 Seed SQL

Date: 2026-08-25

## Context

The D1 repository driver can read and write through the JSON table store, but a newly migrated D1 database starts empty.

The CEO dashboard needs initial owned records for company tasks, approvals, app projects, content drafts, media assets, and performance snapshots.

## Decision

Add a reusable seed data module and SQL generator.

Command:

```bash
npm run d1:seed:sql
```

The generated SQL uses:

- the AI SNS Growth Office owned tables
- `workspace_id`
- JSON record payloads
- `insert ... on conflict(id) do update`

This makes the MVP seed data idempotent and safe to re-apply during early D1 deployment setup.

## Verification

Commands:

```bash
node scripts/generate-d1-seed-sql.mjs
node --test tests/*.test.mjs
```

Result:

- Seed SQL generated successfully.
- 39 tests passed.
- 0 tests failed.

## Remaining Work

- Apply `migrations/0001_ai_sns_growth_office_json_tables.sql` to the real D1 database.
- Apply the generated seed SQL to the real D1 database.
- Verify `/api/contracts/status` and dashboard data against the deployed app.
