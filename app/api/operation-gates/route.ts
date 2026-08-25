import { NextResponse } from "next/server";
import { createOperationGates } from "../../../src/domain/daily-brief.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  const [appProjects, approvals, employeeTasks, contentDrafts, mediaAssets] = await Promise.all([
    repository.listAppProjects(),
    repository.listApprovals(),
    repository.listEmployeeTasks(),
    repository.listContentDrafts(),
    repository.listMediaAssets()
  ]);
  const appProject = appProjects.find((project: { id?: string }) => project.id === "app_numeria_studio") ?? appProjects[0];
  const operationGates = createOperationGates({
    appProject,
    approvals,
    employeeTasks,
    contentDrafts,
    mediaAssets
  });

  return NextResponse.json({ operationGates });
}
