# External Intelligence Record: AI SNS Growth Office v1.2

Date: 2026-08-24
Project: AI SNS Growth Office
Record type: requirement_refinement
Repository: karukimori-wq/ai-sns-growth-office

## User Decisions Captured

The user answered the v1.2 requirement questions.

Confirmed:

- First marketing target apps: Numeria Studio and Velvet.
- First SNS channel: X.
- MVP should support real publishing/scheduling integration.
- Content language: Japanese only at first.
- Metrics should be proposed by the assistant.

## Metrics Proposal

Recommended MVP metrics:

- impressions
- profile_visits
- profile_visit_rate
- follows
- engagement_count
- cta_clicks
- dm_or_reply_count
- landing_page_visits
- trial_or_signup_count
- consultation_or_booking_count
- purchase_count
- revenue

Initial manual entry priority:

1. impressions
2. profile_visits
3. follows
4. cta_clicks
5. landing_page_visits
6. trial_or_signup_count
7. purchase_count
8. revenue

DM/reply and consultation/booking metrics can be enabled when conversation-based selling becomes part of the route.

## Architectural Decisions

1. Add XPublishJob as a first-class entity.
2. Keep PublishPlan as the approved scheduling intent.
3. Use XPublishJob for actual X execution state.
4. Keep the app useful even if X API execution is unavailable.
5. Failed X execution must not delete approved drafts or schedule intent.
6. Add PerformanceSnapshot and bottleneck analytics as MVP requirements.

## External Facts Checked

The X API supports creating posts through `POST /2/tweets`.

X API access requires authentication and is subject to per-endpoint rate limits.

Therefore, AI SNS Growth Office should store publish/schedule intent internally and treat X execution as an integration job that may fail, retry, or require manual action.

## Next Actions

1. Update README to reference requirements v1.2.
2. Decide whether the first campaign is Numeria Studio or Velvet.
3. Decide whether X MVP is text-only or includes media.
4. Decide daily or weekly metric entry.
5. Begin implementation after contracts are added to professional-platform-contracts.
