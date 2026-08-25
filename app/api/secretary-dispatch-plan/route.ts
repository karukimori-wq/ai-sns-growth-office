import { NextResponse } from "next/server";
import { createSecretaryDispatchPlan } from "../../../src/domain/daily-brief.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  const [appProjects, approvals, employeeTasks, contentDrafts, mediaAssets, performanceSnapshots] = await Promise.all([
    repository.listAppProjects(),
    repository.listApprovals(),
    repository.listEmployeeTasks(),
    repository.listContentDrafts(),
    repository.listMediaAssets(),
    repository.listPerformanceSnapshots()
  ]);
  const appProject = appProjects.find((project: { id?: string }) => project.id === "app_numeria_studio") ?? appProjects[0];
  const dispatchPlan = createSecretaryDispatchPlan({
    appProject,
    approvals,
    employeeTasks,
    contentDrafts,
    mediaAssets,
    performanceSnapshots
  });

  return NextResponse.json({ dispatchPlan });
}
