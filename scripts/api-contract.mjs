import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const snapshot = JSON.parse(readFileSync(new URL("../contracts/api-contract.json", import.meta.url), "utf8"));
const contracts = readFileSync(new URL("../src/lib/api/contracts.ts", import.meta.url), "utf8");
const clientSurface = readFileSync(new URL("../src/lib/api/client.ts", import.meta.url), "utf8");
const moduleFiles = [
  "../src/lib/api/authApi.ts",
  "../src/lib/api/productsApi.ts",
  "../src/lib/api/cartApi.ts",
  "../src/lib/api/ordersApi.ts",
  "../src/lib/api/checkoutApi.ts",
  "../src/lib/api/paymentsApi.ts",
  "../src/lib/api/repairsApi.ts",
  "../src/lib/api/supportApi.ts",
  "../src/lib/api/warrantyApi.ts",
  "../src/lib/api/guidanceApi.ts",
  "../src/lib/api/evidenceApi.ts",
  "../src/lib/api/notificationApi.ts",
  "../src/components/OperationsQueue.tsx",
  "./api-smoke.mjs",
];

const apiModules = moduleFiles.map((file) => readFileSync(new URL(file, import.meta.url), "utf8")).join("\n");

function endpointCovered(endpoint) {
  const pathRegexPattern = endpoint.replace(/\{[^}]+\}/g, "[^/]+");
  const regex = new RegExp(pathRegexPattern.replace(/\//g, "\\/"));
  const staticParts = endpoint.split("/").filter((part) => part && !part.startsWith("{"));
  return regex.test(apiModules) || staticParts.every((part) => apiModules.includes(part));
}

const missingStatuses = [snapshot.source.version, snapshot.statusContractVersion, ...snapshot.statuses]
  .filter((value) => !contracts.includes(value));

const missingEndpoints = snapshot.endpoints.filter((endpoint) => !endpointCovered(endpoint));

const requiredClientFeatures = ["ApiError", "apiClient", "blob", "joinSignals", "getRefreshResult"];
const missingClientFeatures = requiredClientFeatures.filter((feature) => !clientSurface.includes(feature));

if (missingStatuses.length || missingEndpoints.length || missingClientFeatures.length) {
  console.error("API contract bindings drifted from the committed OpenAPI snapshot.");
  if (missingStatuses.length) console.error("Missing status bindings:", missingStatuses.join(", "));
  if (missingEndpoints.length) console.error("Missing endpoint bindings:", missingEndpoints.join(", "));
  if (missingClientFeatures.length) console.error("Missing client features:", missingClientFeatures.join(", "));
  process.exit(1);
}

const digest = createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
console.log((process.argv.includes("--generate") ? "Validated" : "Checked") + " typed client against OpenAPI snapshot " + snapshot.source.version + " (" + digest.slice(0, 12) + "). Endpoints: " + snapshot.endpoints.length + ".");

