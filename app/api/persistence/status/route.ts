import { createRepositoryReadinessReport } from "../../../../src/domain/repository-readiness.mjs";
import { repository, repositoryRuntimeStatus } from "../../../../src/domain/repository-runtime.mjs";

export async function GET() {
  const report = await createRepositoryReadinessReport({
    repository,
    status: repositoryRuntimeStatus
  });

  return Response.json({
    status: report.databaseBackedPersistenceReady ? "success" : "warning",
    repositoryDriver: report.activeDriver,
    requestedDriver: report.requestedDriver,
    durablePersistenceRequested: report.durablePersistenceRequested,
    databaseBackedPersistenceReady: report.databaseBackedPersistenceReady,
    d1Configured: report.d1Configured,
    d1Reachable: report.d1Reachable,
    fallbackUsed: report.fallbackUsed,
    issues: report.issues,
    reachability: report.reachability
  });
}
