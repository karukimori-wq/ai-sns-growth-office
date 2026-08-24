import assert from "node:assert/strict";
import test from "node:test";
import {
  handleCreateMediaUploadJobAsync,
  handleCreatePublishJobAsync
} from "../src/domain/api-handlers.mjs";
import { createRepositoryFromEnv } from "../src/domain/repository-factory.mjs";

test("repository factory activates D1 repository when binding is provided", async () => {
  const database = createFakeD1Database();
  const { repository, status } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "d1",
    AI_SNS_D1_DATABASE: database,
    AI_SNS_WORKSPACE_ID: "workspace_test"
  });

  await repository.saveApproval({
    id: "approval_d1_image",
    type: "image_asset",
    title: "D1 image",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });

  assert.equal(status.activeDriver, "d1");
  assert.equal(status.databaseBackedPersistenceReady, true);
  assert.equal(status.fallbackUsed, false);
  assert.equal((await repository.getApprovalById("approval_d1_image")).status, "approved");
  assert.equal(database.statements.every((statement) => !statement.sql.includes("approval_d1_image")), true);
});

test("D1 repository supports async media upload and publish job roundtrip", async () => {
  const database = createFakeD1Database();
  await insertD1Record(database, "media_assets", {
    id: "media_numeria_day1",
    appProjectId: "app_numeria_studio",
    contentDraftId: "draft_x_numeria_day1",
    status: "waiting_approval"
  });
  await insertD1Record(database, "content_drafts", {
    id: "draft_x_numeria_day1",
    appProjectId: "app_numeria_studio",
    status: "waiting_approval"
  });
  const { repository } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "d1",
    AI_SNS_D1_DATABASE: database
  });

  await repository.saveMediaUploadJob({
    id: "x_media_upload_d1",
    mediaAssetId: "media_numeria_day1",
    status: "uploaded",
    xMediaId: "x_media_d1"
  });
  await repository.saveApproval({
    id: "approval_d1_image_ready",
    type: "image_asset",
    title: "D1 image ready",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });
  await repository.saveApproval({
    id: "approval_d1_draft",
    type: "draft",
    title: "D1 draft",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });
  await repository.saveApproval({
    id: "approval_d1_publish",
    type: "publish_schedule",
    title: "D1 publish",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });

  const mediaResult = await handleCreateMediaUploadJobAsync({
    body: {
      id: "x_media_upload_d1_roundtrip",
      mediaAssetId: "media_numeria_day1",
      imageApprovalId: "approval_d1_image_ready"
    },
    repository
  });

  assert.equal(mediaResult.status, 201);

  const uploadedJob = {
    ...mediaResult.body.mediaUploadJob,
    status: "uploaded",
    xMediaId: "x_media_d1_roundtrip"
  };
  await repository.saveMediaUploadJob(uploadedJob);

  const publishResult = await handleCreatePublishJobAsync({
    body: {
      contentDraftId: "draft_x_numeria_day1",
      draftApprovalId: "approval_d1_draft",
      publishApprovalId: "approval_d1_publish",
      mediaUploadJobId: uploadedJob.id
    },
    repository
  });

  assert.equal(publishResult.status, 201);
  assert.equal((await repository.getMediaUploadJobById(uploadedJob.id)).xMediaId, "x_media_d1_roundtrip");
  assert.ok((await repository.listPublishJobs()).some((job) => job.id === publishResult.body.publishJob.id));
});

function createFakeD1Database() {
  const tables = new Map();
  const statements = [];

  return {
    statements,
    prepare(sql) {
      return {
        bind(...params) {
          statements.push({ sql, params });

          return {
            async all() {
              const table = getFakeTable(tables, extractTableName(sql));
              const [workspaceId] = params;
              return {
                success: true,
                results: table
                  .filter((row) => row.workspace_id === workspaceId)
                  .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
                  .map((row) => ({ record: row.record })),
                meta: { rows_read: table.length, rows_written: 0 }
              };
            },
            async first() {
              const table = getFakeTable(tables, extractTableName(sql));
              const [workspaceId, id] = params;
              const row = table.find((item) => item.workspace_id === workspaceId && item.id === id);
              return row ? { record: row.record } : null;
            },
            async run() {
              const table = getFakeTable(tables, extractTableName(sql));
              const [id, workspaceId, record, createdAt, updatedAt] = params;
              const existingIndex = table.findIndex((row) => row.id === id);
              const nextRow = {
                id,
                workspace_id: workspaceId,
                record,
                created_at: existingIndex === -1 ? createdAt : table[existingIndex].created_at,
                updated_at: updatedAt
              };

              if (existingIndex === -1) {
                table.push(nextRow);
              } else {
                table[existingIndex] = nextRow;
              }

              return { success: true, meta: { changes: 1, rows_written: 1 } };
            }
          };
        }
      };
    }
  };
}

async function insertD1Record(database, tableName, record, workspaceId = "default_workspace") {
  const now = new Date().toISOString();

  await database
    .prepare(
      `insert into ${tableName} (id, workspace_id, record, created_at, updated_at)
       values (?, ?, ?, ?, ?)
       on conflict(id) do update set
         workspace_id = excluded.workspace_id,
         record = excluded.record,
         updated_at = excluded.updated_at`
    )
    .bind(record.id, workspaceId, JSON.stringify(record), now, now)
    .run();
}

function getFakeTable(tables, tableName) {
  if (!tables.has(tableName)) {
    tables.set(tableName, []);
  }

  return tables.get(tableName);
}

function extractTableName(sql) {
  const match = sql.match(/\b(?:from|into)\s+([a-z_]+)/i);
  if (!match) {
    throw new Error(`Unable to extract table name from SQL: ${sql}`);
  }

  return match[1];
}
