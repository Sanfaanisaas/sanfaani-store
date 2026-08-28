import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { API_CONTRACT_VERSION, REPAIR_STATUS, USER_ROLES } from "../../src/lib/api/contracts";
test("contract snapshot and typed status values are versioned", () => { const snapshot = JSON.parse(readFileSync("contracts/api-contract.json", "utf8")); assert.equal(API_CONTRACT_VERSION, snapshot.source.version); assert.ok(REPAIR_STATUS.includes("QUOTE_SENT")); assert.ok(USER_ROLES.includes("customer")); });
test("authentication source does not persist browser access tokens", () => { const source = readFileSync("src/lib/redux/slices/authSlice.ts", "utf8"); assert.equal(source.includes("localStorage"), false); assert.equal(source.includes("sessionStorage"), false); });
