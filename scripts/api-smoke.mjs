const base = process.env.API_SMOKE_URL?.replace(/\/+$/, "");
if (!base) { console.log("API smoke skipped: API_SMOKE_URL is not configured."); process.exit(0); }
const url = base.endsWith("/api") ? base + "/health" : base + "/api/health";
const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
const body = await response.json().catch(() => null);
if (!response.ok || body?.success !== true || body?.data?.status !== "ok") { console.error("API smoke failed: health endpoint did not return the expected safe envelope."); process.exit(1); }
console.log("API smoke passed: health endpoint returned a compatible envelope.");
