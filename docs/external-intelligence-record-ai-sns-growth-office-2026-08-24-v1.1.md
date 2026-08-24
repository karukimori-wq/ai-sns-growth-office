# External Intelligence Record: AI SNS Growth Office v1.1

Date: 2026-08-24
Project: AI SNS Growth Office
Record type: requirement_refinement
Repository: karukimori-wq/ai-sns-growth-office

## User Decisions Captured

The user answered the initial requirement questions.

Confirmed:

- Initial use is owner-only.
- Initial purpose is marketing the owner's own apps.
- Later expansion is to fortune tellers and client support.
- Initial operation mode is internal company operation.
- Later operation mode is customer support / SaaS.
- The first marketing domain is the owner's self-built apps, not a generic client niche.
- Approval should have about three levels.
- UI should separate company task progress and employee/agent progress.
- SNS Planner may become unnecessary in the future.
- MVP should include CEO dashboard, SNS route diagnosis, and 30-day content/funnel planning.
- AI should generate drafts only.
- CEO approval is required for publish or schedule actions.
- Product display name remains AI SNS Growth Office.

## Requirement Changes

The requirements were refined from v1.0 to v1.1.

Main changes:

1. Added product phases:
   - Phase 1: owner internal marketing
   - Phase 2: client support
   - Phase 3: SaaS
2. Added AppProject as a first-class entity for owner-built apps.
3. Split task model into CompanyTask and AgentTask.
4. Added three-stage approval model:
   - Strategy approval
   - Draft approval
   - Publish/schedule approval
5. Clarified that SNS Planner remains a current boundary but may be absorbed later.
6. Added PublishPlan and publish/schedule approval blocking.
7. Added v1.2 open questions for SNS channel scope, first promoted app, metrics, and Phase 1 UI visibility.

## Architectural Notes

AI SNS Growth Office should be treated as an orchestration layer, not as the source of truth for all marketing platform data.

For Phase 1, the core object is AppProject because the owner is marketing the owner's own apps.

Client and ClientWorkspace are later-phase concepts and should not dominate the MVP implementation.

The UI should avoid hiding the AI company metaphor completely. The user wants both task progress and employee-by-employee progress.

## Safety Notes

Publishing and scheduling must stay behind CEO approval.

The product should not create fake evidence, fake testimonials, fake revenue, or unsupported claims.

DM flows should remain consent-based.

## Next Questions

Before implementation, ask:

1. Which owner-built app is the first target?
2. Which SNS channel is first?
3. Should scheduling be real integration or proposal/export only in MVP?
4. Which metrics are manually tracked first?
5. Should Phase 1 hide client-support features?
