# External Intelligence Record: AI SNS Growth Office v1.3

Date: 2026-08-24
Project: AI SNS Growth Office
Record type: requirement_refinement
Repository: karukimori-wq/ai-sns-growth-office

## User Decisions Captured

The user answered the remaining v1.2 questions.

Confirmed:

- First concrete campaign: Numeria Studio.
- X MVP should include images.
- Metric entry should be as close to daily as possible.

## Requirement Changes

The requirements were refined from v1.2 to v1.3.

Main changes:

1. Set Numeria Studio as the first concrete campaign.
2. Kept Velvet as a secondary marketing target.
3. Added image-based X posts to MVP.
4. Added ImageDirectionAI as an employee/department.
5. Added ImageConcept and MediaAsset entities.
6. Added XMediaUploadJob entity.
7. Added image approval to the approval model.
8. Added daily manual metric entry requirements.
9. Clarified that missing metrics should be treated as unknown, not zero.

## External Facts Checked

Official X docs indicate:

- Media upload uses `POST /2/media/upload`.
- X posts can attach media by referencing media IDs.
- Image media has file size and type constraints.
- Media upload and post creation are separate steps.

Therefore, the architecture should separate:

- MediaAsset: internal asset/provenance
- XMediaUploadJob: upload execution state
- XPublishJob: final post execution state

## Next Actions

1. Update README to reference requirements v1.3.
2. Add professional-platform-contracts entry for AI SNS Growth Office.
3. Begin implementation with domain model, dashboard seed data, and approval/publish blocking tests.
4. Decide which X account will be connected first.
5. Decide whether images are generated inside this app, imported, or both.
