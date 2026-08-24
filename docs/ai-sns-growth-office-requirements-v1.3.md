# AI SNS Growth Office Requirements v1.3

Date: 2026-08-24
Repository: karukimori-wq/ai-sns-growth-office

## 1. Product Summary

AI SNS Growth Office is an AI-agent-operated SNS marketing company app.

The owner acts as CEO. The Secretary AI receives CEO instructions, converts them into structured work, assigns tasks to specialized AI employees/departments, gathers results, and returns decision-ready outputs to the CEO.

This product is not a simple SNS post generator. It designs and manages the route from SNS attention to purchase.

Core principle:

> Do not only create posts. Design the route from "I do not know you" to "I want to buy from you."

## 2. Confirmed Direction

| Topic | Decision |
| --- | --- |
| Initial user | Owner-only use |
| Initial purpose | Marketing the owner's own apps |
| First concrete campaign | Numeria Studio |
| Secondary marketing target | Velvet |
| First SNS channel | X |
| Initial content format | Japanese text plus images |
| Initial language | Japanese only |
| Metric entry cadence | Daily if possible |
| Later expansion | SaaS for fortune tellers and other individual professionals |
| Initial business mode | Internal company operation |
| Later business mode | Client support / customer-facing SNS marketing support |
| MVP deliverables | CEO dashboard, SNS route diagnosis, 30-day route plan, Japanese X drafts, image plans/assets, publish queue, daily metrics |
| Automation level | Draft and asset preparation only; publishing and scheduling require CEO approval |
| Publishing direction | Real X publishing/scheduling integration is intended |
| Product name | AI SNS Growth Office |
| Repository | karukimori-wq/ai-sns-growth-office |

## 3. Product Phases

### Phase 1: Owner Internal Marketing

The first version is used only by the owner to market the owner's own apps.

First campaign:

- Numeria Studio

Secondary campaign:

- Velvet

Future promoted apps:

- Growth Engine
- Communication Planner
- AI Platform Core
- Platform Admin
- AI SNS Growth Office itself
- Future owner-built apps

The app should help the owner decide:

- Which app should be promoted now
- Who the target customer is
- What problem the app solves
- What route should move a prospect from awareness to purchase or inquiry
- What content should be created today and this week
- Which drafts and images require approval
- What should be improved based on daily numbers

### Phase 2: Client Support

After internal use is proven, the app expands to support external clients.

Initial external client segment:

- Fortune tellers
- Coaches
- Consultants
- Individual professional service providers

Client support should reuse the same company structure, but each client must have isolated workspace data.

### Phase 3: SaaS

Later, each customer may operate their own AI SNS marketing company inside the product.

The product may become a Business plan feature in the broader Professional Platform.

## 4. CEO and Approval Model

The owner is the CEO. AI may propose strategy, plans, copy, images, and schedules, but the CEO remains the final decision-maker.

MVP uses a three-stage approval model.

| Stage | Meaning | Examples |
| --- | --- | --- |
| Stage 1: Strategy Approval | Approve direction before production starts | Target, offer angle, funnel, campaign theme, image direction |
| Stage 2: Draft Approval | Approve generated assets before scheduling | X posts, threads, image drafts/assets, profile copy, pinned post, DM template, landing page copy |
| Stage 3: Publish/Schedule Approval | Approve final release action | Publish now, schedule, upload image to X, attach media, export |

Rules:

- AI can generate drafts and prepare image assets without approval.
- AI cannot publish, schedule, send, upload final media, or mark customer-facing output final without CEO approval.
- Every approval request must show the proposing AI, reason, risk, expected outcome, and related app.
- Revision requests must preserve the prior version and reason.
- Publish/schedule approval creates a PublishPlan and may create XMediaUploadJob and XPublishJob records.

## 5. AI Company Structure

The UI should support two related views:

1. Company task progress
2. Employee/agent-by-agent progress

This means the system must distinguish between:

