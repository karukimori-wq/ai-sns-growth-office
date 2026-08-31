export const requiredRepositoryMethods = [
  "listCompanyTasks",
  "saveCompanyTask",
  "listCeoInstructions",
  "saveCeoInstruction",
  "listEmployeeTasks",
  "saveEmployeeTask",
  "listApprovals",
  "getApprovalById",
  "saveApproval",
  "listAppProjects",
  "listMarketingContents",
  "getMarketingContentById",
  "saveMarketingContent",
  "deleteMarketingContent",
  "listSnsAccounts",
  "getSnsAccountById",
  "saveSnsAccount",
  "deleteSnsAccount",
  "listMediaAssets",
  "getMediaAssetById",
  "saveMediaAsset",
  "listMediaUploadJobs",
  "getMediaUploadJobById",
  "saveMediaUploadJob",
  "listPublishJobs",
  "getPublishJobById",
  "savePublishJob",
  "listContentDrafts",
  "getContentDraftById",
  "saveContentDraft",
  "listPerformanceSnapshots",
  "savePerformanceSnapshot"
];

export function assertRepositoryContract(repository) {
  const missing = requiredRepositoryMethods.filter((method) => typeof repository?.[method] !== "function");

  if (missing.length > 0) {
    throw new Error(`Repository contract missing methods: ${missing.join(", ")}`);
  }

  return true;
}
