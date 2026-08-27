import { createRepositoryRoundtripReport } from "../../../../src/domain/repository-readiness.mjs";
import { getRepositoryRuntime } from "../../../../src/domain/repository-runtime.mjs";

export async function POST() {
  const { repository, status } = getRepositoryRuntime();
  const report = await createRepositoryRoundtripReport({
    repository,
    status
  });

  return Response.json(report, { status: report.roundtripReady ? 200 : 500 });
}