- CompanyTask: business-level work the company needs to complete
- AgentTask: concrete work assigned to one AI employee or department

Example:

| Company Task | Agent Tasks |
| --- | --- |
| Create today's X campaign route for Numeria Studio | Market Research AI researches audience, SNS Strategy AI drafts route, Content AI creates posts, Image AI creates visual direction, QC AI reviews |

## 6. AI Employees and Departments

MVP employees/departments:

| AI Employee | Role |
| --- | --- |
| Secretary AI | Receives CEO instructions, decomposes tasks, coordinates work, reports progress |
| Market Research AI | Researches market, competitors, trends, and reference accounts |
| Customer Insight AI | Identifies customer pain, desires, misconceptions, objections, and buying triggers |
| Offer Design AI | Clarifies product promise, target fit, offer content, and unsuitable customers |
| SNS Strategy AI | Designs the overall awareness-to-purchase route |
| Funnel Design AI | Designs profile, pinned post, lead magnet, DM, consultation, and purchase route |
| Content Planning AI | Creates daily/weekly/monthly plans across attraction, education, proof, values, and sales |
| Content Production AI | Creates Japanese X posts, threads, reply prompts, and sales copy drafts |
| Image Direction AI | Creates image concepts, image requirements, and visual consistency checks |
| Quality Control AI | Checks exaggeration, mismatch, weak logic, privacy risk, image risk, and brand consistency |
| Analytics AI | Diagnoses bottlenecks from daily metrics and proposes focused improvements |

## 7. Marketing Doctrine

The system must follow these principles.

1. SNS revenue is not explained by impressions alone.
2. Revenue depends on prospect count, educated ratio, conversion rate, and unit price.
3. The first decision is not what to post, but who is moved from what state to what result.
4. Customer understanding means identifying pain, failed attempts, beliefs, fear, desired future, and objections.
5. Attraction, education, proof, values, and sales posts have different jobs.
6. Education means changing the customer's judgment criteria, not only giving knowledge.
7. Sales means showing the right next step to the right person.
8. DM is a diagnosis room, not a pressure sales room.
9. Analytics must identify where the route is blocked.
10. AI accelerates execution, but cannot replace clear positioning and customer understanding.
11. Images should support the route, not exist only as decoration.

## 8. MVP Deliverables

MVP must include all these areas.

### 8.1 CEO Dashboard and AI Company Task Management

The dashboard is the first screen.

It must show:

- Active AI employees
- Company tasks in progress
- Tasks completed today
- Items requiring CEO approval
- AI employee progress
- Company task list
- Approval queue
- Today's schedule or milestones
- Pending X media upload jobs
- Pending X publish/schedule jobs
- Daily metric entry status

The provided desktop and mobile mock images are the initial UI reference.

### 8.2 Numeria Studio SNS Route Diagnosis

The first diagnosis target is Numeria Studio.

The system must diagnose why X activity is not leading to inquiries, trials, bookings, or sales.

Diagnosis areas:

- Target clarity
- Offer clarity
- Profile strength
- Pinned post / first-view guidance
- Content role balance
- Education sequence
- Trust/proof
- Image consistency and visual credibility
- CTA quality
- DM or consultation route
- Trial, booking, or purchase route
- Metrics bottleneck

### 8.3 30-Day X Route Plan and Draft Set

The system must create:

- 30-day X route plan for Numeria Studio
- Daily/weekly content plan
- Attraction posts
- Education posts
- Proof posts
- Values/personality posts
- Sales posts
- Image concept for each image-based post
- Image asset or image generation prompt
- Profile improvement draft
- Pinned post draft
- DM entry flow draft
- PublishPlan draft

## 9. Main Screens

