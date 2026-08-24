# AI SNS Growth Office Requirements v1.0

Date: 2026-08-24

## 1. Product Summary

AI SNS Growth Office is an AI-agent-operated SNS marketing company app.

The user acts as CEO. The Secretary AI receives the CEO's intent, turns it into structured work, assigns it to specialized AI departments, collects outputs, and returns approval-ready decisions to the CEO.

This product is not a simple SNS post generator. Its core promise is to build the path from SNS attention to purchase.

Core principle:

> Do not only create posts. Design the route from "I do not know you" to "I want to buy from you."

## 2. Target User

Primary target:

- Individual professionals and small businesses that post on SNS but do not convert attention into inquiries, bookings, or sales.
- Initial fit: fortune tellers, coaches, consultants, creators, SNS operators, and small service businesses.

Operator:

- The app owner or business owner who gives instructions as CEO.
- The owner should not need to manually manage every AI task.

## 3. MVP Product Name

Working name:

- AI SNS Growth Office

Alternative names:

- Agent Company OS
- AI Company Dashboard
- SNS Growth Agent Office

## 4. Company Model

The app models a company with AI-only staff.

| Role | Responsibility |
| --- | --- |
| CEO | Gives direction, sets priorities, approves strategy, approves customer-facing output |
| Secretary AI | Converts CEO intent into tasks, assigns work, summarizes results, escalates approvals |
| AI Departments | Execute specialized work and collaborate through structured handoffs |

## 5. AI Departments

MVP departments:

| Department | Main Responsibility |
| --- | --- |
| Secretary AI | Intake, task decomposition, progress reporting, approval routing |
| Market Research AI | Market, competitor, trend, and reference account research |
| Customer Insight AI | Audience pain, desire, misunderstanding, objection, and buying trigger analysis |
| Offer Design AI | Offer positioning, target fit, service contents, promise, unsuitable customers |
| SNS Strategy AI | Overall route from recognition to trust to inquiry to sale |
| Funnel Design AI | Profile, pinned post, lead magnet, DM, consultation, purchase route design |
| Content Planning AI | Weekly/monthly content plan across attraction, education, proof, values, sales |
| Content Production AI | Post copy, short video scripts, carousel outlines, DM scripts, sales copy |
| Quality Control AI | Checks exaggeration, unsafe claims, mismatch, privacy risk, and brand consistency |
| Analytics AI | Diagnoses bottlenecks using impressions, profile visits, follows, DMs, consultations, sales |

## 6. Marketing Doctrine

The system must follow this doctrine:

1. Revenue is not explained by impressions alone.
2. SNS revenue comes from prospect volume, educated ratio, conversion rate, and unit price.
3. The first decision is not "what to post" but "who is moved from what state to what result."
4. Customer understanding means understanding pain, failed attempts, beliefs, fear, desired future, and objections.
5. Attraction, education, proof, personality, and sales posts have different jobs.
6. Education means changing the customer's judgment criteria, not only giving knowledge.
7. Sales means showing the right next step to the right person, not forcing a purchase.
8. DM is a diagnosis room, not a pressure sales room.
9. Analytics must identify where the route is blocked.
10. AI accelerates execution but cannot replace clear positioning and customer understanding.

## 7. Core Workflow

1. CEO creates an instruction.
2. Secretary AI normalizes the instruction into a Secretary Brief.
3. Secretary AI creates Department Tasks.
4. Departments execute tasks and return Department Outputs.
5. Secretary AI composes an Executive Summary.
6. Quality Control AI checks output before CEO approval.
7. CEO approves, requests revision, or rejects.
8. Approved outputs are sent to the relevant app or exported.
9. Analytics AI records performance and recommends the next correction.

## 8. Main User Screens

The attached desktop and mobile mockups define the initial UI direction.

### 8.1 CEO Dashboard

Must show:

- Active AI agents
- In-progress tasks
- Completed today
- Items requiring CEO approval
- Agent progress table/list
- Company task list
- CEO approval queue
- Main schedule or important milestones

Desktop layout:

