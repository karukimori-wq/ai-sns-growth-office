import { createSeedRepository } from "./repository.mjs";
import { createD1JsonTableStore } from "./d1-json-table-store.mjs";
import {
  createMemoryJsonTableStore,
  createJsonTableRepository,
  seedJsonTableStore
} from "./json-table-repository.mjs";
import {
  appProjects,
  approvalRequests,
  ceoInstructions,
  companyTasks,
  contentDrafts,
  employeeTasks,
  mediaAssets,
  mediaUploadJobs,
  marketingContents,
  performanceSnapshots,
  publishJobs,
  snsAccounts
} from "./seed.mjs";

const supportedRepositoryDrivers = ["seed", "json_table", "d1"];
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
      ceoInstructions,
      companyTasks,
      contentDrafts,
      employeeTasks,
      marketingContents,
      mediaAssets,
      mediaUploadJobs,
      performanceSnapshots,
      publishJobs,
      snsAccounts
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

  if (requestedDriver === "d1") {
    const database = env.AI_SNS_D1_DATABASE ?? env.DB ?? env.AI_SNS_GROWTH_OFFICE_DB;

    if (database) {
      return {
        repository: createJsonTableRepository({
          store: createD1JsonTableStore(database),
          workspaceId: env.AI_SNS_WORKSPACE_ID ?? "default_workspace"
        }),
        status: createRepositoryRuntimeStatus({
          requestedDriver,
          activeDriver: "d1",
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
        issues: ["Repository driver \"d1\" requires a D1 database binding."]
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
