import { createRepositoryFromEnv } from "./repository-factory.mjs";
import { requiredRepositoryMethods } from "./repository-contract.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getCloudflareEnv() {
  try {
    return getCloudflareContext().env ?? null;
  } catch {
    return null;
  }
}

export function getRepositoryRuntime(env = getCloudflareEnv()) {
  return createRepositoryFromEnv({
    ...process.env,
    ...(env ?? {})
  });
}

export function getRepositoryRuntimeStatus(env = getCloudflareEnv()) {
  return getRepositoryRuntime(env).status;
}

export const repository = Object.fromEntries(
  requiredRepositoryMethods.map((method) => [
    method,
    (...args) => getRepositoryRuntime().repository[method](...args)
  ])
);

export const repositoryRuntimeStatus = getRepositoryRuntimeStatus();
