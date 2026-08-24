import { repositoryRuntimeStatus } from "../../../src/domain/repository-runtime.mjs";

const stableEvents = [
  "ai_company.ceo_instruction.created.v1",
  "ai_company.secretary_brief.created.v1",
  "ai_company.company_task.created.v1",
  "ai_company.company_task.completed.v1",
  "ai_company.agent_task.created.v1",
  "ai_company.agent_task.completed.v1",
  "ai_company.agent_output.created.v1",
  "ai_company.approval.requested.v1",
  "ai_company.approval.completed.v1",
  "ai_company.app_project.created.v1",
  "ai_company.content_draft.created.v1",
  "ai_company.image_concept.created.v1",
  "ai_company.media_asset.created.v1",
  "ai_company.x_media_upload_job.created.v1",
  "ai_company.x_publish_job.created.v1",
  "ai_company.performance_snapshot.recorded.v1"
];

export function GET() {
  return Response.json({
    status: "success",
    app: "ai-sns-growth-office",
    requirements: "v1.3",
    ownerFirst: true,
    firstCampaign: "Numeria Studio",
    firstChannel: "x",
    repository: repositoryRuntimeStatus,
    stableEvents
  });
}
