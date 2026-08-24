import { createSeedRepository } from "./repository.mjs";
import {
  createMemoryJsonTableStore,
  createJsonTableRepository,
  seedJsonTableStore
} from "./json-table-repository.mjs";
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

const supportedRepositoryDrivers = ["seed", "json_table"];
const plannedRepositoryDrivers = ["seed", "json_table", "d1", "postgres"];

export function getRequestedRepositoryDriver(env = process.env) {
  return normalizeRepositoryDriver(env.AI_SNS_REPOSITORY_DRIVER);
}

export function createRepositoryFromEnv(env = process.env) {
  const requestedDriver = getRequestedRepositoryDriver(env);

  if (requestedDriver === "seed") {
    return {
      repository: createSeedRepository(),
      status: createRepositoryRuntimeStatus({
        requestedDriver,
        activeDriver: "seed",
        databaseBackedPersistenceReady: false,
        fallbackUsed: false,
        issues: []
      })
    };
  }

  if (requestedDriver === "json_table") {
    const store = seedJsonTableStore({
      appProjects,
      approvalRequests,
      companyTasks,
      contentDrafts,
      mediaAssets,
      mediaUploadJobs,
      performanceSnapshots,
      publishJobs
    });

    return {
      repository: createJsonTableRepository({ store }),
      status: createRepositoryRuntimeStatus({
        requestedDriver,
        activeDriver: "json_table",
        databaseBackedPersistenceReady: true,
        fallbackUsed: false,
        issues: []
      })
    };
  }

  return {
    repository: createSeedRepository(),
    status: createRepositoryRuntimeStatus({
      requestedDriver,
      activeDriver: "seed",
      databaseBackedPersistenceReady: false,
      fallbackUsed: true,
      issues: [`Repository driver "${requestedDriver}" is planned but not implemented yet.`]
    })
  };
}

export function createEmptyJsonTableRepository(workspaceId = "default_workspace") {
  return createJsonTableRepository({
    store: createMemoryJsonTableStore(),
    workspaceId
  });
}

export function createRepositoryRuntimeStatus({
  requestedDriver,
  activeDriver,
  databaseBackedPersistenceReady,
  fallbackUsed,
  issues
}) {
  return {
    requestedDriver,
    activeDriver,
    supportedRepositoryDrivers,
    plannedRepositoryDrivers,
    durablePersistenceRequested: requestedDriver !== "seed",
    databaseBackedPersistenceReady,
    fallbackUsed,
    issues
  };
}

function normalizeRepositoryDriver(value) {
  const normalized = String(value || "seed").trim().toLowerCase();
  return plannedRepositoryDrivers.includes(normalized) ? normalized : "seed";
}
