import { NextResponse } from "next/server";
import { performanceSnapshots } from "../../../src/domain/seed.mjs";
import { calculateBottleneckRates, normalizeDailyMetrics } from "../../../src/domain/workflow.mjs";

export function GET() {
  const snapshots = performanceSnapshots.map((snapshot) => {
    const metrics = normalizeDailyMetrics(snapshot.metrics);

    return {
      ...snapshot,
      metrics,
      bottleneckRates: calculateBottleneckRates(metrics)
    };
  });

  return NextResponse.json({ performanceSnapshots: snapshots });
}
