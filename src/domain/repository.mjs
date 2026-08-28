import {
  appProjects,
  approvalRequests,
  ceoInstructions,
  companyTasks,
  contentDrafts,
  employeeTasks,
  mediaAssets,
  mediaUploadJobs,
  marketingContents,
  performanceSnapshots,
  publishJobs
} from "./seed.mjs";
import { assertRepositoryContract } from "./repository-contract.mjs";

export function createSeedRepository() {
  const seedRepository = {
    listCompanyTasks: () => companyTasks,
    saveCompanyTask: (task) => upsertById(companyTasks, task),
    listCeoInstructions: () => ceoInstructions,
    saveCeoInstruction: (instruction) => upsertById(ceoInstructions, instruction),
    listEmployeeTasks: () => employeeTasks,
    saveEmployeeTask: (task) => upsertById(employeeTasks, task),
    listApprovals: () => approvalRequests,
    getApprovalById: (id) => approvalRequests.find((item) => item.id === id) ?? null,
    saveApproval: (approval) => upsertById(approvalRequests, approval),
    listAppProjects: () => appProjects,
    listMarketingContents: () => marketingContents,
    getMarketingContentById: (id) => marketingContents.find((item) => item.id === id) ?? null,
    saveMarketingContent: (content) => upsertById(marketingContents, content),
    listMediaAssets: () => mediaAssets,
    getMediaAssetById: (id) => mediaAssets.find((item) => item.id === id) ?? null,
    saveMediaAsset: (asset) => upsertById(mediaAssets, asset),
    listMediaUploadJobs: () => mediaUploadJobs,
    getMediaUploadJobById: (id) => mediaUploadJobs.find((item) => item.id === id) ?? null,
    saveMediaUploadJob: (job) => upsertById(mediaUploadJobs, job),
    listPublishJobs: () => publishJobs,
    getPublishJobById: (id) => publishJobs.find((item) => item.id === id) ?? null,
    savePublishJob: (job) => upsertById(publishJobs, job),
    listContentDrafts: () => contentDrafts,
    getContentDraftById: (id) => contentDrafts.find((item) => item.id === id) ?? null,
    saveContentDraft: (draft) => upsertById(contentDrafts, draft),
    listPerformanceSnapshots: () => performanceSnapshots,
    savePerformanceSnapshot: (snapshot) => upsertById(performanceSnapshots, snapshot)
  };

  assertRepositoryContract(seedRepository);

  return seedRepository;
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