- Left sidebar navigation
- Main KPI cards across top
- Agent progress and task table in main area
- Approval queue and schedule on right side

Mobile layout:

- Bottom navigation
- KPI cards in a 2-column grid
- Approval queue appears before agent progress
- Company tasks visible below progress

### 8.2 Agent Management

Must show:

- Department name
- Agent role
- Current status
- Current task
- Progress
- Last update
- Blockers
- Assigned client or project

### 8.3 Task Management

Must support:

- Company tasks
- Department tasks
- CEO approval tasks
- Priority: high, medium, low
- Status: queued, in_progress, waiting_approval, revision_requested, approved, completed, blocked
- Due date
- Owner agent
- Related client
- Related deliverable

### 8.4 Client Workspace

Must store:

- Client profile
- Offer
- Audience
- Current SNS channels
- Current bottleneck
- Strategy
- Funnel
- Content plan
- Approved outputs
- Performance snapshots

### 8.5 Strategy Board

Must visualize:

- Unknown
- Interested
- Needs it
- Wants to buy from this provider
- Buys
- Repeats or refers

Each stage should contain:

- Customer belief
- Required message
- Content role
- CTA
- Metric

### 8.6 Approval Center

Must show:

- What requires approval
- Which AI proposed it
- Why approval is needed
- Risk level
- Summary
- Output preview
- Approve / request revision / reject actions

## 9. MVP Outputs

The first MVP should generate:

| Output | Description |
| --- | --- |
| SNS Route Diagnosis | Identifies where sales are blocked |
| Audience Insight Sheet | Pain, desire, misunderstanding, objections, buying triggers |
| Offer Positioning Sheet | Who it is for, what it solves, why this offer, who it is not for |
| Profile Improvement Plan | Bio, account promise, pinned post direction, CTA |
| 30-Day SNS Route Plan | Content sequence from attraction to education to sale |
| Weekly Content Plan | Balanced plan across five post types |
| Post Drafts | Drafts for attraction, education, proof, values, and sales |
| DM Flow | Consent-based reply flow and diagnosis questions |
| CEO Approval Summary | Decision-ready summary for the owner |

## 10. Data Model

MVP source-of-truth entities:

| Entity | Description |
| --- | --- |
| Workspace | Tenant boundary |
| CEOInstruction | Original user instruction |
| SecretaryBrief | Structured interpretation of CEO intent |
| Department | AI department definition |
| Agent | AI worker assigned to a department |
| DepartmentTask | Work assigned to an AI department |
| DepartmentOutput | Result from an AI department |
| Client | Supported business or professional |
| Offer | Client's product or service |
| Audience | Target customer segment |
| Funnel | Buyer's route from attention to purchase |
| FunnelStage | Each stage of customer movement |
| ContentPlan | Planned content calendar |
| ContentDraft | Generated draft |
| ApprovalRequest | Item requiring CEO decision |
| PerformanceSnapshot | Metrics at a point in time |
| DiagnosisReport | AI diagnosis of route bottlenecks |
| ExternalKnowledgeReference | Knowledge retrieved from External Intelligence |

## 11. Existing App Boundaries

AI SNS Growth Office should coordinate existing apps, not duplicate their source-of-truth responsibilities.

| App | Relationship |
| --- | --- |
| Growth Engine | Owns sales route, booking, campaign, lead/customer growth workflow |
| SNS Planner | Owns SNS post and message draft production surfaces |
| Communication Planner | Owns 1-to-1 inbox, person context, reply drafts, safety checks, and mis-send prevention |
| AI Platform Core | Owns AI activity/runtime/usage logging and capability execution records |
| Platform Admin | Owns operational monitoring snapshots |
| External Intelligence | Stores and retrieves reusable development knowledge, decisions, rules, and evidence |
| professional-platform-contracts | Owns cross-app contracts and responsibility boundaries |

This app may hold orchestration state and work summaries. It must not become the source of truth for messages, reservations, payments, AI usage, or cross-app contracts.

## 12. External Intelligence Requirements

The app must use External Intelligence in this pattern:

1. Before requirement changes or development, search relevant project knowledge.
2. Attach retrieved knowledge references to the current planning session.
3. Use retrieved knowledge to avoid repeating prior mistakes.
4. Record final decisions, architecture changes, tests, failures, and fixes after work.
5. Do not expose raw secrets or private identifiers in intelligence records.
6. Promote repeated patterns into reusable rules only after validation.

MVP intelligence events:

| Event | Purpose |
| --- | --- |
| intelligence.search.requested.v1 | Search for relevant prior knowledge |
| intelligence.search.completed.v1 | Record what knowledge was retrieved |
| intelligence.experience.recorded.v1 | Record development result or decision |
| intelligence.rule.candidate.created.v1 | Propose a reusable rule after repeated evidence |

## 13. API Draft

Health and contracts:

- GET /health
- GET /version
- GET /contracts/status

CEO and Secretary:

- POST /api/ceo/instructions
- GET /api/ceo/instructions
- GET /api/ceo/approval-requests
- POST /api/ceo/approval-requests/{approvalRequestId}/approve
- POST /api/ceo/approval-requests/{approvalRequestId}/request-revision
- POST /api/ceo/approval-requests/{approvalRequestId}/reject
- POST /api/secretary/briefs
- GET /api/secretary/briefs/{briefId}

Agents and departments:

- GET /api/departments
- GET /api/agents
- GET /api/agents/{agentId}
- GET /api/department-tasks
- POST /api/department-tasks
- GET /api/department-tasks/{taskId}

Client and strategy:

- POST /api/clients
- GET /api/clients
- GET /api/clients/{clientId}
- POST /api/clients/{clientId}/offers
- POST /api/clients/{clientId}/audiences
- POST /api/clients/{clientId}/diagnosis-reports
- POST /api/clients/{clientId}/funnels
- POST /api/clients/{clientId}/content-plans

External Intelligence:

- POST /api/intelligence/search
- POST /api/intelligence/experience-records

## 14. Stable Events Draft

- ai_company.ceo_instruction.created.v1
- ai_company.secretary_brief.created.v1
- ai_company.department_task.created.v1
- ai_company.department_task.completed.v1
- ai_company.department_output.created.v1
- ai_company.approval.requested.v1
- ai_company.approval.completed.v1
- ai_company.client.created.v1
- ai_company.offer.created.v1
- ai_company.audience.created.v1
- ai_company.funnel.created.v1
- ai_company.content_plan.created.v1
- ai_company.diagnosis_report.created.v1
- ai_company.external_intelligence.referenced.v1

## 15. Safety and Quality Rules

The system must:

- Keep CEO approval before customer-facing output is sent or published.
- Clearly separate draft, approved, and sent states.
- Avoid fabricated results, fake testimonials, fake revenue screenshots, or unsupported claims.
- Avoid manipulative pressure tactics.
- Keep DM flows consent-based.
- Avoid mixing clients, audiences, offers, or conversations across workspaces.
- Record provenance for AI outputs and source knowledge.
- Use clear revision history for approved outputs.

## 16. MVP Success Criteria

MVP is successful when:

1. CEO can enter a business goal or client request.
2. Secretary AI can turn the request into a structured brief.
3. Multiple departments can produce specialized outputs.
4. CEO Dashboard shows active agents, tasks, approvals, and progress.
5. A client can receive a SNS route diagnosis.
6. The app can generate a 30-day route plan and first-week draft set.
7. CEO approval is required before final output is marked approved.
8. External Intelligence references are attached to the planning session.
9. Development decisions are recorded back as reusable experience.

## 17. Sprint 1 Scope

Sprint 1 should build the planning foundation.

Deliverables:

- Requirements document
- Domain model
- API contract draft
- Event catalog draft
- Dashboard UI specification from attached mockups
- First implementation skeleton
- Seed data for departments, agents, tasks, and approvals
- Local tests for status transitions and workspace boundaries

Out of scope for Sprint 1:

- Automatic posting to SNS
- Live DM sending
- Payment processing
- Full analytics integration
- Fully autonomous rule promotion in External Intelligence
