# AI SNS Growth Office External Intelligence Record

Date: 2026-08-26

## Scope

Connected approval-required employee task outputs to CEO approval requests.

## Changes

- Added approval request creation from employee task outputs.
- Mapped route design, X draft, and image direction outputs to strategy, draft, and image asset approvals.
- Status updates now return `approvalRequest` when an approval is created or already exists.
- Non-approval outputs return `approvalRequest: null`.
- Employee task updates notify Approval Center so new approval requests appear without a page reload.
- Approved employee draft outputs materialize into content draft records.
- Approved employee image outputs materialize into media asset records before media upload follow-up job creation.
- Approval follow-up actions notify Execution Queue so created media upload and publish jobs appear without a page reload.
- Materialized content drafts and media assets notify dashboard panels so approved employee outputs appear without a page reload.
- Publish approval requests are created without duplicates after draft, image, and media readiness gates are satisfied.
- Added `/api/publish-approval-requests` so the CEO can request final publish approval for a selected ready draft/media pair.
- Added dashboard controls in the X publish queue for selecting the draft/media pair and desired publish time before final approval.
- X publish queue selection now refreshes when media upload readiness changes.
- Added sync and async test coverage for deduplicated approval creation.
- Added sync and async test coverage for employee output materialization.
- Added sync and async test coverage for publish approval creation after media readiness.
- Added sync and async test coverage for selected draft/media publish approval requests.
- Added regression coverage so approved publish requests create publish jobs from the selected draft/media/upload pair.

## Verification

```bash
node --test tests/*.test.mjs
./node_modules/.bin/tsc --noEmit
```

Expected result: 79 tests pass and typecheck passes.

## Remaining Work

- Persist selected publish approval and publish job execution through the production D1 deployment.
