# AI SNS Growth Office

AI SNS Growth Office is an AI-agent-operated SNS marketing company app.

The owner acts as CEO. A Secretary AI receives CEO instructions, converts them into structured work, assigns tasks to specialized AI departments, and brings approval-ready results back to the CEO.

This is not a simple SNS post generator. The product is designed around one core principle:

> Do not only create posts. Design the route from "I do not know you" to "I want to buy from you."

## MVP Concept

The first MVP is a CEO dashboard and orchestration layer for an AI-only SNS marketing company.

It coordinates:

- CEO instructions
- Secretary briefs
- AI department tasks
- Agent progress
- Approval requests
- Client strategy work
- SNS route diagnosis
- 30-day content route planning

## AI Departments

MVP departments:

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

## Platform Boundaries

AI SNS Growth Office coordinates existing platform apps. It should not duplicate their source-of-truth responsibilities.

| App | Responsibility |
| --- | --- |
| Growth Engine | Growth, sales route, booking, lead/customer growth workflows |
| SNS Planner | SNS post and message draft production surfaces |
| Communication Planner | 1-to-1 communication, inbox, context, reply draft safety, mis-send prevention |
| AI Platform Core | AI runtime, activity, and usage records |
| Platform Admin | Operational monitoring snapshots |
| External Intelligence | Reusable development knowledge, decisions, rules, and evidence |
| professional-platform-contracts | Cross-app contracts and responsibility boundaries |

## Current Status

Initial requirements and External Intelligence record have been created on 2026-08-24.

See:

- [Requirements v1.0](docs/ai-sns-growth-office-requirements-v1.md)
- [External Intelligence Record](docs/external-intelligence-record-ai-sns-growth-office-2026-08-24.md)

## Sprint 1

Sprint 1 should build the planning foundation:

- Requirements document
- Domain model
- API contract draft
- Event catalog draft
- Dashboard UI specification from mockups
- First implementation skeleton
- Seed data for departments, agents, tasks, and approvals
- Tests for workspace separation, approval gate, and task lifecycle
