import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository-runtime.mjs";
import { calculateBottleneckRates, normalizeDailyMetrics } from "../../../src/domain/workflow.mjs";

type PerformanceSnapshot = {
  metrics: Record<string, number | string>;
};

type MetricInput = Record<string, unknown>;

const metricKeys = [
  "impressions",
  "profile_visits",
  "follows",
  "engagement_count",
  "cta_clicks",
  "landing_page_visits",
  "trial_or_signup_count",
  "purchase_count",
  "revenue"
] as const;

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

export async function POST(request: Request) {
  let body: MetricInput;

  try {
    body = (await request.json()) as MetricInput;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const date = parseDate(body.date);
    const appProjectId = parseText(body.appProjectId) ?? "app_numeria_studio";
    const channel = parseText(body.channel) ?? "x";
    const metrics = parseMetrics(body.metrics);
    const snapshot = {
      id: parseText(body.id) ?? `perf_${appProjectId}_${date.replaceAll("-", "_")}`,
      appProjectId,
      channel,
      date,
      metrics
    };
    const saved = await repository.savePerformanceSnapshot(snapshot);
    const normalized = normalizeDailyMetrics(saved.metrics);

    return NextResponse.json(
      {
        performanceSnapshot: {
          ...saved,
          metrics: normalized,
          bottleneckRates: calculateBottleneckRates(normalized)
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "invalid_performance_snapshot" },
      { status: 400 }
    );
  }
}

function parseMetrics(value: unknown) {
  const input = isRecord(value) ? value : {};

  return Object.fromEntries(metricKeys.map((key) => [key, parseMetric(input[key])]));
}

function parseMetric(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return "unknown";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new Error("invalid_metric");
  }

  return numericValue;
}

function parseDate(value: unknown) {
  const date = parseText(value) ?? new Date().toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("invalid_date");
  }

  return date;
}

function parseText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
