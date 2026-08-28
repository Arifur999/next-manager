// Does each role land where it should, and get bounced from where it should not?
// The backend smoke suite proves the API refuses; this proves the browser never
// parks somebody on a page their role cannot use.

const API = "http://localhost:5000/api/v1";
const WEB = "http://localhost:3000";
const stamp = Date.now();

const api = async (m, p, b, cookie = "") => {
  const r = await fetch(API + p, {
    method: m,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: b ? JSON.stringify(b) : undefined,
  });
  const sc = r.headers.getSetCookie?.() ?? [];
  return {
    status: r.status,
    json: await r.json().catch(() => ({})),
    cookie: sc.map((c) => c.split(";")[0]).join("; "),
  };
};

const adminEmail = `rt-admin${stamp}@agencio.test`;
await api("POST", "/auth/register", {
  organization_name: "RoleRoute Co",
  full_name: "RT Admin",
  email: adminEmail,
  password: "Passw0rd123",
});
const adminCookie = (await api("POST", "/auth/login", { email: adminEmail, password: "Passw0rd123" })).cookie;

const cookies = { admin: adminCookie };
for (const role of ["sales", "project_manager", "operations"]) {
  const email = `rt-${role}${stamp}@agencio.test`;
  await api("POST", "/users", { full_name: `RT ${role}`, email, password: "Passw0rd123", role }, adminCookie);
  cookies[role] = (await api("POST", "/auth/login", { email, password: "Passw0rd123" })).cookie;
}

// Where each role should land, and one page each must be bounced away from.
const EXPECT = {
  admin: { home: "/admin/dashboard", denied: null },
  sales: { home: "/admin/dashboard/leads", denied: "/admin/dashboard/payments" },
  project_manager: { home: "/admin/dashboard/projects", denied: "/admin/dashboard/reports" },
  operations: { home: "/dashboard/tasks", denied: "/admin/dashboard/accounts" },
};

let bad = 0;
for (const [role, { home, denied }] of Object.entries(EXPECT)) {
  const c = cookies[role];

  // Hitting an auth page while signed in redirects to the role's own home.
  const landing = await fetch(`${WEB}/login`, { headers: { Cookie: c }, redirect: "manual" });
  const landedAt = landing.headers.get("location") ?? "";
  const landOk = landedAt.endsWith(home);
  if (!landOk) bad += 1;
  console.log(
    `${landOk ? "OK  " : "FAIL"}  ${role.padEnd(16)} lands on ${home}` +
      (landOk ? "" : `  -> got ${landedAt || landing.status}`)
  );

  // Their own home must render, not bounce.
  const own = await fetch(WEB + home, { headers: { Cookie: c }, redirect: "manual" });
  const ownOk = own.status === 200;
  if (!ownOk) bad += 1;
  console.log(`${ownOk ? "OK  " : "FAIL"}  ${role.padEnd(16)} opens ${home}  (${own.status})`);

  if (denied) {
    const res = await fetch(WEB + denied, { headers: { Cookie: c }, redirect: "manual" });
    const bounced = res.status === 307 || res.status === 308;
    if (!bounced) bad += 1;
    console.log(`${bounced ? "OK  " : "FAIL"}  ${role.padEnd(16)} bounced from ${denied}  (${res.status})`);
  }
}

// Approval is admin + project_manager only, and an unlisted /admin path must
// fall to admin-only rather than falling open.
for (const [role, expected] of [
  ["admin", 200],
  ["project_manager", 200],
  ["sales", 307],
  ["operations", 307],
]) {
  const res = await fetch(`${WEB}/admin/dashboard/time-approvals`, {
    headers: { Cookie: cookies[role] },
    redirect: "manual",
  });
  const ok = res.status === expected;
  if (!ok) bad += 1;
  console.log(
    `${ok ? "OK  " : "FAIL"}  ${role.padEnd(16)} time-approvals -> ${res.status} (want ${expected})`
  );
}

// An /admin path no rule names must be refused, not served. This is the
// fail-open case, so it is asserted rather than assumed.
const unlisted = await fetch(`${WEB}/admin/dashboard/nothing-here`, {
  headers: { Cookie: cookies.sales },
  redirect: "manual",
});
const unlistedOk = unlisted.status === 307 || unlisted.status === 308;
if (!unlistedOk) bad += 1;
console.log(
  `${unlistedOk ? "OK  " : "FAIL"}  ${"sales".padEnd(16)} bounced from an unlisted /admin path  (${unlisted.status})`
);

// The timesheet is shared: every company role logs hours, so no role may be
// bounced off it. A nav link that redirects is worse than no nav link at all.
for (const role of Object.keys(EXPECT)) {
  const res = await fetch(`${WEB}/dashboard/timesheet`, {
    headers: { Cookie: cookies[role] },
    redirect: "manual",
  });
  const ok = res.status === 200;
  if (!ok) bad += 1;
  console.log(`${ok ? "OK  " : "FAIL"}  ${role.padEnd(16)} opens /dashboard/timesheet  (${res.status})`);
}

console.log(`\n${bad === 0 ? "ROLE ROUTING CORRECT" : `${bad} ROUTING PROBLEM(S)`}`);
