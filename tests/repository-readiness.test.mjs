import assert from "node:assert/strict";
import test from "node:test";
import {
  createRepositoryReadinessReport,
  createRepositoryRoundtripReport
} from "../src/domain/repository-readiness.mjs";

test("repository readiness reports D1 configured and reachable when read succeeds", async () => {
  const report = await createRepositoryReadinessReport({
    repository: {
      listCompanyTasks: async () => []
    },
    status: {
      requestedDriver: "d1",
      activeDriver: "d1",
      supportedRepositoryDrivers: ["seed", "json_table", "d1"],
      plannedRepositoryDrivers: ["seed", "json_table", "d1", "postgres"],
      durablePersistenceRequested: true,
      databaseBackedPersistenceReady: true,
      fallbackUsed: false,
      issues: []
    }
  });

  assert.equal(report.d1Configured, true);
  assert.equal(report.d1Reachable, true);
  assert.equal(report.databaseBackedPersistenceReady, true);
  assert.equal(report.reachability.ok, true);
});

test("repository readiness reports D1 not configured when fallback is active", async () => {
  const report = await createRepositoryReadinessReport({
    repository: {
      listCompanyTasks: async () => []
    },
    status: {
      requestedDriver: "d1",
      activeDriver: "seed",
      supportedRepositoryDrivers: ["seed", "json_table", "d1"],
      plannedRepositoryDrivers: ["seed", "json_table", "d1", "postgres"],
      durablePersistenceRequested: true,
      databaseBackedPersistenceReady: false,
      fallbackUsed: true,
      issues: ["Repository driver \"d1\" requires a D1 database binding."]
    }
  });

  assert.equal(report.d1Configured, false);
  assert.equal(report.d1Reachable, false);
  assert.equal(report.databaseBackedPersistenceReady, false);
  assert.equal(report.reachability.ok, true);
});

test("repository readiness lowers persistence readiness when repository read fails", async () => {
  const report = await createRepositoryReadinessReport({
    repository: {
      listCompanyTasks: async () => {
        throw new Error("D1 read failed");
      }
    },
    status: {
      requestedDriver: "d1",
      activeDriver: "d1",
      supportedRepositoryDrivers: ["seed", "json_table", "d1"],
      plannedRepositoryDrivers: ["seed", "json_table", "d1", "postgres"],
      durablePersistenceRequested: true,
      databaseBackedPersistenceReady: true,
      fallbackUsed: false,
      issues: []
    }
  });

  assert.equal(report.d1Configured, true);
  assert.equal(report.d1Reachable, false);
  assert.equal(report.databaseBackedPersistenceReady, false);
  assert.equal(report.reachability.ok, false);
  assert.match(report.issues[0], /D1 read failed/);
});

test("repository roundtrip writes and reads a performance snapshot", async () => {
  const savedSnapshots = [];
  const report = await createRepositoryRoundtripReport({
    repository: {
      savePerformanceSnapshot: async (snapshot) => {
        savedSnapshots.push(snapshot);
        return snapshot;
      },
      listPerformanceSnapshots: async () => savedSnapshots
    },
    status: {
      requestedDriver: "d1",
      activeDriver: "d1",
      databaseBackedPersistenceReady: true
    },
    now: "2026-08-26T09:15:00.000Z"
  });

  assert.equal(report.status, "success");
  assert.equal(report.roundtripReady, true);
  assert.equal(report.operation.recordId, "roundtrip_20260826091500");
  assert.equal(savedSnapshots[0].date, "2026-08-26");
});

test("repository roundtrip reports write failures", async () => {
  const report = await createRepositoryRoundtripReport({
    repository: {
      savePerformanceSnapshot: async () => {
        throw new Error("D1 write failed");
      },
      listPerformanceSnapshots: async () => []
    },
    status: {
      requestedDriver: "d1",
      activeDriver: "d1",
      databaseBackedPersistenceReady: true
    },
    now: "2026-08-26T09:15:00.000Z"
  });

  assert.equal(report.status, "error");
  assert.equal(report.roundtripReady, false);
  assert.match(report.issues[0], /D1 write failed/);
});