| Screen | Purpose |
| --- | --- |
| CEO Dashboard | Overview of company state, approvals, tasks, agent progress, X schedule, and metric entry |
| Secretary Inbox | CEO instructions and Secretary AI briefs |
| Company Tasks | Business-level task list |
| AI Employees | Agent-by-agent task and progress view |
| Approval Center | Strategy, draft, image, and publish/schedule approvals |
| App Marketing Workspace | Strategy and content route for Numeria Studio, Velvet, and future apps |
| X Content Calendar | 30-day X plan and weekly draft set |
| Image Assets | Image concepts, generation prompts, uploaded assets, and approval state |
| X Publish Queue | Approved media upload and publish/schedule jobs |
| Strategy Board | Route from unknown to interested to purchase |
| Daily Metrics | Daily manual metric entry and missing-entry alerts |
| Analytics Report | Funnel metrics and bottleneck diagnosis |
| Settings | Workspace, approval rules, X integration, External Intelligence integration |

Client Workspace is a later-phase screen and should be hidden or secondary in Phase 1.

## 10. Data Model

MVP source-of-truth entities:

| Entity | Description |
| --- | --- |
| Workspace | Tenant boundary |
| AppProject | Owner-built app being marketed |
| CEOInstruction | Original CEO instruction |
| SecretaryBrief | Structured interpretation of CEO intent |
| CompanyTask | Business-level work item |
| Agent | AI employee |
| AgentTask | Task assigned to an AI employee |
| AgentOutput | Result produced by an AI employee |
| ApprovalRequest | Strategy, draft, image, or publish/schedule approval |
| MarketingRoute | Route from awareness to purchase |
| RouteStage | Stage in the customer's mental movement |
| Audience | Target customer segment |
| Offer | Product or service being marketed |
| DiagnosisReport | Route bottleneck diagnosis |
| ContentPlan | 30-day, weekly, or daily plan |
| ContentDraft | Draft Japanese X content asset |
| ImageConcept | Visual direction for an image-based post |
| MediaAsset | Generated or uploaded image asset |
| PublishPlan | Proposed publish or schedule action |
| XMediaUploadJob | X media upload job created only after CEO approval |
| XPublishJob | X publishing/scheduling job created only after CEO approval |
| PerformanceSnapshot | Daily metrics at a point in time |
| ExternalKnowledgeReference | Knowledge retrieved from External Intelligence |

Later external-client entities:

| Entity | Description |
| --- | --- |
| Client | External customer being supported |
| ClientWorkspace | Isolated client workspace |
| ClientOffer | Client's product or service |
| ClientAudience | Client's target customer |

## 11. Existing App Boundaries

AI SNS Growth Office is the AI company orchestration layer.

Current boundary:

| App | Current Role |
| --- | --- |
| Growth Engine | Sales route, campaigns, booking, customer development |
| SNS Planner | Current SNS draft creation and content planning surface |
| Communication Planner | DM, inbox, person context, reply draft safety, mis-send prevention |
| AI Platform Core | AI runtime, activity, usage, capability records |
| Platform Admin | Operational monitoring |
| External Intelligence | Development knowledge, decisions, reusable rules, evidence |
| professional-platform-contracts | Cross-app responsibility and integration contracts |

Expected future:

- AI SNS Growth Office may absorb most SNS Planner functions.
- Until that migration is explicit, SNS Planner remains the source of truth for SNS PostDraft and MessageDraft.
- AI SNS Growth Office may create orchestration tasks and content requirements, then send draft work to SNS Planner.
- Communication Planner remains responsible for actual 1-to-1 communication and mis-send prevention.

## 12. X Integration Requirements

MVP target channel is X.

The system should support real publishing/scheduling integration, including image-based posts. The app must keep its own approved publish queue as the source of truth for scheduling intent.

Reason:

- X posting requires authenticated API access.
- X media upload requires a separate upload step before the post can attach the media.
- X API permissions, rate limits, and plan constraints may change.
- The app should remain useful even when X API execution is unavailable.

Required behavior for text-only posts:

1. AI creates Japanese X draft.
2. CEO approves draft.
3. CEO approves publish/schedule.
4. System creates XPublishJob.
5. If X integration is configured, the job is executed at the scheduled time.
6. If X integration is not configured or fails, the job remains exportable/manual.

