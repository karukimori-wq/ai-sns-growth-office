const baseUrl = process.env.AI_SNS_DEPLOYMENT_URL;

if (!baseUrl) {
  throw new Error("AI_SNS_DEPLOYMENT_URL is required, for example https://app.example.com");
}

const deploymentUrl = new URL(baseUrl);

async function readJson(pathname, init) {
  const response = await fetch(new URL(pathname, deploymentUrl), init);
  const text = await response.text();

  let body;
  try {
    body = JSON.parse(text);
  } catch (error) {
    throw new Error(`${pathname} returned non-JSON response (${response.status}): ${text.slice(0, 240)}`, {
      cause: error
    });
  }

  if (!response.ok) {
    throw new Error(`${pathname} returned ${response.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const status = await readJson("/api/persistence/status");
assertCondition(status.requestedDriver === "d1", "Expected requestedDriver to be d1");
assertCondition(status.repositoryDriver === "d1", "Expected repositoryDriver to be d1");
assertCondition(status.d1Configured === true, "Expected d1Configured to be true");
assertCondition(status.d1Reachable === true, "Expected d1Reachable to be true");
assertCondition(status.databaseBackedPersistenceReady === true, "Expected databaseBackedPersistenceReady to be true");
assertCondition(status.fallbackUsed === false, "Expected fallbackUsed to be false");

const roundtrip = await readJson("/api/persistence/roundtrip", { method: "POST" });
assertCondition(roundtrip.roundtripReady === true, "Expected roundtripReady to be true");

console.log(JSON.stringify({ status: "success", deployment: deploymentUrl.origin, repositoryDriver: status.repositoryDriver }, null, 2));
