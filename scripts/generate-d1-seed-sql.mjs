import { createRepositorySeedSql } from "../src/domain/repository-seed-data.mjs";

const workspaceId = process.env.AI_SNS_WORKSPACE_ID ?? "default_workspace";

process.stdout.write(createRepositorySeedSql({ workspaceId }));
