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

export async function createRepositoryRoundtripReport({ repository, status, now = new Date().toISOString() }) {
  const snapshot = {
    id: `roundtrip_${now.replaceAll(/[^0-9]/g, "").slice(0, 14)}`,
    appProjectId: "app_numeria_studio",
    channel: "x",
    date: now.slice(0, 10),
    metrics: {
      impressions: 1,
      profile_visits: 1,
      follows: 0,
      engagement_count: 1,
      cta_clicks: 1,
      landing_page_visits: 1,
      trial_or_signup_count: 0,
      purchase_count: 0,
      revenue: 0
    },
    roundtrip: true,
    createdAt: now
  };

  try {
    await repository.savePerformanceSnapshot(snapshot);
    const snapshots = await repository.listPerformanceSnapshots();
    const persisted = snapshots.some((item) => item.id === snapshot.id);

    return {
      status: persisted ? "success" : "error",
      roundtripReady: persisted,
      repository: status,
      operation: {
        write: "savePerformanceSnapshot",
        read: "listPerformanceSnapshots",
        recordId: snapshot.id
      },
      issues: persisted ? [] : ["roundtrip_record_not_found_after_write"]
    };
  } catch (error) {
    return {
      status: "error",
      roundtripReady: false,
      repository: status,
      operation: {
        write: "savePerformanceSnapshot",
        read: "listPerformanceSnapshots",
        recordId: snapshot.id
      },
      issues: [error instanceof Error ? error.message : "repository_roundtrip_failed"]
    };
  }
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
