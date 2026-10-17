import { Button } from "@/components/ui/button";
import Link from "next/link";

// An invoice id that is not this agency's, or not an invoice at all. Said
// plainly, with the way back, rather than an empty card and a Retry.
const InvoiceNotFound = () => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16 text-center">
    <h1 className="text-xl font-semibold">Invoice not found</h1>
    <p className="text-sm text-muted-foreground">
      It may have been deleted, or the link is wrong. Invoices from other workspaces are never shown here.
    </p>
    <Button asChild>
      <Link href="/admin/dashboard/invoices">Back to invoices</Link>
    </Button>
  </div>
);

export default InvoiceNotFound;
