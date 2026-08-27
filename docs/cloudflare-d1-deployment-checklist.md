# Cloudflare D1 Deployment Checklist

Date: 2026-08-25

## Purpose

This checklist moves AI SNS Growth Office from local seed data to Cloudflare D1-backed persistence.

## 1. D1 Binding

Create or select a D1 database for this app.

Recommended database name:

- `ai-sns-growth-office`

Expected binding name:

- `DB`

Runtime variables:

- `AI_SNS_REPOSITORY_DRIVER=d1`
- `AI_SNS_WORKSPACE_ID=default_workspace`

Reference config:

- `wrangler.example.jsonc`

Do not reuse another app database such as AI Platform Core. Each app should keep its owned tables in its own database unless a deliberate shared database decision is made.

GitHub Actions can run the D1 production setup after repository secrets are configured:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Run workflow:

- `Cloudflare D1 Production`

Inputs:

- `database_name`: `ai-sns-growth-office`
- `create_database`: `true` for first run, `false` after the database exists
- `deployment_url`: deployed app URL, optional until the app has been deployed

## 2. Schema Migration

Apply:

- `migrations/0001_ai_sns_growth_office_json_tables.sql`

The migration creates the AI SNS Growth Office owned JSON tables:

- `company_tasks`
- `ceo_instructions`
- `employee_tasks`
- `approval_requests`
- `app_projects`
- `content_drafts`
- `media_assets`
- `media_upload_jobs`
- `publish_jobs`
- `performance_snapshots`

## 3. Seed Data

Generate initial dashboard seed SQL:

```bash
npm run d1:seed:sql
```

Apply the generated SQL after the schema migration.

The seed SQL is idempotent and uses `insert ... on conflict(id) do update`.

The `Cloudflare D1 Production` workflow performs schema and seed application together. The workflow calls `node scripts/generate-d1-seed-sql.mjs` directly so npm lifecycle output is not redirected into the SQL file.

## 4. Contracts Status Verification

Check:

- `GET /api/contracts/status`
- `GET /api/persistence/status`
- `POST /api/persistence/roundtrip`

Expected repository values:

```json
{
  "requestedDriver": "d1",
  "activeDriver": "d1",
  "d1Configured": true,
  "d1Reachable": true,
  "databaseBackedPersistenceReady": true,
  "fallbackUsed": false
}
```

Or run the deployment verification helper against the deployed app:

```bash
AI_SNS_DEPLOYMENT_URL=https://your-deployment.example.com npm run d1:verify
```

Expected helper output:

```json
{
  "status": "success",
  "deployment": "https://your-deployment.example.com",
  "repositoryDriver": "d1"
}
```

## 5. Dashboard Verification

Confirm the deployed dashboard shows:

- company tasks
- approval requests
- app projects
- media assets
- performance snapshots

Then approve or request revision on one approval and reload the app. The changed approval state should persist.

## 6. Build Verification

Run in the target deployment environment:

```bash
npm run build
npm test
```

Expected test result:

- 79 tests passed
- 0 tests failed

The standard `CI` workflow runs install, tests, typecheck, and build on main and pull requests.

## 7. Contracts Repository Update

After deployed verification, update `professional-platform-contracts` with:

- AI SNS Growth Office repository entry
- API endpoints
- stable events
- data ownership boundaries
- readiness criteria