Required behavior for image-based posts:

1. AI creates Japanese X draft and image concept.
2. Image asset is generated or uploaded.
3. CEO approves text draft and image asset.
4. CEO approves publish/schedule.
5. System creates XMediaUploadJob.
6. If media upload succeeds, system records X media id.
7. System creates or proceeds with XPublishJob using the media id.
8. If media upload or publishing fails, the job remains retryable or manual_required.
9. Failures must not delete the approved draft, image asset, or schedule intent.

XMediaUploadJob status:

- queued
- uploading
- uploaded
- failed
- cancelled
- manual_required

XPublishJob status:

- queued
- scheduled
- publishing
- published
- failed
- cancelled
- manual_required

## 13. Daily Metrics Proposal

MVP should start with daily manual metric entry, then later add API-based import.

Recommended daily metrics:

| Metric | Why It Matters |
| --- | --- |
| impressions | Measures top-of-funnel reach |
| profile_visits | Shows whether posts create interest in the account or app |
| follows | Measures retained interest |
| engagement_count | Lightweight signal for post resonance |
| cta_clicks | Measures movement toward the intended next action |
| landing_page_visits | Measures movement from X to Numeria Studio |
| trial_or_signup_count | Measures concrete product interest |
| purchase_count | Measures conversion |
| revenue | Measures business result |

Optional metrics for later:

- dm_or_reply_count
- consultation_or_booking_count
- saves_or_bookmarks
- reposts
- image_clicks_or_media_engagement if available

MVP dashboard should show both raw numbers and bottleneck rates:

- profile_visit_rate = profile_visits / impressions
- follow_rate = follows / profile_visits
- cta_click_rate = cta_clicks / impressions
- landing_page_rate = landing_page_visits / cta_clicks
- signup_rate = trial_or_signup_count / landing_page_visits
- purchase_rate = purchase_count / trial_or_signup_count

Daily entry rule:

- Show a daily metric entry reminder.
- Allow "not available" for metrics the owner cannot obtain that day.
- Allow partial save.
- Analytics AI should use available metrics and mark missing metrics as unknown, not zero.

## 14. External Intelligence Requirements

External Intelligence must be used as a development knowledge layer.

Required pattern:

1. Before requirement changes or development, search relevant project knowledge.
2. Attach retrieved knowledge references to the current planning session.
3. Use retrieved knowledge to avoid repeated mistakes.
4. Record final decisions, architecture changes, tests, failures, and fixes after work.
5. Do not expose raw secrets or private identifiers in intelligence records.
6. Do not let External Intelligence become the product's operational source of truth.

## 15. API Draft

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

Company and agents:

- GET /api/company-tasks
- POST /api/company-tasks
- GET /api/company-tasks/{companyTaskId}
- GET /api/agents
- GET /api/agents/{agentId}
- GET /api/agent-tasks
- POST /api/agent-tasks
- GET /api/agent-tasks/{agentTaskId}

Marketing workspaces:

- GET /api/app-projects
- POST /api/app-projects
- GET /api/app-projects/{appProjectId}
- POST /api/app-projects/{appProjectId}/diagnosis-reports
- POST /api/app-projects/{appProjectId}/marketing-routes
- POST /api/app-projects/{appProjectId}/content-plans
- POST /api/app-projects/{appProjectId}/content-drafts
- POST /api/app-projects/{appProjectId}/image-concepts
- POST /api/app-projects/{appProjectId}/media-assets
- POST /api/app-projects/{appProjectId}/publish-plans
- GET /api/x/media-upload-jobs
- POST /api/x/media-upload-jobs
- GET /api/x/media-upload-jobs/{xMediaUploadJobId}
- GET /api/x/publish-jobs
- POST /api/x/publish-jobs
- GET /api/x/publish-jobs/{xPublishJobId}
- POST /api/x/publish-jobs/{xPublishJobId}/cancel
- POST /api/x/publish-jobs/{xPublishJobId}/mark-manual-required

