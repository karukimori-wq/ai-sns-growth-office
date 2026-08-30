# External Intelligence Record: UX Revert Pass

Date: 2026-08-30
Repository: karukimori-wq/ai-sns-growth-office

## User Signal

The previous UI pass added several explanatory blocks that made the experience feel worse on mobile.

- The bottom menu was raised too high.
- Home did not need the added "Company creates / Operations runs" cards.
- Company did not need explanatory step cards for strategy, planning, and post creation.
- Company did not need extra KPI cards for strategy, drafts, and approvals.
- Company task/agent tabs should remain sticky under the mobile browser address bar while scrolling.
- Operations did not need the explanatory management/reaction/analysis/improvement cards.
- Operation project cards should remain collapsible.

## Changes

- Removed the Home workflow overview cards.
- Removed Company step explanation cards and extra Company KPI summary cards.
- Lowered and tightened the mobile bottom navigation.
- Kept Company tabs sticky at the top of the page flow.
- Removed Operations stage explanation cards.
- Restored collapsible Operation project cards using native details/summary behavior.

## Intent

Keep the interface closer to the earlier compact task-first design: fewer explanations, fewer added panels, and more direct controls.
