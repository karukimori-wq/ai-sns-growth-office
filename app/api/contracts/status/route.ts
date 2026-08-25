import { createRepositoryReadinessReport } from "../../../../src/domain/repository-readiness.mjs";
import { repository, repositoryRuntimeStatus } from "../../../../src/domain/repository-runtime.mjs";
import { createContractStatus } from "../../../../src/domain/contracts.mjs";

export async function GET() {
  const repositoryReport = await createRepositoryReadinessReport({
    repository,
    status: repositoryRuntimeStatus
  });

  return Response.json(createContractStatus({ repository: repositoryReport }));
}
