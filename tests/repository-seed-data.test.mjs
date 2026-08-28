import assert from "node:assert/strict";
import test from "node:test";
import { createRepositorySeedData, createRepositorySeedSql } from "../src/domain/repository-seed-data.mjs";

test("repository seed data includes all owned tables", () => {
  const tables = createRepositorySeedData().map((table) => table.tableName);

  assert.deepEqual(tables, [
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
});

test("repository seed SQL creates idempotent inserts for dashboard records", () => {
  const sql = createRepositorySeedSql({
    workspaceId: "workspace_seed_test",
    now: "2026-08-25T00:00:00.000Z"
  });

  assert.match(sql, /insert into company_tasks/);
  assert.match(sql, /insert into ceo_instructions/);
  assert.match(sql, /insert into employee_tasks/);
  assert.match(sql, /insert into approval_requests/);
  assert.match(sql, /insert into app_projects/);
  assert.match(sql, /insert into marketing_contents/);
  assert.match(sql, /insert into content_drafts/);
  assert.match(sql, /insert into media_assets/);
  assert.match(sql, /insert into performance_snapshots/);
  assert.match(sql, /workspace_seed_test/);
  assert.match(sql, /on conflict\(id\) do update/);
  assert.match(sql, /app_numeria_studio/);
  assert.match(sql, /draft_x_numeria_day1/);
});

test("repository seed SQL escapes single quotes", () => {
  const sql = createRepositorySeedSql({
    workspaceId: "workspace'seed",
    now: "2026-08-25T00:00:00.000Z"
  });

  assert.match(sql, /workspace''seed/);
});
