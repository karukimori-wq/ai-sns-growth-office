# AI SNS Growth Office

AI SNS Growth Office is an AI-agent-operated SNS marketing company app.

The owner acts as CEO. A Secretary AI receives CEO instructions, converts them into structured work, assigns tasks to specialized AI employees/departments, and brings approval-ready results back to the CEO.

This is not a simple SNS post generator. The product is designed around one core principle:

> Do not only create posts. Design the route from "I do not know you" to "I want to buy from you."

## Confirmed Direction

The initial product is owner-only and is used to market the owner's own apps.

First concrete campaign:

- Numeria Studio

Secondary marketing target:

- Velvet

Initial SNS channel:

- X

Initial content format:

- Japanese text plus images

Metric cadence:

- Daily if possible

Later, it may expand into customer support and SaaS for fortune tellers and other individual professionals.

## MVP Concept

The first MVP is a CEO dashboard and orchestration layer for an AI-only SNS marketing company.

It coordinates:

- CEO instructions
- Secretary briefs
- Company tasks
- AI employee tasks
- Agent progress
- Three-stage CEO approvals
- App marketing workspaces
- Numeria Studio SNS route diagnosis
- 30-day Japanese X content route planning
- Image concepts and media assets
- Draft generation before publish/schedule approval
- X media upload jobs
- X publish/schedule queue
- Daily manual performance metrics and bottleneck diagnosis

## Approval Model

MVP uses three approval stages:

1. Strategy approval
2. Draft approval
3. Publish/schedule approval

AI may generate drafts and prepare image assets, but uploading final media, publishing, or scheduling requires CEO approval.

## AI Employees

MVP employees/departments:

- Secretary AI
- Market Research AI
- Customer Insight AI
- Offer Design AI
- SNS Strategy AI
- Funnel Design AI
- Content Planning AI
- Content Production AI
- Image Direction AI
- Quality Control AI
- Analytics AI

## Platform Boundaries

AI SNS Growth Office coordinates existing platform apps. It should not duplicate their source-of-truth responsibilities.

| App | Responsibility |
| --- | --- |
| Growth Engine | Growth, sales route, booking, lead/customer growth workflows |
| SNS Planner | Current SNS post and message draft production surface; may be absorbed later |
| Communication Planner | 1-to-1 communication, inbox, context, reply draft safety, mis-send prevention |
| AI Platform Core | AI runtime, activity, and usage records |
| Platform Admin | Operational monitoring snapshots |
| External Intelligence | Reusable development knowledge, decisions, rules, and evidence |
| professional-platform-contracts | Cross-app contracts and responsibility boundaries |

## Current Status

Requirements were created on 2026-08-24 and refined to the Numeria Studio-first X image campaign workflow in v1.3.

Sprint 1 implementation started on 2026-08-25. The repository now includes:

- Next.js App Router skeleton.
- CEO dashboard first screen.
- Dashboard UI sections for Approval Center, Image Assets, X Publish Queue, Daily Metrics, and Daily Improvement Actions.
- Client-side approval actions connected to the approval APIs.
- Testable API handler layer used by approval, revision, media upload, and publish routes.
- Async API handler variants for D1-compatible promise-returning repository implementations.
- Next API routes that await repository reads and writes.
- Approval follow-up action orchestration for image media upload jobs and publish queue gating.
- Seed repository persistence helpers for approvals, media upload jobs, and publish jobs.
- Repository contract guard that fails fast when a persistence implementation is missing required methods.
- Repository runtime factory selected by `AI_SNS_REPOSITORY_DRIVER`.
- `json_table` repository driver for database-shaped persistence roundtrip validation.
- `d1` repository driver backed by a Cloudflare D1 JSON table store when a D1 binding is available.
- Repository readiness report used by `/api/contracts/status` to expose `d1Configured`, `d1Reachable`, and final persistence readiness.
- Initial SQL migration for AI SNS Growth Office owned JSON tables.
- D1 seed SQL generator via `npm run d1:seed:sql` for initial dashboard data.
- Cloudflare D1 deployment checklist and Wrangler reference config.
- `/api/contracts/status` repository driver and persistence readiness reporting.
- `/api/persistence/status` for direct repository readiness checks.
- `/api/persistence/roundtrip` for write/read persistence verification.
- Daily performance action plan generation for the Analytics AI and CEO dashboard.
- Daily performance action materialization so CEO-approved KPI corrections become employee tasks without duplicates.
- Employee task board refreshes immediately when KPI correction tasks are materialized.
- Employee task status updates so CEO can move AI employee work through progress, approval, and completion states.
- Employee task output generation so approval-ready task results are visible from the employee task board.
- Approval-required employee task outputs create deduplicated CEO approval requests for strategy, draft, and image asset review.
- Approval Center refreshes immediately when employee task updates create approval requests.
- Approved employee draft and image outputs materialize into content draft and media asset records.
- Content draft and image asset panels refresh immediately when approved employee outputs materialize.
- Execution Queue refreshes immediately when approval follow-up actions create media upload or publish jobs.
- Publish approval requests are created without duplicates after draft, image, and media readiness gates are satisfied.
- CEO can select a generated draft/media pair and request final publish approval from the X publish queue.
- `/api/publish-approval-requests` creates a deduplicated final publish approval for a selected ready draft/media pair.
- X publish queue selection refreshes when media upload readiness changes, so CEO can continue without reloading.
- Database-backed repository implementation plan for later D1/Postgres replacement.
- Seed data for stats, AI employees, CEO approvals, company tasks, schedules, app projects, content drafts, media assets, publish jobs, and performance snapshots.
- Seed repository abstraction for later D1/Postgres replacement.
- API endpoints:
  - `GET /api/health`
  - `GET /api/version`
  - `GET /api/contracts/status`
  - `GET /api/persistence/status`
  - `POST /api/persistence/roundtrip`
  - `GET /api/company-tasks`
  - `GET /api/approvals`
  - `POST /api/approvals/{approvalId}/approve`
  - `POST /api/approvals/{approvalId}/revision`
  - `GET /api/app-projects`
  - `GET /api/media-assets`
  - `GET /api/media-upload-jobs`
  - `POST /api/media-upload-jobs`
  - `GET /api/publish-jobs`
  - `POST /api/publish-approval-requests`
  - `POST /api/publish-jobs`
  - `POST /api/publish-jobs/{publishJobId}/manual-required`
  - `POST /api/publish-jobs/{publishJobId}/manual-published`
  - `POST /api/publish-jobs/{publishJobId}/cancel`
  - `GET /api/performance-snapshots`
  - `POST /api/performance-snapshots`
  - `GET /api/performance-recommendations`
  - `POST /api/performance-actions/materialize`
  - `POST /api/employee-tasks/{employeeTaskId}/status`
