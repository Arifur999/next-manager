// Every link in every role's sidebar, opened as that role.
//
// The routing suite checks paths somebody remembered to list. This checks the
// nav itself, which is the thing a user actually clicks - it is how the
// /my-profile hole was found, where four roles had a link to a page that had
// never existed.
import { readFileSync } from "node:fs";

const API = "http://localhost:5000/api/v1";
const WEB = "http://localhost:3000";
const stamp = Date.now();

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

// Pull the nav out of the source rather than re-typing it, so this cannot
// drift from what ships.
const src = readFileSync("src/lib/navItem.ts", "utf8");

const sectionFor = (role) => {
  const names = {
    admin: "ADMIN_SECTIONS",
    sales: "SALES_SECTIONS",
    project_manager: "PROJECT_MANAGER_SECTIONS",
    operations: "OPERATIONS_SECTIONS",
    super_admin: "SUPER_ADMIN_SECTIONS",
  };
  const start = src.indexOf(`const ${names[role]}`);
  const end = src.indexOf("\n];", start);
  return src.slice(start, end);
};

const accountSection = (() => {
  const start = src.indexOf("const ACCOUNT_SECTION");
  const end = src.indexOf("\n};", start) + 3;
  return src.slice(start, end);
})();

const hrefsFor = (role) =>
  [...(sectionFor(role) + accountSection).matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);

// One agency with one of each role.
const email = `sweep${stamp}@agencio.test`;
await api("POST", "/auth/register", {
  organization_name: "Sweep Co",
  full_name: "Sweep Admin",
  email,
  password: "Passw0rd123",
});
const cookies = {
  admin: (await api("POST", "/auth/login", { email, password: "Passw0rd123" })).cookie,
};

for (const role of ["sales", "project_manager", "operations"]) {
  const roleEmail = `sweep-${role}${stamp}@agencio.test`;
  await api(
    "POST",
    "/users",
    { full_name: `Sweep ${role}`, email: roleEmail, password: "Passw0rd123", role },
    cookies.admin
  );
  cookies[role] = (await api("POST", "/auth/login", { email: roleEmail, password: "Passw0rd123" }))
    .cookie;
}

if (process.env.SUPER_ADMIN_EMAIL) {
  cookies.super_admin = (
    await api("POST", "/auth/login", {
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
    })
  ).cookie;
}

let broken = 0;
let checked = 0;

for (const [role, cookie] of Object.entries(cookies)) {
  const hrefs = [...new Set(hrefsFor(role))];

  for (const href of hrefs) {
    const res = await fetch(WEB + href, { headers: { Cookie: cookie }, redirect: "manual" });
    checked += 1;

    // A link in your OWN sidebar must open. A redirect means the nav offers a
    // page the role cannot use; a 404 or 500 means it offers one that is not
    // there at all.
    if (res.status !== 200) {
      broken += 1;
      console.log(`BROKEN  ${role.padEnd(16)} ${href} -> ${res.status}`);
    }
  }
}

console.log(
  `\n${checked} nav links checked. ${broken === 0 ? "Every link opens for the role that is offered it." : `${broken} BROKEN`}`
);
