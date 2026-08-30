// The product, used the way a person uses it.
//
// The smoke suite proves endpoints behave. This walks the actual journeys - an
// agency opening, selling, delivering and getting paid - and reports anything
// that refuses along the way. Different question, and the one a user hits.

const API = "http://localhost:5000/api/v1";
const WEB = "http://localhost:3000";
const stamp = Date.now();

let problems = 0;
const step = (label, ok, detail = "") => {
  if (!ok) {
    problems += 1;
    console.log(`PROBLEM  ${label}${detail ? ` -> ${detail}` : ""}`);
  }
};

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

const page = async (path, cookie) => {
  const res = await fetch(WEB + path, { headers: { Cookie: cookie }, redirect: "manual" });
  const html = res.status === 200 ? await res.text() : "";
  return { status: res.status, text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ") };
};

// ---- an agency opens ----
const adminEmail = `deep${stamp}@agencio.test`;
let r = await api("POST", "/auth/register", {
  organization_name: "Deep Sweep Agency",
  full_name: "Dana Admin",
  email: adminEmail,
  password: "Passw0rd123",
});
step("an agency can sign up", r.status === 201, `${r.status} ${r.json.message}`);
const admin = (await api("POST", "/auth/login", { email: adminEmail, password: "Passw0rd123" })).cookie;

// ---- it hires ----
const cookies = { admin };
const userIds = {};
for (const role of ["sales", "project_manager", "operations"]) {
  const email = `deep-${role}${stamp}@agencio.test`;
  const created = await api(
    "POST",
    "/users",
    { full_name: `Deep ${role}`, email, password: "Passw0rd123", role },
    admin
  );
  step(`admin can hire a ${role}`, created.status === 201, `${created.status} ${created.json.message}`);
  userIds[role] = created.json.data?.id;
  cookies[role] = (await api("POST", "/auth/login", { email, password: "Passw0rd123" })).cookie;
  step(`the ${role} can sign in`, Boolean(cookies[role]));
}

// ---- sales lands work ----
r = await api("POST", "/leads", { name: "Big Fish", stage: "new" }, cookies.sales);
step("sales can add a lead", r.status === 201, `${r.status} ${r.json.message}`);
const leadId = r.json.data?.id;

r = await api("PATCH", `/leads/${leadId}`, { stage: "won" }, cookies.sales);
step("sales can win it", r.status === 200, `${r.status} ${r.json.message}`);

r = await api("POST", `/leads/${leadId}/convert`, {}, cookies.sales);
step("a won lead converts to a client", r.status === 201, `${r.status} ${r.json.message}`);
const clientId = r.json.data?.id ?? r.json.data?.client?.id;

// ---- delivery sets up ----
r = await api(
  "POST",
  "/projects",
  { client_id: clientId, name: "The Work", code: `DS-${stamp}` },
  cookies.project_manager
);
step("a project manager can open a project", r.status === 201, `${r.status} ${r.json.message}`);
const projectId = r.json.data?.id;

r = await api(
  "POST",
  "/project-members",
  { project_id: projectId, user_id: userIds.operations, role_on_project: "member" },
  cookies.project_manager
);
step("and put somebody on it", r.status === 201, `${r.status} ${r.json.message}`);

r = await api(
  "POST",
  "/tasks",
  { project_id: projectId, title: "Do the work", assignee_id: userIds.operations, priority: "high" },
  cookies.project_manager
);
step("and assign a task", r.status === 201, `${r.status} ${r.json.message}`);
const taskId = r.json.data?.id;

// ---- operations does it ----
r = await api(
  "POST",
  "/time-entries",
  { project_id: projectId, task_id: taskId, date: "2026-09-01", hours: 6, is_billable: true },
  cookies.operations
);
step("operations can log time", r.status === 201, `${r.status} ${r.json.message}`);
const entryId = r.json.data?.id;

const board = await api("GET", "/workflow-statuses?kind=task", null, cookies.operations);
const doneId = (board.json.data ?? []).find((s) => s.category === "done")?.id;
r = await api("PATCH", `/tasks/${taskId}`, { status_id: doneId }, cookies.operations);
step("and finish the task", r.status === 200, `${r.status} ${r.json.message}`);
step("which sets a completion date", r.json.data?.completed_at !== null, `${r.json.data?.completed_at}`);

r = await api("POST", `/time-entries/${entryId}/approve`, {}, cookies.project_manager);
step("a project manager approves the hours", r.status === 200, `${r.status} ${r.json.message}`);

// ---- money comes in ----
r = await api("POST", "/accounts", { name: "PayPal", type: "paypal", currency: "USD" }, admin);
const usd = r.json.data?.id;
step("admin can open an account", r.status === 201, `${r.status} ${r.json.message}`);

r = await api(
  "POST",
  "/invoices",
  {
    client_id: clientId,
    project_id: projectId,
    issue_date: "2026-09-01",
    due_date: "2026-09-15",
    items: [{ description: "The work", quantity: 1, unit_price: 1200 }],
  },
  cookies.sales
);
step("sales can raise an invoice", r.status === 201, `${r.status} ${r.json.message}`);
const invoiceId = r.json.data?.id;

// An invoice is created as a draft on purpose. Paying one does NOT promote it -
// that would send an invoice somebody had not finished writing - so the journey
// has to send it, the way a person does.
r = await api("PATCH", `/invoices/${invoiceId}`, { status: "sent" }, cookies.sales);
step("sales can send it", r.status === 200, `${r.status} ${r.json.message}`);

r = await api(
  "POST",
  "/payments",
  {
    client_id: clientId,
    project_id: projectId,
    invoice_id: invoiceId,
    account_id: usd,
    date: "2026-09-10",
    amount_usd: 1200,
    usd_to_bdt_rate: 120,
  },
  admin
);
step("admin can record the payment", r.status === 201, `${r.status} ${r.json.message}`);

r = await api("GET", `/invoices/${invoiceId}`, null, admin);
step(
  "and the invoice settles itself",
  r.json.data?.status === "paid",
  `status ${r.json.data?.status}`
);

// ---- the numbers the agency runs on ----
for (const [path, label] of [
  ["/dashboard", "the dashboard"],
  ["/kpi/agency", "agency KPIs"],
  ["/kpi/delivery", "delivery KPIs"],
  ["/reports/profit-loss", "profit and loss"],
  ["/reports/cash-flow", "cash flow"],
  ["/transactions", "the ledger"],
]) {
  const res = await api("GET", path, null, admin);
  step(`${label} loads`, res.status === 200, `${res.status} ${res.json.message}`);
}

// ---- and every screen each role is given ----
const screens = {
  admin: [
    "/admin/dashboard",
    "/admin/dashboard/clients",
    "/admin/dashboard/projects",
    `/admin/dashboard/projects/${projectId}`,
    `/admin/dashboard/clients/${clientId}`,
    "/admin/dashboard/tasks",
    "/admin/dashboard/invoices",
    `/admin/dashboard/invoices/${invoiceId}`,
    "/admin/dashboard/transactions",
    "/admin/dashboard/reports",
    "/admin/dashboard/reports/team",
  ],
  sales: ["/admin/dashboard/sales", "/admin/dashboard/leads", "/admin/dashboard/clients"],
  project_manager: ["/admin/dashboard/delivery", "/admin/dashboard/projects", "/admin/dashboard/tasks"],
  operations: ["/dashboard", "/dashboard/tasks", "/dashboard/timesheet"],
};

for (const [role, paths] of Object.entries(screens)) {
  for (const path of paths) {
    const res = await page(path, cookies[role]);
    step(`${role} opens ${path}`, res.status === 200, `${res.status}`);
  }
}

console.log(
  `\n${problems === 0 ? "Every journey completed. No problems found." : `${problems} PROBLEM(S) above`}`
);
