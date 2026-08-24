import { createSeedRepository } from "./repository.mjs";

const supportedRepositoryDrivers = ["seed"];
const plannedRepositoryDrivers = ["seed", "d1", "postgres"];

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
