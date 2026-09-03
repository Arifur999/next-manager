// Who can open what — every page, every role, in one table.
//
// The routing suite checks paths somebody remembered to list. This one
// enumerates every route that EXISTS ON DISK and asks all four company roles
// for each, so a new page cannot quietly arrive with permissions nobody chose.
//
// The result is compared against a committed snapshot rather than against
// hand-written expectations. That is the point: a change to who can reach what
// shows up as a diff in a review instead of being invisible until somebody
// notices the wrong person on the wrong screen. Updating it is deliberate —
// `npm run test:matrix -- --update` — and the diff is what gets read.
//
// Dynamic routes are skipped: a [id] page needs a real id, and inventing one
// would test the 404 path rather than the permission.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const API = "http://localhost:5000/api/v1";
const WEB = "http://localhost:3000";
const SNAPSHOT = "scripts/role-matrix.expected.txt";
const stamp = Date.now();
const update = process.argv.includes("--update");

const api = async (method, path, body, cookie = "") => {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: res.status,
    json: await res.json().catch(() => ({})),
    cookie: (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; "),
  };
};

// ---------------------------------------------------------------- the routes
//
// Read from the filesystem, not from a list in this file. A list would drift
// the first time somebody adds a page and forgets to add it here — which is
// exactly the gap this sweep exists to close.
const routes = execSync('find "src/app/(dashboardLayout)" -name page.tsx', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .map((file) =>
    file
      .replace("src/app/(dashboardLayout)", "")
      .replace("/page.tsx", "")
      // Route groups are organisational, not part of the URL.
      .replace(/\/\([^)]+\)/g, "")
  )
  .map((path) => path || "/")
  .filter((path) => !path.includes("["))
  .sort();

// ---------------------------------------------------------------- the people
const adminEmail = `rm-admin${stamp}@agencio.test`;
await api("POST", "/auth/register", {
  organization_name: "Matrix Co",
  full_name: "RM Admin",
  email: adminEmail,
  password: "Passw0rd123",
});
const adminCookie = (await api("POST", "/auth/login", { email: adminEmail, password: "Passw0rd123" }))
  .cookie;

const ROLES = ["admin", "sales", "project_manager", "operations"];
const cookies = { admin: adminCookie };

for (const role of ROLES.slice(1)) {
  const email = `rm-${role}${stamp}@agencio.test`;
  const made = await api(
    "POST",
    "/users",
    { full_name: `RM ${role}`, email, password: "Passw0rd123", role },
    adminCookie
  );

  if (made.status !== 201) {
    console.error(`Could not create the ${role} account: ${made.status} ${made.json.message}`);
    console.error("The matrix needs one of every role, so this is a hard stop.");
    process.exit(1);
  }

  cookies[role] = (await api("POST", "/auth/login", { email, password: "Passw0rd123" })).cookie;
}

// ---------------------------------------------------------------- the sweep
const open = async (path, cookie) => {
  const res = await fetch(WEB + path, { headers: { Cookie: cookie }, redirect: "manual" });
  // 200 is reachable, 3xx is bounced. Anything else is a broken page rather
  // than a permission answer, and is reported as itself so it cannot be read
  // as "denied".
  if (res.status === 200) return "open";
  if (res.status === 307 || res.status === 308) return "----";
  return String(res.status);
};

const rows = [];
for (const path of routes) {
  const cells = [];
  for (const role of ROLES) {
    cells.push(await open(path, cookies[role]));
  }
  rows.push({ path, cells });
}

// ---------------------------------------------------------------- the table
const width = Math.max(...routes.map((r) => r.length), 8);
const header = ["ROUTE".padEnd(width), ...ROLES.map((r) => r.padEnd(16))].join(" ");
const table = [
  header,
  "-".repeat(header.length),
  ...rows.map(({ path, cells }) =>
    [path.padEnd(width), ...cells.map((c) => c.padEnd(16))].join(" ").trimEnd()
  ),
].join("\n");

// ---------------------------------------------------------------- the checks
let bad = 0;

// A page nobody can open is either dead code or a permission mistake. Either
// way it is worth knowing about, and neither shows up in a test of paths
// somebody chose to list.
const orphans = rows.filter(({ cells }) => !cells.includes("open"));
for (const { path } of orphans) {
  // The platform console belongs to the super admin, who is not in this
  // matrix - those are expected to be closed to all four company roles.
  if (path.startsWith("/platform")) continue;
  bad += 1;
  console.log(`FAIL  no company role can open ${path}`);
}

// A page answering something other than 200/307 is broken, not protected.
for (const { path, cells } of rows) {
  cells.forEach((cell, index) => {
    if (cell !== "open" && cell !== "----") {
      bad += 1;
      console.log(`FAIL  ${ROLES[index].padEnd(16)} got ${cell} from ${path}`);
    }
  });
}

if (update) {
  writeFileSync(SNAPSHOT, `${table}\n`);
  console.log(`\nSnapshot written to ${SNAPSHOT}. Read the diff before committing it.`);
  process.exit(bad === 0 ? 0 : 1);
}

if (!existsSync(SNAPSHOT)) {
  console.log(table);
  console.log(`\nNo snapshot yet. Run with --update to record this one.`);
  process.exit(1);
}

const expected = readFileSync(SNAPSHOT, "utf8").replace(/\r\n/g, "\n").trimEnd();
const actual = table.trimEnd();

if (expected !== actual) {
  const expectedLines = expected.split("\n");
  const actualLines = actual.split("\n");
  const seen = new Set([...expectedLines, ...actualLines]);

  console.log("\nThe permission matrix has CHANGED:\n");
  for (const line of seen) {
    if (!expectedLines.includes(line)) console.log(`  +  ${line}`);
    else if (!actualLines.includes(line)) console.log(`  -  ${line}`);
  }
  console.log(
    "\nIf every line above is a change you meant, re-record it with:" +
      "\n  npm run test:matrix -- --update"
  );
  bad += 1;
}

console.log(
  `\n${rows.length} routes x ${ROLES.length} roles. ` +
    `${bad === 0 ? "The matrix is what it was." : `${bad} PROBLEM(S) above`}`
);
process.exit(bad === 0 ? 0 : 1);
