import { assertRepositoryContract } from "./repository-contract.mjs";

const tableNames = {
  companyTasks: "company_tasks",
  ceoInstructions: "ceo_instructions",
  employeeTasks: "employee_tasks",
  approvals: "approval_requests",
  appProjects: "app_projects",
  marketingContents: "marketing_contents",
  contentDrafts: "content_drafts",
  mediaAssets: "media_assets",
  mediaUploadJobs: "media_upload_jobs",
  publishJobs: "publish_jobs",
  performanceSnapshots: "performance_snapshots"
};

export function createJsonTableRepository({ store, workspaceId = "default_workspace" }) {
  const repository = {
    listCompanyTasks: () => listRecords(store, tableNames.companyTasks, workspaceId),
    saveCompanyTask: (task) => upsertRecord(store, tableNames.companyTasks, workspaceId, task),
    listCeoInstructions: () => listRecords(store, tableNames.ceoInstructions, workspaceId),
    saveCeoInstruction: (instruction) => upsertRecord(store, tableNames.ceoInstructions, workspaceId, instruction),
    listEmployeeTasks: () => listRecords(store, tableNames.employeeTasks, workspaceId),
    saveEmployeeTask: (task) => upsertRecord(store, tableNames.employeeTasks, workspaceId, task),
    listApprovals: () => listRecords(store, tableNames.approvals, workspaceId),
    getApprovalById: (id) => getRecordById(store, tableNames.approvals, workspaceId, id),
    saveApproval: (approval) => upsertRecord(store, tableNames.approvals, workspaceId, approval),
    listAppProjects: () => listRecords(store, tableNames.appProjects, workspaceId),
    listMarketingContents: () => listRecords(store, tableNames.marketingContents, workspaceId),
    getMarketingContentById: (id) => getRecordById(store, tableNames.marketingContents, workspaceId, id),
    saveMarketingContent: (content) => upsertRecord(store, tableNames.marketingContents, workspaceId, content),
    listMediaAssets: () => listRecords(store, tableNames.mediaAssets, workspaceId),
    getMediaAssetById: (id) => getRecordById(store, tableNames.mediaAssets, workspaceId, id),
    saveMediaAsset: (asset) => upsertRecord(store, tableNames.mediaAssets, workspaceId, asset),
    listMediaUploadJobs: () => listRecords(store, tableNames.mediaUploadJobs, workspaceId),
    getMediaUploadJobById: (id) => getRecordById(store, tableNames.mediaUploadJobs, workspaceId, id),
    saveMediaUploadJob: (job) => upsertRecord(store, tableNames.mediaUploadJobs, workspaceId, job),
    listPublishJobs: () => listRecords(store, tableNames.publishJobs, workspaceId),
    getPublishJobById: (id) => getRecordById(store, tableNames.publishJobs, workspaceId, id),
    savePublishJob: (job) => upsertRecord(store, tableNames.publishJobs, workspaceId, job),
    listContentDrafts: () => listRecords(store, tableNames.contentDrafts, workspaceId),
    getContentDraftById: (id) => getRecordById(store, tableNames.contentDrafts, workspaceId, id),
    saveContentDraft: (draft) => upsertRecord(store, tableNames.contentDrafts, workspaceId, draft),
    listPerformanceSnapshots: () => listRecords(store, tableNames.performanceSnapshots, workspaceId),
    savePerformanceSnapshot: (snapshot) => upsertRecord(store, tableNames.performanceSnapshots, workspaceId, snapshot)
  };

  assertRepositoryContract(repository);

  return repository;
}

export function seedJsonTableStore(seedData, workspaceId = "default_workspace") {
  const store = createMemoryJsonTableStore();

  insertRecords(store, tableNames.companyTasks, workspaceId, seedData.companyTasks);
  insertRecords(store, tableNames.ceoInstructions, workspaceId, seedData.ceoInstructions);
  insertRecords(store, tableNames.employeeTasks, workspaceId, seedData.employeeTasks);
  insertRecords(store, tableNames.approvals, workspaceId, seedData.approvalRequests);
  insertRecords(store, tableNames.appProjects, workspaceId, seedData.appProjects);
  insertRecords(store, tableNames.marketingContents, workspaceId, seedData.marketingContents);
  insertRecords(store, tableNames.contentDrafts, workspaceId, seedData.contentDrafts);
  insertRecords(store, tableNames.mediaAssets, workspaceId, seedData.mediaAssets);
  insertRecords(store, tableNames.mediaUploadJobs, workspaceId, seedData.mediaUploadJobs);
  insertRecords(store, tableNames.publishJobs, workspaceId, seedData.publishJobs);
  insertRecords(store, tableNames.performanceSnapshots, workspaceId, seedData.performanceSnapshots);

  return store;
}

export function createMemoryJsonTableStore() {
  const tables = new Map();

  return {
    list(tableName, workspaceId) {
      return getTable(tables, tableName)
        .filter((row) => row.workspaceId === workspaceId)
        .map((row) => structuredClone(row.record));
    },
    get(tableName, workspaceId, id) {
      const row = getTable(tables, tableName).find((item) => item.workspaceId === workspaceId && item.id === id);
      return row ? structuredClone(row.record) : null;
    },
    upsert(tableName, workspaceId, record) {
      const table = getTable(tables, tableName);
      const now = new Date().toISOString();
      const index = table.findIndex((row) => row.workspaceId === workspaceId && row.id === record.id);
      const row = {
        id: record.id,
        workspaceId,
        record: structuredClone(record),
        createdAt: index === -1 ? now : table[index].createdAt,
        updatedAt: now
      };

      if (index === -1) {
        table.push(row);
      } else {
        table[index] = row;
      }

      return structuredClone(record);
    }
  };
}

function listRecords(store, tableName, workspaceId) {
  return store.list(tableName, workspaceId);
}

function getRecordById(store, tableName, workspaceId, id) {
  return store.get(tableName, workspaceId, id);
}

function upsertRecord(store, tableName, workspaceId, record) {
  return store.upsert(tableName, workspaceId, record);
}

function insertRecords(store, tableName, workspaceId, records = []) {
  records.forEach((record) => store.upsert(tableName, workspaceId, record));
}

function getTable(tables, tableName) {
  if (!tables.has(tableName)) {
    tables.set(tableName, []);
  }

  return tables.get(tableName);
}
