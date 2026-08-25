import assert from "node:assert/strict";
import test from "node:test";
import { createRepositoryReadinessReport } from "../src/domain/repository-readiness.mjs";

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
