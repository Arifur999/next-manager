export const PROBLEM = {
  title: "The spreadsheet that ties your tools together is always a week behind.",
  statusQuo: [
    "Leads live in a CRM. Hours live in a time tracker. Invoices go out from a billing app, and the money lands in a bank account.",
    "Then someone copies all of it into a spreadsheet to find out whether the month made money.",
  ],
  costs: [
    { name: "Hours typed twice", detail: "Every logged hour is typed again to build an invoice, and the two never quite match." },
    { name: "Margins a month late", detail: "Profit per project shows up after the money is already spent." },
    { name: "Payroll by hand", detail: "Salaries, payouts and owner withdrawals are worked out outside the books." },
    { name: "Two currencies, one guess", detail: "Dollars billed and taka paid get mixed at whatever rate was handy that day." },
  ],
} as const
