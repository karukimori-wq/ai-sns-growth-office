import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository-runtime.mjs";
import {
  createPerformanceActionPlan,
  createPerformanceRecommendation,
  normalizeDailyMetrics
} from "../../../src/domain/workflow.mjs";

type PerformanceSnapshot = {
  id: string;
  appProjectId: string;
  channel: string;
  date: string;
  metrics: Record<string, number | string>;
};

export async function GET() {
  const snapshots = await repository.listPerformanceSnapshots();
  const recommendations = snapshots.map((snapshot: PerformanceSnapshot) => {
    const metrics = normalizeDailyMetrics(snapshot.metrics);

    return {
      snapshotId: snapshot.id,
      appProjectId: snapshot.appProjectId,
      channel: snapshot.channel,
      date: snapshot.date,
      metrics,
      recommendation: createPerformanceRecommendation({ snapshot, metrics }),
      actionPlan: createPerformanceActionPlan({ snapshot, metrics })
    };
  });

  return NextResponse.json({
    recommendations,
    latestRecommendation: recommendations[0] ?? null
  });
}
