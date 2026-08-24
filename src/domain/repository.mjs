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
    saveApproval: (approval) => upsertById(approvalRequests, approval),
    listAppProjects: () => appProjects,
    listMediaAssets: () => mediaAssets,
    getMediaAssetById: (id) => mediaAssets.find((item) => item.id === id) ?? null,
    listMediaUploadJobs: () => mediaUploadJobs,
    getMediaUploadJobById: (id) => mediaUploadJobs.find((item) => item.id === id) ?? null,
    saveMediaUploadJob: (job) => upsertById(mediaUploadJobs, job),
    listPublishJobs: () => publishJobs,
    savePublishJob: (job) => upsertById(publishJobs, job),
    listContentDrafts: () => contentDrafts,
    getContentDraftById: (id) => contentDrafts.find((item) => item.id === id) ?? null,
    listPerformanceSnapshots: () => performanceSnapshots
  };
}

export const repository = createSeedRepository();

function upsertById(collection, record) {
  const existingIndex = collection.findIndex((item) => item.id === record.id);

  if (existingIndex === -1) {
    collection.push(record);
    return record;
  }

  collection[existingIndex] = record;
  return record;
}
