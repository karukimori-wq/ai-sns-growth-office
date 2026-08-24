export const requiredRepositoryMethods = [
  "listCompanyTasks",
  "listApprovals",
  "getApprovalById",
  "saveApproval",
  "listAppProjects",
  "listMediaAssets",
  "getMediaAssetById",
  "listMediaUploadJobs",
  "getMediaUploadJobById",
  "saveMediaUploadJob",
  "listPublishJobs",
  "savePublishJob",
  "listContentDrafts",
  "getContentDraftById",
  "listPerformanceSnapshots"
];

export function assertRepositoryContract(repository) {
  const missing = requiredRepositoryMethods.filter((method) => typeof repository?.[method] !== "function");

  if (missing.length > 0) {
    throw new Error(`Repository contract missing methods: ${missing.join(", ")}`);
  }

  return true;
}
