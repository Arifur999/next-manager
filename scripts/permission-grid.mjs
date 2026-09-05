/**
 * The permissions screen renders the grid it claims to.
 *
 * Everything here is asserted against the <table> slice, never the page. Module
 * names are also sidebar links ("Clients", "Projects", "Team"), so a whole-page
 * search for them passes on a page whose table failed to render at all.
 *
 * Radix renders only the ACTIVE tab, so what SSR carries is the admin template
 * and nothing else. That is the thing being checked - the other three grids
 * arrive on click, and the read path is the same one.
 */

const API = "http://localhost:5000/api/v1";
const WEB = "http://localhost:3000";
const stamp = Date.now();

let bad = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
  if (!ok) bad++;
};

const api = async (method, path, body, cookie = "") => {
  const res = await fetch(`${API}${path}`, {
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

const email = `grid${stamp}@agencio.test`;
await api("POST", "/auth/register", {
  organization_name: "Grid Co",
  full_name: "Grid Admin",
  email,
  password: "Passw0rd123",
});
const cookie = (await api("POST", "/auth/login", { email, password: "Passw0rd123" })).cookie;

await api("POST", "/users", {
  full_name: "Grid Ops",
  email: `grid-ops${stamp}@agencio.test`,
  password: "Passw0rd123",
  role: "operations",
}, cookie);

const load = async () => {
  const res = await fetch(`${WEB}/admin/dashboard/permissions`, { headers: { Cookie: cookie } });
  const html = (await res.text()).replace(/<script[\s\S]*?<\/script>/g, " ");
  const from = html.indexOf("<table");
  return { status: res.status, html, table: from === -1 ? "" : html.slice(from, html.indexOf("</table>", from)) };
};

console.log("\n--- the permissions grid renders ---\n");

let page = await load();
check("the page renders", page.status === 200, String(page.status));
check("with a table on it", page.table.length > 0);

const MODULES = ["Clients","Leads","Invoices","Services","Projects","Tasks","Team","Chat","Accounts","Reports","Vault","Attendance","Leave","Time"];
const headings = [...page.table.matchAll(/table-head[^>]*>([^<]+)</g)].map((m) => m[1]);
const rowNames = [...page.table.matchAll(/font-medium">([^<]+)</g)].map((m) => m[1]);

check("a column per action", ["Module","View","Create","Edit","Delete","Assign"].every((h) => headings.includes(h)), headings.join(" "));
check("a row per module", MODULES.every((m) => rowNames.includes(m)), `${rowNames.length} rows`);

// 14 modules x 5 actions is 70 squares, but only 50 exist in the catalogue.
// The other 20 must be dashes, not pickers offering a value the server refuses.
const pickers = (page.table.match(/data-slot="select-value"/g) ?? []).length;
const dashes = (page.table.match(/not applicable/g) ?? []).length;
check("a picker on every real square", pickers === 50, `${pickers}`);
check("and a dash on every square that is not", dashes === 20, `${dashes}`);
check("no picker is blank before hydration", !/data-slot="select-value"[^>]*><\//.test(page.table));

check("both tabs", page.html.includes("Roles") && page.html.includes("One person"));
check("a tab per configurable role", ["Sales","Project Manager","Operations"].every((r) => page.html.includes(r)));

// The read path end to end: change one square through the API and the screen
// must come back saying so. Admin is the tab SSR renders, so admin is the row
// that can be proved without a click.
const before = page.table.match(/aria-label="Admin: View Accounts"[\s\S]{0,1200}?data-slot="select-value"[^>]*>([^<]+)/);
check("admin reaches every account today", before?.[1] === "Everything", before?.[1]);

const wrote = await api("PATCH", "/permissions/roles", { role: "admin", module: "accounts", action: "view", scope: "own" }, cookie);
check("a square can be narrowed", wrote.status === 200, `${wrote.status} ${wrote.json.message}`);

page = await load();
const after = page.table.match(/aria-label="Admin: View Accounts"[\s\S]{0,1200}?data-slot="select-value"[^>]*>([^<]+)/);
check("and the screen says so on the next load", after?.[1] === "Their own", after?.[1]);

await api("PATCH", "/permissions/roles", { role: "admin", module: "accounts", action: "view", scope: "all" }, cookie);
page = await load();
const back = page.table.match(/aria-label="Admin: View Accounts"[\s\S]{0,1200}?data-slot="select-value"[^>]*>([^<]+)/);
check("put back", back?.[1] === "Everything", back?.[1]);

console.log(bad ? `\n${bad} PROBLEM(S) above\n` : "\nTHE GRID RENDERS WHAT IT HOLDS\n");
process.exit(bad ? 1 : 0);
