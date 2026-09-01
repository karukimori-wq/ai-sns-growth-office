import assert from "node:assert/strict";
import test from "node:test";
import { apiEndpoints, createContractStatus, stableEvents } from "../src/domain/contracts.mjs";

test("contract catalog includes daily CEO and secretary endpoints", () => {
  const endpointPaths = apiEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

  assert.ok(endpointPaths.includes("GET /api/daily-brief"));
  assert.ok(endpointPaths.includes("GET /api/persistence/status"));
  assert.ok(endpointPaths.includes("POST /api/persistence/roundtrip"));
  assert.ok(endpointPaths.includes("GET /api/ceo-operating-snapshot"));
  assert.ok(endpointPaths.includes("GET /api/ceo-confirmation-agenda"));
  assert.ok(endpointPaths.includes("GET /api/secretary-dispatch-plan"));
  assert.ok(endpointPaths.includes("GET /api/operation-gates"));
});

test("contract catalog includes employee task status endpoint", () => {
  const endpointPaths = apiEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

  assert.ok(endpointPaths.includes("GET /api/employee-tasks"));
  assert.ok(endpointPaths.includes("POST /api/employee-tasks/{employeeTaskId}/status"));
});

test("contract catalog includes publish approval request endpoint", () => {
  const endpointPaths = apiEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

  assert.ok(endpointPaths.includes("POST /api/publish-approval-requests"));
});

test("contract catalog includes LINE Messaging API endpoints", () => {
  const endpointPaths = apiEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);

  assert.ok(endpointPaths.includes("GET /api/sns-integrations"));
  assert.ok(endpointPaths.includes("POST /api/sns-integrations"));
  assert.ok(endpointPaths.includes("GET /api/line/status"));
  assert.ok(endpointPaths.includes("POST /api/line/messages/push"));
  assert.ok(endpointPaths.includes("POST /api/line/webhook"));
  assert.ok(stableEvents.includes("ai_company.line_message.sent.v1"));
  assert.ok(stableEvents.includes("ai_company.line_webhook.received.v1"));
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
