import { NextResponse } from "next/server";
import { calculateDailyMetricHealth } from "../../../src/domain/workflow.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export function GET() {
  const snapshots = repository.listPerformanceSnapshots().map((snapshot) => {
    return {
      ...snapshot,
      health: calculateDailyMetricHealth(snapshot.metrics)
    };
  });

  return NextResponse.json({ performanceSnapshots: snapshots });
}
