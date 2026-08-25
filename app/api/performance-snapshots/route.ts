import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository-runtime.mjs";
import { calculateBottleneckRates, normalizeDailyMetrics } from "../../../src/domain/workflow.mjs";

type PerformanceSnapshot = {
  metrics: Record<string, number | string>;
};

export async function GET() {
  const snapshots = (await repository.listPerformanceSnapshots()).map((snapshot: PerformanceSnapshot) => {
    const metrics = normalizeDailyMetrics(snapshot.metrics);

    return {
      ...snapshot,
      metrics,
      bottleneckRates: calculateBottleneckRates(metrics)
    };
  });

  return NextResponse.json({ performanceSnapshots: snapshots });
}
