import { NextResponse } from "next/server";
import { createCeoDailyBrief } from "../../../src/domain/daily-brief.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const [appProjects, approvals, employeeTasks, contentDrafts, mediaAssets, performanceSnapshots] = await Promise.all([
    repository.listAppProjects(),
    repository.listApprovals(),
    repository.listEmployeeTasks(),
    repository.listContentDrafts(),
    repository.listMediaAssets(),
    repository.listPerformanceSnapshots()
  ]);
  const appProject = appProjects.find((project: { id?: string }) => project.id === "app_numeria_studio") ?? appProjects[0];
  const brief = createCeoDailyBrief({
    date: url.searchParams.get("date") ?? undefined,
    appProject,
    approvals,
    employeeTasks,
    contentDrafts,
    mediaAssets,
    performanceSnapshots
  });

  return NextResponse.json({ brief });
}
