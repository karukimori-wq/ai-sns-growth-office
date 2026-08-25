export const stableEvents = [
  "ai_company.ceo_instruction.created.v1",
  "ai_company.secretary_brief.created.v1",
  "ai_company.secretary_dispatch.created.v1",
  "ai_company.ceo_confirmation_agenda.created.v1",
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

export const apiEndpoints = [
  { method: "GET", path: "/api/health", status: "implemented" },
  { method: "GET", path: "/api/version", status: "implemented" },
  { method: "GET", path: "/api/contracts/status", status: "implemented" },
  { method: "GET", path: "/api/daily-brief", status: "implemented" },
  { method: "GET", path: "/api/ceo-confirmation-agenda", status: "implemented" },
  { method: "GET", path: "/api/secretary-dispatch-plan", status: "implemented" },
  { method: "POST", path: "/api/ceo-instructions", status: "implemented" },
  { method: "GET", path: "/api/company-tasks", status: "implemented" },
  { method: "GET", path: "/api/employee-tasks", status: "implemented" },
  { method: "GET", path: "/api/approvals", status: "implemented" },
  { method: "POST", path: "/api/approvals/{approvalId}/approve", status: "implemented" },
  { method: "POST", path: "/api/approvals/{approvalId}/revision", status: "implemented" },
  { method: "GET", path: "/api/content-drafts", status: "implemented" },
  { method: "GET", path: "/api/media-assets", status: "implemented" },
  { method: "POST", path: "/api/media-upload-jobs", status: "implemented" },
  { method: "POST", path: "/api/media-upload-jobs/{mediaUploadJobId}/manual-ready", status: "implemented" },
  { method: "POST", path: "/api/publish-jobs", status: "implemented" },
  { method: "GET", path: "/api/performance-snapshots", status: "implemented" },
  { method: "GET", path: "/api/performance-recommendations", status: "implemented" }
];

export function createContractStatus({ repository }) {
  return {
    status: "success",
    app: "ai-sns-growth-office",
    requirements: "v1.3",
    ownerFirst: true,
    firstCampaign: "Numeria Studio",
    firstChannel: "x",
    repository,
    stableEvents,
    apiEndpoints
  };
}
