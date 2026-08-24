import { createRepositoryFromEnv } from "./repository-factory.mjs";

const runtime = createRepositoryFromEnv();

export const repository = runtime.repository;
export const repositoryRuntimeStatus = runtime.status;
