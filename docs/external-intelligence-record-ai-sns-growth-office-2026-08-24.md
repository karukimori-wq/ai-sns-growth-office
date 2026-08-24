# External Intelligence Record: AI SNS Growth Office

Date: 2026-08-24
Project: AI SNS Growth Office
Record type: requirement_start

## Context

The user wants to build a company operated by AI agents.

The user is CEO. A Secretary AI receives CEO instructions, communicates intent to specialized AI departments, coordinates work, and brings approval-ready results back to the CEO.

The business domain is an SNS marketing company.

The central doctrine is:

> People who fail at SNS only make posts. People who win design the road to purchase.

The user provided desktop and mobile dashboard mock images. They should be treated as the initial CEO Dashboard UI direction.

## Retrieved Knowledge Used

External Intelligence architecture assumptions:

- External Intelligence stores real work as Experience, promotes repeated validated patterns into Rules or Skills, and keeps provenance.
- PostgreSQL is the source of truth for Experience.
- GitHub is used for validated Rule, Skill, and Policy artifacts.
- R2 or equivalent object storage is used for evidence.
- MCP-style access should expose search and record operations, not raw database access.
- MVP should prioritize Canonical Event Schema, provenance, agent-to-experience ingest, search, retrieval telemetry, and secret handling.
- Automatic promotion, graph database, and custom dashboard are not MVP requirements.

Existing platform assumptions:

- Growth Engine owns growth, sales route, reservation, and customer development workflows.
- SNS Planner owns post and message draft production.
- Communication Planner owns 1-to-1 communication, inbox, context, reply drafts, safety checks, and mis-send prevention.
- AI Platform Core owns AI runtime/activity/usage records.
- Platform Admin owns operational monitoring.
- professional-platform-contracts owns cross-app contracts.

## Decisions

1. Create a new app concept named AI SNS Growth Office.
2. Position it as an orchestration layer for an AI-agent SNS marketing company.
3. Do not make it a replacement for Growth Engine, SNS Planner, Communication Planner, AI Platform Core, Platform Admin, or professional-platform-contracts.
4. The app may own CEO instructions, secretary briefs, department tasks, approval requests, strategy work summaries, and dashboard state.
5. The app must not own reservations, payments, direct messages, AI usage, or cross-app contract truth.
6. The first screen is the CEO Dashboard, based on the provided desktop and mobile mockups.
7. Human CEO approval is mandatory before customer-facing output is considered approved.
8. External Intelligence must be used before and after development work.

## Proposed Departments

- Secretary AI
- Market Research AI
- Customer Insight AI
- Offer Design AI
- SNS Strategy AI
- Funnel Design AI
- Content Planning AI
- Content Production AI
- Quality Control AI
- Analytics AI

## First MVP

The first MVP should create:

- CEO Dashboard
- Agent progress
- Company task list
- Approval queue
- Client workspace
- SNS route diagnosis
- Audience insight sheet
- Offer positioning sheet
- 30-day SNS route plan
- First-week content draft set

## Open Questions

1. Should the repository be a new repo or part of Growth Engine?
2. Should the initial user be only the owner, or should clients have a read-only portal later?
3. Which name should be official: AI SNS Growth Office, Agent Company OS, or another name?
4. Should the first business domain remain fortune tellers, or should it start with general individual professionals?

## Next Actions

1. Create or choose repository.
2. Add requirement document.
3. Add contracts for API and events.
4. Add dashboard UI specification from mockups.
5. Implement static MVP dashboard with seed data.
6. Implement core domain model and task status transitions.
7. Add tests for workspace separation, approval gate, and task lifecycle.
