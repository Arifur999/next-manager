// Visible on the page word for word, and the source of the FAQPage JSON-LD.
// Each answer matches what the code does (route table, currency rules,
// checkSubscription on the server).
export const FAQ_TITLE = "Questions owners ask first"

export const FAQ_ITEMS = [
  {
    question: "Who can see money and margins?",
    answer:
      "Accounts, transactions, payroll, payouts and the business and finance reports open for admins only; the route table refuses everyone else before the page loads. Sales can open invoices, and project managers see project margins, because those are part of their jobs.",
  },
  {
    question: "We bill clients in USD and pay our team in BDT. Does that work?",
    answer:
      "Yes. Keep USD and BDT accounts side by side. When money moves between them, record the exchange with its rate. Totals are never added across currencies.",
  },
  {
    question: "How do logged hours turn into invoices?",
    answer:
      "People log time against a project. A project manager approves it. Approved hours can then go onto the client's invoice, next to accepted milestones.",
  },
  {
    question: "How are client logins protected?",
    answer:
      "Client passwords in the vault are encrypted before they are saved. Revealing one is a deliberate action, and every reveal is logged with who did it and when.",
  },
  {
    question: "What happens if a trial or subscription lapses?",
    answer:
      "There is a grace period first. After that everyone can still sign in and read every record; only new changes pause until the subscription is renewed. Nothing is deleted.",
  },
  {
    question: "Will my team need training?",
    answer:
      "Each role sees only the screens it works in. A salesperson starts with leads and clients, a project manager with projects and time, and nothing else gets in the way.",
  },
] as const
