import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const snapshot = JSON.parse(readFileSync(new URL("../contracts/api-contract.json", import.meta.url)));
const contracts = readFileSync(new URL("../src/lib/api/contracts.ts", import.meta.url), "utf8");
const clientSurface = readFileSync(new URL("../src/lib/api/client.ts", import.meta.url), "utf8");
const missing = [snapshot.source.version, snapshot.statusContractVersion, ...snapshot.statuses].filter((value) => !contracts.includes(value));
if (missing.length || !clientSurface.includes("ApiError")) { console.error("API contract bindings drifted from the committed OpenAPI snapshot."); process.exit(1); }
const digest = createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
console.log((process.argv.includes("--generate") ? "Validated" : "Checked") + " typed client against OpenAPI snapshot " + snapshot.source.version + " (" + digest.slice(0, 12) + ").");
