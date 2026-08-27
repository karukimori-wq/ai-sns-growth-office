import { createRepositoryReadinessReport } from "../../../../src/domain/repository-readiness.mjs";
import { getRepositoryRuntime } from "../../../../src/domain/repository-runtime.mjs";
import { createContractStatus } from "../../../../src/domain/contracts.mjs";

export async function GET() {
  const { repository, status } = getRepositoryRuntime();
  const repositoryReport = await createRepositoryReadinessReport({
    repository,
    status
  });

  return Response.json(createContractStatus({ repository: repositoryReport }));
}
