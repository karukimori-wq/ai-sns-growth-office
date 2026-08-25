import assert from "node:assert/strict";
import test from "node:test";
import { apiEndpoints, createContractStatus, stableEvents } from "../src/domain/contracts.mjs";

test("contract catalog includes daily CEO and secretary endpoints", () => {
  const endpointPaths = apiEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

  assert.ok(endpointPaths.includes("GET /api/daily-brief"));
  assert.ok(endpointPaths.includes("GET /api/ceo-confirmation-agenda"));
  assert.ok(endpointPaths.includes("GET /api/secretary-dispatch-plan"));
  assert.ok(endpointPaths.includes("GET /api/operation-gates"));
});

test("contract catalog includes secretary dispatch and confirmation events", () => {
  assert.ok(stableEvents.includes("ai_company.secretary_dispatch.created.v1"));
  assert.ok(stableEvents.includes("ai_company.ceo_confirmation_agenda.created.v1"));
});

test("contract status exposes repository readiness, events, and endpoints", () => {
  const status = createContractStatus({
    repository: {
      activeDriver: "seed",
      databaseBackedPersistenceReady: false
    }
  });

  assert.equal(status.status, "success");
  assert.equal(status.repository.activeDriver, "seed");
  assert.ok(status.stableEvents.length > 0);
  assert.ok(status.apiEndpoints.every((endpoint) => endpoint.status === "implemented"));
});
