// The product, used the way a person uses it.
//
// The smoke suite proves endpoints behave. This walks the actual journeys - an
// agency opening, selling, delivering and getting paid - and reports anything
// that refuses along the way. Different question, and the one a user hits.

const API = "http://localhost:5000/api/v1";
const WEB = "http://localhost:3000";
const stamp = Date.now();

let problems = 0;
let checked = 0;
const step = (label, ok, detail = "") => {
  checked += 1;
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
  // React separates adjacent text nodes with an empty comment, so `{pct}%`
  // ships as `55<!-- -->%`. Those are removed first and WITHOUT a space in
  // their place - stripping them as ordinary tags would turn "55%" into "55 %",
  // and a check for what the reader actually sees would then fail on a page
  // that is perfectly correct.
  const text = html
    .replace(/<!--.*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  return { status: res.status, text };
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

// ---- somebody is away, and everybody gets paid ----
//
// Being present, being away, and being paid for the month. Salary is the one
// number that has to leave a real account, so this section watches the balance
// rather than trusting the message.
r = await api("POST", "/hr/attendance/clock", {}, cookies.operations);
step("operations can clock in", r.status === 200 || r.status === 201, `${r.status} ${r.json.message}`);
r = await api("POST", "/hr/attendance/clock", {}, cookies.operations);
step("and clock out again", r.status === 200, `${r.status} ${r.json.message}`);

// Writing down somebody else's day is a different claim from clocking your
// own, so the form for it is shown only to the roles the route allows - and
// the row it writes is labelled as recorded rather than clocked.
for (const [role, offered] of [
  ["admin", true],
  ["project_manager", true],
  ["sales", false],
  ["operations", false],
]) {
  const view = await page("/dashboard/attendance", cookies[role]);
  step(`${role} opens /dashboard/attendance`, view.status === 200, `${view.status}`);
  step(
    offered
      ? `${role} can record it for somebody`
      : `${role} is not offered to record it for somebody`,
    view.text.includes("Record it for somebody") === offered
  );
}

r = await api(
  "POST",
  "/hr/attendance",
  { user_id: userIds.operations, date: "2026-09-02", check_in: "09:30", check_out: "17:00" },
  cookies.project_manager
);
step("a project manager can write down somebody's day", r.status === 200 || r.status === 201, `${r.status} ${r.json.message}`);
step("and it is filed as recorded, not as clocked", r.json.data?.source === "admin", `${r.json.data?.source}`);

// A brand-new agency has to arrive with kinds of leave already on it. This is
// asserted rather than arranged: the previous version of this sweep created one
// when none came back, which is precisely what hid the fact that HR shipped
// with no seeder - an empty picker means nobody can ask to be away at all.
r = await api("GET", "/hr/leave-types", null, admin);
const seededTypes = r.json.data ?? [];
step("a new agency starts with kinds of leave", seededTypes.length > 0, `${seededTypes.length} kinds`);
step(
  "including an uncapped one, so unpaid absence can be recorded",
  seededTypes.some((type) => type.days_per_year === 0 && !type.is_paid)
);
const leaveTypeId = seededTypes[0]?.id;

// And the screen that keeps them editable, without which an agency that
// retired the wrong one could not put it back.
r = await api("POST", "/hr/leave-types", { name: "Study leave", days_per_year: 3, is_paid: true }, admin);
step("admin can add a kind of their own", r.status === 201, `${r.status} ${r.json.message}`);
const ownTypeId = r.json.data?.id;

r = await api("PATCH", `/hr/leave-types/${ownTypeId}`, { is_active: false }, admin);
step("and retire it", r.status === 200, `${r.status} ${r.json.message}`);

const settings = await page("/admin/dashboard/leave-settings", admin);
step("the leave settings screen lists them", settings.status === 200, `${settings.status}`);
step("naming a seeded kind", settings.text.includes("Annual leave"));
step("and showing the uncapped one as no limit", settings.text.includes("No limit"));

r = await api(
  "POST",
  "/hr/leave",
  { leave_type_id: leaveTypeId, from_date: "2026-09-14", to_date: "2026-09-15", days: 2, reason: "Family" },
  cookies.operations
);
step("operations can ask to be away", r.status === 201, `${r.status} ${r.json.message}`);
const leaveId = r.json.data?.id;

// The approve buttons are rendered from the role the page was built for, so a
// role that cannot decide must not be shown them - a button that always fails
// only teaches people the app is broken.
for (const [role, offered] of [
  ["admin", true],
  ["project_manager", true],
  ["sales", false],
  ["operations", false],
]) {
  const view = await page("/dashboard/leave", cookies[role]);
  step(`${role} opens /dashboard/leave`, view.status === 200, `${view.status}`);
  step(
    offered ? `${role} is offered Approve` : `${role} is not offered Approve`,
    view.text.includes(" Approve ") === offered
  );
}

r = await api("POST", `/hr/leave/${leaveId}/decide`, { approve: true }, cookies.project_manager);
step("a project manager can approve it", r.status === 200, `${r.status} ${r.json.message}`);

r = await api("GET", "/hr/leave/balance", null, cookies.operations);
step(
  "and it comes off their allowance",
  Number(r.json.data?.find((b) => b.leave_type?.id === leaveTypeId)?.days_taken) === 2,
  `${r.json.data?.[0]?.days_taken}`
);

r = await api(
  "POST",
  "/accounts",
  { name: "Salary account", type: "bank", currency: "BDT", opening_balance: 500000 },
  admin
);
const bdt = r.json.data?.id;
step("admin can open an account to pay salaries from", r.status === 201, `${r.status} ${r.json.message}`);

r = await api("POST", "/hr/payroll", { period_start: "2026-08-01", period_end: "2026-08-31" }, admin);
step("admin can open a payroll month", r.status === 201, `${r.status} ${r.json.message}`);
const runId = r.json.data?.id;
const payrollItems = (r.json.data?.items ?? []).map((item) => ({
  id: item.id,
  gross_bdt: 30000,
  deductions_bdt: 5000,
}));
step("it opens with a line per person", payrollItems.length > 0, `${payrollItems.length} lines`);

const payrollPage = await page("/admin/dashboard/payroll", admin);
step("the payroll page shows the draft", payrollPage.text.includes("August 2026"));
step("naming the people on it", payrollPage.text.includes("Deep operations"));

r = await api("PATCH", `/hr/payroll/${runId}/items`, { items: payrollItems }, admin);
step("admin can set the numbers", r.status === 200, `${r.status} ${r.json.message}`);

const balanceOf = async () => {
  const list = await api("GET", "/accounts", null, admin);
  return Number((list.json.data ?? []).find((a) => a.id === bdt)?.balance ?? 0);
};
const beforePayroll = await balanceOf();

r = await api("POST", `/hr/payroll/${runId}/complete`, { account_id: bdt }, admin);
step("and pay the run", r.status === 200, `${r.status} ${r.json.message}`);

const owed = 25000 * payrollItems.length;
const afterPayroll = await balanceOf();
step(
  "which moves exactly what the run said",
  beforePayroll - afterPayroll === owed,
  `${beforePayroll} -> ${afterPayroll}, expected -${owed}`
);

// One place salary is recorded. If payroll wrote its own money trail instead of
// team payouts, every profitability figure in the product would disagree with
// the payslips.
r = await api("GET", "/team-payouts", null, admin);
const fromPayroll = (r.json.data ?? []).filter((payout) => Number(payout.amount_bdt) === 25000);
step(
  "as one team payout per person, not a second set of books",
  fromPayroll.length === payrollItems.length,
  `${fromPayroll.length} of ${payrollItems.length}`
);

// Paying it twice would double every salary. It is refused.
r = await api("POST", `/hr/payroll/${runId}/complete`, { account_id: bdt }, admin);
step("paying it twice is refused", r.status >= 400, `${r.status} ${r.json.message}`);
step("with nothing moving", (await balanceOf()) === afterPayroll);

// ---- it borrows, and pays its owners ----
//
// The two records in this product that are accounted for backwards from how
// they look. Both are checked against profit and loss, not just against the
// message the API sends back - the whole point of the module is that neither
// one moves the profit.
const plBefore = (await api("GET", "/reports/profit-loss", null, admin)).json.data;

r = await api(
  "POST",
  "/loans",
  {
    lender: "City Bank",
    principal_bdt: 60000,
    interest_rate: 10,
    started_on: "2026-01-01",
    term_months: 6,
    account_id: bdt,
  },
  admin
);
step("admin can record a bank loan", r.status === 201, `${r.status} ${r.json.message}`);
const loanId = r.json.data?.id;
step("it arrives with a schedule for the whole term", r.json.data?.instalment_count === 6, `${r.json.data?.instalment_count}`);
step("owing the whole principal", r.json.data?.outstanding_bdt === 60000, `${r.json.data?.outstanding_bdt}`);

r = await api("GET", "/reports/profit-loss", null, admin);
step(
  "but borrowing is not revenue",
  r.json.data?.revenue?.bdt_reporting === plBefore?.revenue?.bdt_reporting,
  `${plBefore?.revenue?.bdt_reporting} -> ${r.json.data?.revenue?.bdt_reporting}`
);

// Correct the schedule to the bank's real numbers, then pay one.
r = await api("GET", `/loans/${loanId}`, null, admin);
const instalments = r.json.data?.instalments ?? [];
r = await api(
  "PATCH",
  `/loans/${loanId}/instalments`,
  {
    instalments: instalments.map((item, index) => ({
      due_date: item.due_date.slice(0, 10),
      principal_bdt: 10000,
      interest_bdt: index === 0 ? 500 : 0,
    })),
  },
  admin
);
step("the schedule can be corrected to the bank's own table", r.status === 200, `${r.status} ${r.json.message}`);

const firstInstalment = r.json.data?.instalments?.[0]?.id;
const beforeInstalment = await balanceOf();
r = await api("PATCH", `/loans/instalments/${firstInstalment}/pay`, { account_id: bdt }, admin);
step("and an instalment paid", r.status === 200, `${r.status} ${r.json.message}`);
step("which owes the principal down, not the whole payment", r.json.data?.outstanding_bdt === 50000, `${r.json.data?.outstanding_bdt}`);
step(
  "while the account loses principal and interest together",
  beforeInstalment - (await balanceOf()) === 10500,
  `moved ${beforeInstalment - (await balanceOf())}, expected 10500`
);

// The rule the whole module exists for.
r = await api("GET", "/reports/profit-loss", null, admin);
step(
  "only the interest becomes a cost",
  r.json.data?.cost?.loan_interest_bdt === 500,
  `${r.json.data?.cost?.loan_interest_bdt}`
);
step(
  "so cost rose by the interest alone",
  (r.json.data?.cost?.total_bdt ?? 0) - (plBefore?.cost?.total_bdt ?? 0) === 500,
  `cost moved ${(r.json.data?.cost?.total_bdt ?? 0) - (plBefore?.cost?.total_bdt ?? 0)}`
);

const plAfterLoan = r.json.data;

r = await api("POST", "/shareholders", { name: "Dana Admin", share_pct: 70 }, admin);
step("admin can record a shareholder", r.status === 201, `${r.status} ${r.json.message}`);
const shareholderId = r.json.data?.id;

r = await api("POST", "/shareholders", { name: "Silent Partner", share_pct: 40 }, admin);
step("shares over 100% are refused", r.status === 400, `${r.status} ${r.json.message}`);

r = await api("GET", "/shareholders", null, admin);
step("and the list says what is still unassigned", r.json.meta?.unallocated_pct === 30, `${r.json.meta?.unallocated_pct}`);

const beforePayout = await balanceOf();
r = await api(
  "POST",
  "/shareholders/distributions",
  { shareholder_id: shareholderId, date: "2026-06-01", amount_bdt: 5000, account_id: bdt },
  admin
);
step("an owner can be paid", r.status === 201, `${r.status} ${r.json.message}`);
step("which really leaves the account", beforePayout - (await balanceOf()) === 5000, `moved ${beforePayout - (await balanceOf())}`);

r = await api("GET", "/reports/profit-loss", null, admin);
step(
  "but paying owners is not a cost",
  r.json.data?.cost?.total_bdt === plAfterLoan?.cost?.total_bdt,
  `${plAfterLoan?.cost?.total_bdt} -> ${r.json.data?.cost?.total_bdt}`
);
step(
  "so the agency cannot shrink its own profit by paying itself",
  r.json.data?.net_profit_bdt === plAfterLoan?.net_profit_bdt,
  `${plAfterLoan?.net_profit_bdt} -> ${r.json.data?.net_profit_bdt}`
);

// Both screens, and the ledger that now carries three new kinds of movement.
for (const [path, label] of [
  ["/loans/summary", "the loan summary"],
  ["/shareholders", "the shareholder list"],
  ["/transactions?kind=income", "income on the ledger"],
  ["/transactions?kind=expense", "spending on the ledger"],
]) {
  const res = await api("GET", path, null, admin);
  step(`${label} loads`, res.status === 200, `${res.status} ${res.json.message}`);
}


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
    "/admin/dashboard/payroll",
    "/admin/dashboard/leave-settings",
    "/admin/dashboard/loans",
    "/admin/dashboard/shareholders",
    "/dashboard/attendance",
  ],
  sales: [
    "/admin/dashboard/sales",
    "/admin/dashboard/leads",
    "/admin/dashboard/clients",
    "/dashboard/attendance",
  ],
  project_manager: [
    "/admin/dashboard/delivery",
    "/admin/dashboard/projects",
    "/admin/dashboard/tasks",
    "/dashboard/attendance",
  ],
  operations: [
    "/dashboard",
    "/dashboard/tasks",
    "/dashboard/timesheet",
    "/dashboard/attendance",
  ],
};

for (const [role, paths] of Object.entries(screens)) {
  for (const path of paths) {
    const res = await page(path, cookies[role]);
    step(`${role} opens ${path}`, res.status === 200, `${res.status}`);
  }
}

console.log(
  `
${checked} steps walked. ` +
    `${problems === 0 ? "Every journey completed. No problems found." : `${problems} PROBLEM(S) above`}`
);
