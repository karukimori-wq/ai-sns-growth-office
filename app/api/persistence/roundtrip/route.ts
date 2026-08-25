import { createRepositoryRoundtripReport } from "../../../../src/domain/repository-readiness.mjs";
import { repository, repositoryRuntimeStatus } from "../../../../src/domain/repository-runtime.mjs";

export async function POST() {
  const report = await createRepositoryRoundtripReport({
    repository,
    status: repositoryRuntimeStatus
  });

  return Response.json(report, { status: report.roundtripReady ? 200 : 500 });
}
