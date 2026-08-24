import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository.mjs";
import { calculateBottleneckRates, normalizeDailyMetrics } from "../../../src/domain/workflow.mjs";

export function GET() {
  const snapshots = repository.listPerformanceSnapshots().map((snapshot) => {
    const metrics = normalizeDailyMetrics(snapshot.metrics);

    return {
      ...snapshot,
      metrics,
      bottleneckRates: calculateBottleneckRates(metrics)
    };
  });

  return NextResponse.json({ performanceSnapshots: snapshots });
}
