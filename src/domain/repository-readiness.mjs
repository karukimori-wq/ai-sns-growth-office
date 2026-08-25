export async function createRepositoryReadinessReport({ repository, status }) {
  const readCheck = await checkRepositoryRead(repository);
  const d1Configured = status.requestedDriver === "d1" && status.activeDriver === "d1";
  const d1Reachable = d1Configured ? readCheck.ok : false;
  const databaseBackedPersistenceReady = status.databaseBackedPersistenceReady && readCheck.ok;

  return {
    ...status,
    d1Configured,
    d1Reachable,
    databaseBackedPersistenceReady,
    reachability: readCheck,
    issues: readCheck.ok ? status.issues : [...status.issues, readCheck.issue]
  };
}

async function checkRepositoryRead(repository) {
  try {
    await repository.listCompanyTasks();

    return {
      ok: true,
      checkedOperation: "listCompanyTasks"
    };
  } catch (error) {
    return {
      ok: false,
      checkedOperation: "listCompanyTasks",
      issue: error instanceof Error ? error.message : "repository_read_failed"
    };
  }
}
