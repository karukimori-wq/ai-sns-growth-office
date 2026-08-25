import { NextResponse } from "next/server";
import { repository } from "../../../../src/domain/repository-runtime.mjs";
import { createPerformanceActionPlan, normalizeDailyMetrics } from "../../../../src/domain/workflow.mjs";

type PerformanceAction = {
  id: string;
  owner: string;
  priority: string;
  title: string;
  action: string;
  reason: string;
};

type PerformanceSnapshot = {
  id: string;
  appProjectId?: string;
  metrics: Record<string, number | string | null>;
};

type EmployeeTask = {
  id: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const snapshots = (await repository.listPerformanceSnapshots()) as PerformanceSnapshot[];
  const snapshot =
    snapshots.find((item) => item.id === body.performanceSnapshotId) ??
    snapshots.find((item) => item.appProjectId === body.appProjectId) ??
    snapshots[0] ??
    null;

  if (!snapshot) {
    return NextResponse.json({ error: "performance_snapshot_not_found" }, { status: 404 });
  }

  const metrics = normalizeDailyMetrics(snapshot.metrics);
  const actionPlan = createPerformanceActionPlan({ snapshot, metrics });
  const existingTasks = (await repository.listEmployeeTasks()) as EmployeeTask[];
  const existingIds = new Set(existingTasks.map((task) => task.id));
  const candidateTasks = actionPlan.actions.map((action: PerformanceAction) =>
    createEmployeeTaskFromAction({
      action,
      snapshot,
      actionPlan,
      appProjectId: snapshot.appProjectId ?? body.appProjectId ?? "app_numeria_studio"
    })
  );
  const created = [];
  const skipped = [];

  for (const task of candidateTasks) {
    if (existingIds.has(task.id)) {
      skipped.push({ id: task.id, reason: "already_exists" });
      continue;
    }

    created.push(await repository.saveEmployeeTask(task));
  }

  return NextResponse.json(
    {
      snapshotId: snapshot.id,
      actionPlan,
      employeeTasks: created,
      skipped
    },
    { status: 201 }
  );
}

function createEmployeeTaskFromAction({
  action,
  snapshot,
  actionPlan,
  appProjectId
}: {
  action: PerformanceAction;
  snapshot: PerformanceSnapshot;
  actionPlan: { snapshotId: string };
  appProjectId: string;
}) {
  return {
    id: `employee_task_${actionPlan.snapshotId}_${action.id}`,
    instructionId: `performance_action_plan_${actionPlan.snapshotId}`,
    appProjectId,
    employeeId: employeeIdForOwner(action.owner),
    employeeName: action.owner,
    title: action.title,
    outputType: outputTypeForPerformanceAction(action.id),
    status: "queued",
    statusLabel: "待機中",
    progress: 0,
    deliverable: `${action.action} 理由: ${action.reason}`,
    sourceType: "performance_action",
    sourceId: action.id,
    performanceSnapshotId: snapshot.id,
    priority: action.priority,
    dueLabel: action.priority === "high" ? "今日" : "次回レビュー"
  };
}

function employeeIdForOwner(owner: string) {
  const employeeIds: Record<string, string> = {
    "分析AI": "agent_analytics",
    "SNS戦略AI": "agent_strategy",
    "顧客理解AI": "agent_customer_insight",
    "投稿制作AI": "agent_content",
    "Offer Design AI": "agent_offer_design"
  };

  return employeeIds[owner] ?? "agent_secretary";
}

function outputTypeForPerformanceAction(actionId: string) {
  const outputTypes: Record<string, string> = {
    complete_daily_metrics: "daily_metrics",
    improve_profile_transition: "route_design",
    improve_profile_promise: "customer_insight",
    improve_cta: "x_draft_revision",
    improve_landing_page: "offer_page_revision",
    continue_daily_learning: "daily_metrics_review"
  };

  return outputTypes[actionId] ?? "performance_improvement";
}
