export function createD1JsonTableStore(database) {
  assertD1Database(database);

  return {
    async list(tableName, workspaceId) {
      const result = await database
        .prepare(`select record from ${assertKnownTableName(tableName)} where workspace_id = ? order by updated_at desc`)
        .bind(workspaceId)
        .all();

      return (result.results ?? []).map((row) => parseRecord(row.record));
    },

    async get(tableName, workspaceId, id) {
      const row = await database
        .prepare(`select record from ${assertKnownTableName(tableName)} where workspace_id = ? and id = ? limit 1`)
        .bind(workspaceId, id)
        .first();

      return row ? parseRecord(row.record) : null;
    },

    async upsert(tableName, workspaceId, record) {
      const now = new Date().toISOString();

      await database
        .prepare(
          `insert into ${assertKnownTableName(tableName)} (id, workspace_id, record, created_at, updated_at)
           values (?, ?, ?, ?, ?)
           on conflict(id) do update set
             workspace_id = excluded.workspace_id,
             record = excluded.record,
             updated_at = excluded.updated_at`
        )
        .bind(record.id, workspaceId, JSON.stringify(record), now, now)
        .run();

      return structuredClone(record);
    },

    async delete(tableName, workspaceId, id) {
      const result = await database
        .prepare(`delete from ${assertKnownTableName(tableName)} where workspace_id = ? and id = ?`)
        .bind(workspaceId, id)
        .run();

      return Boolean(result.meta?.changes);
    }
  };
}

const knownTableNames = new Set([
  "company_tasks",
  "ceo_instructions",
  "employee_tasks",
  "approval_requests",
  "app_projects",
  "marketing_contents",
  "content_drafts",
  "media_assets",
  "media_upload_jobs",
  "publish_jobs",
  "performance_snapshots"
]);

function assertKnownTableName(tableName) {
  if (!knownTableNames.has(tableName)) {
    throw new Error(`Unknown AI SNS Growth Office table: ${tableName}`);
  }

  return tableName;
}

function parseRecord(value) {
  return typeof value === "string" ? JSON.parse(value) : structuredClone(value);
}

function assertD1Database(database) {
  if (!database || typeof database.prepare !== "function") {
    throw new Error("D1 database binding is required.");
  }
}
