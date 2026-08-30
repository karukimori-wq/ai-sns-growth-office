# External Intelligence Record: Operations Follow-up

Date: 2026-08-30
Repository: karukimori-wq/ai-sns-growth-office

## User Signal

The Operations page needed another pass after separating creation-side work from operation-side work.

- Approval waiting is useful, but it belongs in Instructions, not as the main Operations screen.
- Operations should show active projects after the approved draft is handed over.
- Opening a post from Operations should keep the user in the Operations context and show the post content there.
- Pre-publication checks are creation-side concerns unless they are actual scheduling or execution state.
- The page should show how operation work moves through schedule, reaction, analysis, and improvement.
- Schedules should cover upcoming posts, not only today's items.

## Product Decision

Operations now treats the approved draft as an input, not as a decision item.

The page is organized around stages 4-7:

1. Post management: accepted drafts, schedule state, and publish readiness.
2. Reaction tracking: comments, DMs, clicks, and other post-result signals.
3. Analysis: impressions, profile visits, CTA clicks, and related performance data.
4. Improvement: action items that feed the next creation cycle.

## Implementation Notes

- Project cards now show operation status derived from drafts, publish jobs, and performance snapshots.
- Pending approvals are routed to Instructions through a small notice instead of occupying the Operations surface.
- Draft previews support multiple handed-off posts per project.
- The schedule section lists upcoming operation items instead of only today's schedule.
- Reaction and analysis cards read from performance snapshots and the generated performance action plan instead of hardcoded sample copy.
- Dashboard operation summaries no longer fabricate pending approval counts for sample projects.

## Expected User Outcome

The user can tell what is being operated, where each post sits in the flow, what has been measured, and what should improve next without being sent back to the company creation menu.
