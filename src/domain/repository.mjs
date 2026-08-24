import {
  appProjects,
  approvalRequests,
  companyTasks,
  contentDrafts,
  mediaAssets,
  mediaUploadJobs,
  performanceSnapshots,
  publishJobs
} from "./seed.mjs";

export function createSeedRepository() {
  return {
    listCompanyTasks: () => companyTasks,
    listApprovals: () => approvalRequests,
    getApprovalById: (id) => approvalRequests.find((item) => item.id === id) ?? null,
    listAppProjects: () => appProjects,
    listMediaAssets: () => mediaAssets,
    getMediaAssetById: (id) => mediaAssets.find((item) => item.id === id) ?? null,
    listMediaUploadJobs: () => mediaUploadJobs,
    getMediaUploadJobById: (id) => mediaUploadJobs.find((item) => item.id === id) ?? null,
    listPublishJobs: () => publishJobs,
    getContentDraftById: (id) => contentDrafts.find((item) => item.id === id) ?? null,
    listPerformanceSnapshots: () => performanceSnapshots
  };
}

export const repository = createSeedRepository();
