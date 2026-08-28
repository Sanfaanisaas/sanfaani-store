const base = process.env.VERCEL_SMOKE_URL?.replace(/\/+$/, "");
if (!base) { console.log("Vercel smoke skipped: VERCEL_SMOKE_URL is not configured."); process.exit(0); }
for (const path of ["/", "/shop", "/login"]) { const response = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(15_000) }); if (response.status >= 500) { console.error("Vercel smoke failed for " + path + ": received server error."); process.exit(1); } }
console.log("Vercel smoke passed for public and authentication-entry routes.");
