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
  "../src/components/OperationsQueue.tsx",
  "./api-smoke.mjs",
];
const apiModules = moduleFiles.map((file) => readFileSync(new URL(file, import.meta.url), "utf8")).join("\n");

function endpointCovered(endpoint) {
  const staticParts = endpoint.split("/").filter((part) => part && !part.startsWith("{"));
  return staticParts.every((part) => apiModules.includes(part));
}

const missingStatuses = [snapshot.source.version, snapshot.statusContractVersion, ...snapshot.statuses]
  .filter((value) => !contracts.includes(value));

const missingEndpoints = snapshot.endpoints.filter((endpoint) => !endpointCovered(endpoint));

if (missingStatuses.length || missingEndpoints.length || !clientSurface.includes("ApiError")) {
  console.error("API contract bindings drifted from the committed OpenAPI snapshot.");
  if (missingStatuses.length) console.error("Missing status bindings:", missingStatuses.join(", "));
  if (missingEndpoints.length) console.error("Missing endpoint bindings:", missingEndpoints.join(", "));
  process.exit(1);
}

const digest = createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
console.log((process.argv.includes("--generate") ? "Validated" : "Checked") + " typed client against OpenAPI snapshot " + snapshot.source.version + " (" + digest.slice(0, 12) + "). Endpoints: " + snapshot.endpoints.length + ".");