- Domain workflow logic for approval, revision, approval follow-up actions, X media upload blocking, X publish blocking, daily metric normalization, and bottleneck calculation.
- Node standard tests for sync and async API handlers, repository, repository contract, repository factory, repository readiness, repository seed SQL, JSON table roundtrip, D1 JSON table store, approval, approval follow-up actions, media upload, publish, and metrics rules.

Verification:

```bash
node --test tests/*.test.mjs
```

Result: 79 tests passed, 0 failed.

Build verification:

```bash
npm run build
```

Result: Completed successfully. Next.js compiled, generated 27 static pages, and finalized build traces.

D1 seed SQL generation:

```bash
npm run d1:seed:sql
```

Cloudflare D1 deployment preparation:

- `wrangler.example.jsonc`
- `docs/cloudflare-d1-deployment-checklist.md`

Live Cloudflare D1 application remains external to this chat environment because no Cloudflare write tool is available here for database creation, migration application, seed SQL application, or bound deployment.

See:

- [Requirements v1.3](docs/ai-sns-growth-office-requirements-v1.3.md)
- [Database-backed Repository Plan](docs/database-backed-repository-plan.md)
- [Cloudflare D1 Deployment Checklist](docs/cloudflare-d1-deployment-checklist.md)
- [Sprint 1 Cloudflare D1 Deployment Prep Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-cloudflare-d1-deployment-prep.md)
- [Sprint 1 Implementation Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-implementation.md)
- [Sprint 1 API Expansion Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-api-expansion.md)
- [Sprint 1 Repository Abstraction Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-repository-abstraction.md)
- [Sprint 1 UI Expansion Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-ui-expansion.md)
- [Sprint 1 Client Approval Actions Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-client-approval-actions.md)
- [Sprint 1 Approval Follow-up Actions Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-approval-follow-up-actions.md)
- [Sprint 1 Repository Contract and DB Plan Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-repository-contract-db-plan.md)
- [Sprint 1 Repository Runtime Factory Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-repository-runtime-factory.md)
- [Sprint 1 JSON Table Repository Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-json-table-repository.md)
- [Sprint 1 Async Repository Handlers Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-async-repository-handlers.md)
- [Sprint 1 D1 JSON Table Store Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-d1-json-table-store.md)
- [Sprint 1 Contracts Status Readiness Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-contracts-status-readiness.md)
- [Sprint 1 D1 Seed SQL Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-d1-seed-sql.md)
- [External Intelligence Record v1.3](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24-v1.3.md)
- [Employee Task Output Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-26-employee-task-output.md)
- [Employee Output Approvals Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-26-employee-output-approvals.md)
- [Requirements v1.2](docs/ai-sns-growth-office-requirements-v1.2.md)
- [External Intelligence Record v1.2](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24-v1.2.md)
- [Requirements v1.1](docs/ai-sns-growth-office-requirements-v1.1.md)
- [External Intelligence Record v1.1](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24-v1.1.md)
- [Requirements v1.0](docs/ai-sns-growth-office-requirements-v1.md)
- [External Intelligence Record v1.0](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24.md)

## Seven-step Deployment Status

As of 2026-08-25:

1. D1 binding: prepared in `wrangler.example.jsonc`; real Cloudflare database creation/binding remains external.
2. Schema migration: migration file exists; real Cloudflare D1 apply remains external.
3. Seed data: SQL generator exists and is covered by tests; real Cloudflare D1 apply remains external.
4. Contracts status verification: endpoint and readiness logic implemented; live `d1Configured: true` check requires deployed D1 binding.
5. Dashboard verification: repository paths are ready; live persistence verification requires deployed D1 binding.
6. Build verification: Node test suite and TypeScript verification pass locally; `npm run build` must be rerun in a non-interrupted execution environment.
7. Contracts repository update: `professional-platform-contracts` has been updated with AI SNS Growth Office D1 readiness documentation.

## Next Sprint

Next implementation targets:

- Create or bind the real Cloudflare D1 database named `ai-sns-growth-office` with binding `DB`.
- Apply the SQL migration to the real D1 database.
- Apply generated D1 seed SQL to the real D1 database.
- Deploy with `AI_SNS_REPOSITORY_DRIVER=d1` and `AI_SNS_WORKSPACE_ID=default_workspace`.
- Verify `/api/contracts/status` reports `d1Configured: true`, `d1Reachable: true`, and `databaseBackedPersistenceReady: true`.
- Verify `/api/persistence/status` reports the active production repository driver.
- Verify `POST /api/persistence/roundtrip` returns `roundtripReady: true`.
- Verify dashboard approval changes persist after reload.
- Run build verification in the target deployment environment.
