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
- Dashboard UI sections for Approval Center, Image Assets, X Publish Queue, and Daily Metrics.
- Client-side approval actions connected to the approval APIs.
- Approval follow-up action orchestration for image media upload jobs and publish queue gating.
- Seed repository persistence helpers for approvals, media upload jobs, and publish jobs.
- Seed data for stats, AI employees, CEO approvals, company tasks, schedules, app projects, content drafts, media assets, publish jobs, and performance snapshots.
- Seed repository abstraction for later D1/Postgres replacement.
- API endpoints:
  - `GET /api/health`
  - `GET /api/version`
  - `GET /api/contracts/status`
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
- Domain workflow logic for approval, revision, approval follow-up actions, X media upload blocking, X publish blocking, daily metric normalization, and bottleneck calculation.
- Node standard tests for repository, approval, approval follow-up actions, media upload, publish, and metrics rules.

Verification:

```bash
node --test tests/*.test.mjs
```

Result: 13 tests passed, 0 failed.

Build verification has not been run in this scratch workspace because `node_modules` is not installed.

See:

- [Requirements v1.3](docs/ai-sns-growth-office-requirements-v1.3.md)
- [Sprint 1 Implementation Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-implementation.md)
- [Sprint 1 API Expansion Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-api-expansion.md)
- [Sprint 1 Repository Abstraction Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-repository-abstraction.md)
- [Sprint 1 UI Expansion Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-ui-expansion.md)
- [Sprint 1 Client Approval Actions Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-client-approval-actions.md)
- [Sprint 1 Approval Follow-up Actions Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-25-sprint1-approval-follow-up-actions.md)
- [External Intelligence Record v1.3](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24-v1.3.md)
- [Requirements v1.2](docs/ai-sns-growth-office-requirements-v1.2.md)
- [External Intelligence Record v1.2](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24-v1.2.md)
- [Requirements v1.1](docs/ai-sns-growth-office-requirements-v1.1.md)
- [External Intelligence Record v1.1](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24-v1.1.md)
- [Requirements v1.0](docs/ai-sns-growth-office-requirements-v1.md)
- [External Intelligence Record v1.0](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24.md)

## Next Sprint

Next implementation targets:

- Route-level API tests.
- Database-backed repository implementation after contracts are stable.
- professional-platform-contracts endpoint update.
- Build verification in the target deployment environment.
