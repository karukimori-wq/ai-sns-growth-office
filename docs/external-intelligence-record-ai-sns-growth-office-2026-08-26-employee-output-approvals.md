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
- Added sync and async test coverage for deduplicated approval creation.
- Added sync and async test coverage for employee output materialization.
- Added sync and async test coverage for publish approval creation after media readiness.

## Verification

```bash
node --test tests/*.test.mjs
./node_modules/.bin/tsc --noEmit
```

Expected result: 73 tests pass and typecheck passes.

## Remaining Work

- Add dashboard controls for selecting a generated draft/media pair before final publish approval.
