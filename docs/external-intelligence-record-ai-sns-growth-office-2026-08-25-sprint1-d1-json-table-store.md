# External Intelligence Record: Sprint 1 D1 JSON Table Store

Date: 2026-08-25

## Context

AI SNS Growth Office needs durable persistence without changing the API and workflow surface already implemented for approvals, media upload jobs, publish jobs, and dashboard reads.

The existing `json_table` repository proved that owned records can be stored through a small `list/get/upsert` table-store interface.

## Decision

Implement Cloudflare D1 support as a D1-backed JSON table store behind the same repository contract.

The `d1` repository driver is now supported when a D1 binding is supplied through one of:

- `AI_SNS_D1_DATABASE`
- `DB`
- `AI_SNS_GROWTH_OFFICE_DB`

If `AI_SNS_REPOSITORY_DRIVER=d1` is requested without a D1 binding, runtime falls back to `seed` and reports the missing binding in repository status.

## Safety and Boundary Rules

- Use D1 prepared statements and `.bind()` for workspace ID, record ID, and record JSON.
- Restrict table names to the AI SNS Growth Office owned table allowlist.
- Keep source-of-truth boundaries unchanged. AI SNS Growth Office still does not own customer master, reservation, payment, AI usage, Communication messages, Numeria reports, or SNS Planner generic PostDrafts.

## Verification

Command:

```bash
node --test tests/*.test.mjs
```

Result:

- 33 tests passed
- 0 tests failed

## Remaining Work

- Bind the real D1 database in the target Cloudflare/Next runtime.
- Run the SQL migration against the real D1 database.
- Verify `/api/contracts/status` reports `activeDriver: "d1"` and `databaseBackedPersistenceReady: true`.
- Run build verification in the target deployment environment.
