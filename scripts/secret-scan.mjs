import { execFileSync } from "node:child_process";
const patterns = "(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY|sk_live_|pk_live_|xox[baprs]-|mongodb(\\+srv)?://[^\\s]+:[^\\s]+@|ghp_[A-Za-z0-9]{36})";
let output = ""; try { output = execFileSync("rg", ["-l", "--hidden", "--glob", "!node_modules/**", "--glob", "!.git/**", "--glob", "!.next/**", "--glob", "!scripts/secret-scan.mjs", "--regexp", patterns, "."], { encoding: "utf8" }); } catch (error) { if (error.status !== 1) throw error; }
if (output.trim()) { console.error("Potential secret patterns found in: " + output.trim().split("\n").join(", ")); process.exit(1); }
console.log("Secret scan passed: no known credential patterns found.");