Metrics:

- POST /api/app-projects/{appProjectId}/performance-snapshots
- GET /api/app-projects/{appProjectId}/performance-snapshots
- GET /api/app-projects/{appProjectId}/analytics/bottlenecks

External Intelligence:

- POST /api/intelligence/search
- POST /api/intelligence/experience-records

## 16. Stable Events Draft

- ai_company.ceo_instruction.created.v1
- ai_company.secretary_brief.created.v1
- ai_company.company_task.created.v1
- ai_company.company_task.completed.v1
- ai_company.agent_task.created.v1
- ai_company.agent_task.completed.v1
- ai_company.agent_output.created.v1
- ai_company.approval.requested.v1
- ai_company.approval.completed.v1
- ai_company.app_project.created.v1
- ai_company.offer.created.v1
- ai_company.audience.created.v1
- ai_company.marketing_route.created.v1
- ai_company.content_plan.created.v1
- ai_company.content_draft.created.v1
- ai_company.image_concept.created.v1
- ai_company.media_asset.created.v1
- ai_company.publish_plan.created.v1
- ai_company.x_media_upload_job.created.v1
- ai_company.x_media_upload_job.completed.v1
- ai_company.x_media_upload_job.failed.v1
- ai_company.x_publish_job.created.v1
- ai_company.x_publish_job.completed.v1
- ai_company.x_publish_job.failed.v1
- ai_company.performance_snapshot.recorded.v1
- ai_company.diagnosis_report.created.v1
- ai_company.external_intelligence.referenced.v1

## 17. Status Model

CompanyTask status:

- queued
- in_progress
- waiting_agent_output
- waiting_approval
- revision_requested
- approved
- completed
- blocked

AgentTask status:

- queued
- in_progress
- waiting_dependency
- waiting_review
- completed
- blocked

ApprovalRequest status:

- pending
- approved
- revision_requested
- rejected
- expired

ApprovalRequest type:

- strategy
- draft
- image_asset
- publish_schedule

MediaAsset status:

- draft
- generated
- uploaded
- approved
- revision_requested
- rejected

## 18. Safety and Quality Rules

The system must:

- Require CEO approval before publishing, scheduling, sending, uploading final media to X, or finalizing customer-facing output.
- Keep draft, approved, scheduled, published, uploaded, and sent states separate.
- Avoid fabricated results, fake testimonials, fake revenue screenshots, or unsupported claims.
- Avoid manipulative pressure tactics.
- Keep DM flows consent-based.
- Avoid mixing apps, clients, audiences, offers, media assets, or conversations across workspaces.
- Record provenance for AI outputs, images, and source knowledge.
- Preserve version history for revised and approved outputs.
- Mark AI-generated X content clearly in internal provenance.
- Store enough image metadata to know which post and approval it belongs to.

## 19. MVP Success Criteria

MVP is successful when:

1. CEO can create an instruction for marketing Numeria Studio.
2. Secretary AI can convert that instruction into a structured brief.
3. The system can create company tasks and agent tasks separately.
4. The dashboard can show company-wide progress and employee-by-employee progress.
5. The system can produce a Numeria Studio SNS route diagnosis.
6. The system can produce a 30-day Japanese X route plan.
7. The system can produce Japanese X content drafts with image concepts.
8. The system can store or reference image assets for image-based posts.
9. CEO approval works in three stages, including image approval.
10. Publishing/scheduling remains blocked until CEO approval.
11. Approved image-based X publish jobs are queued and either executed or marked manual_required.
12. Daily manual performance metrics can be recorded and used for bottleneck diagnosis.
13. External Intelligence references and final decisions are recorded.

## 20. Remaining Open Questions

These can be answered during implementation.

1. Which X account will be connected first?
2. Should image assets be generated inside this app, imported from another tool, or both?
3. Should the first landing destination be an existing Numeria Studio page or a new landing page?
4. Which exact time should the daily metric reminder use?
