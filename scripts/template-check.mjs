import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

for (const file of [
  ".env.example",
  "docker-compose.yml",
  "LICENSE",
  "app/api/oauth/token/route.ts",
  "features/webhooks/webhook-plugin.ts",
  "pages/api/graphql.ts",
]) {
  check(existsSync(join(root, file)), `Missing required template contract: ${file}`);
}

const envExample = readFileSync(join(root, ".env.example"), "utf8");
for (const variable of ["PORT", "DATABASE_URL", "SESSION_SECRET", "NEXT_PUBLIC_BACKEND_URL"]) {
  check(new RegExp(`^${variable}=`, "m").test(envExample), `.env.example is missing ${variable}`);
}

check(packageJson.engines?.node === ">=20.0.0", "Node engine must stay aligned at >=20.0.0");
check(packageJson.scripts?.dev?.includes("next dev -p 3000"), "Local dev server must stay pinned to port 3000");
check(packageJson.dependencies?.next, "Next.js dependency is missing");
check(packageJson.dependencies?.["@keystone-6/core"], "Keystone dependency is missing");

const siblingRoot = resolve(root, "..", "openship-template");
if (existsSync(join(siblingRoot, "package.json"))) {
  const sibling = JSON.parse(readFileSync(join(siblingRoot, "package.json"), "utf8"));
  const shared = ["next", "react", "react-dom", "@keystone-6/core", "graphql", "ai"];
  const major = (value = "") => value.match(/\d+/)?.[0];

  for (const dependency of shared) {
    const ours = packageJson.dependencies?.[dependency];
    const theirs = sibling.dependencies?.[dependency];
    check(ours && theirs, `Shared dependency missing: ${dependency}`);
    check(major(ours) === major(theirs), `${dependency} major mismatch: ${ours} vs ${theirs}`);
  }
  console.log("✓ Openship sibling detected; shared runtime majors are compatible.");
} else {
  console.log("i Standalone check; clone openship-template beside this repo for pair validation.");
}

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join("\n"));
  process.exit(1);
}

console.log("✓ Openfront template contracts are present.");
console.log(`✓ Runtime: Node ${packageJson.engines.node}, Next ${packageJson.dependencies.next}, React ${packageJson.dependencies.react}.`);
