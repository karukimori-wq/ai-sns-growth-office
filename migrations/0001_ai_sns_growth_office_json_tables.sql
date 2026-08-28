create table if not exists company_tasks (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists ceo_instructions (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists employee_tasks (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists approval_requests (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists app_projects (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists marketing_contents (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists content_drafts (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists media_assets (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists media_upload_jobs (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists publish_jobs (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create table if not exists performance_snapshots (
  id text primary key,
  workspace_id text not null default 'default_workspace',
  record text not null,
  created_at text not null,
  updated_at text not null
);

create index if not exists idx_company_tasks_workspace_id on company_tasks (workspace_id);
create index if not exists idx_ceo_instructions_workspace_id on ceo_instructions (workspace_id);
create index if not exists idx_employee_tasks_workspace_id on employee_tasks (workspace_id);
create index if not exists idx_approval_requests_workspace_id on approval_requests (workspace_id);
create index if not exists idx_app_projects_workspace_id on app_projects (workspace_id);
create index if not exists idx_marketing_contents_workspace_id on marketing_contents (workspace_id);
create index if not exists idx_content_drafts_workspace_id on content_drafts (workspace_id);
create index if not exists idx_media_assets_workspace_id on media_assets (workspace_id);
create index if not exists idx_media_upload_jobs_workspace_id on media_upload_jobs (workspace_id);
create index if not exists idx_publish_jobs_workspace_id on publish_jobs (workspace_id);
create index if not exists idx_performance_snapshots_workspace_id on performance_snapshots (workspace_id);
