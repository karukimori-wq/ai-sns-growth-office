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

export const repositorySeedTables = [
  { tableName: "company_tasks", records: companyTasks },
  { tableName: "approval_requests", records: approvalRequests },
  { tableName: "app_projects", records: appProjects },
  { tableName: "content_drafts", records: contentDrafts },
  { tableName: "media_assets", records: mediaAssets },
  { tableName: "media_upload_jobs", records: mediaUploadJobs },
  { tableName: "publish_jobs", records: publishJobs },
  { tableName: "performance_snapshots", records: performanceSnapshots }
];

export function createRepositorySeedData() {
  return repositorySeedTables.map((table) => ({
    tableName: table.tableName,
    records: table.records.map((record) => structuredClone(record))
  }));
}

export function createRepositorySeedSql({
  workspaceId = "default_workspace",
  now = "2026-08-25T00:00:00.000Z"
} = {}) {
  const statements = [];

  for (const table of createRepositorySeedData()) {
    for (const record of table.records) {
      statements.push(
        `insert into ${table.tableName} (id, workspace_id, record, created_at, updated_at) values (${quoteSql(record.id)}, ${quoteSql(workspaceId)}, ${quoteSql(JSON.stringify(record))}, ${quoteSql(now)}, ${quoteSql(now)}) on conflict(id) do update set workspace_id = excluded.workspace_id, record = excluded.record, updated_at = excluded.updated_at;`
      );
    }
  }

  return `${statements.join("\n")}\n`;
}

function quoteSql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
