import type { IAccount } from "@/types/finance.types";
import type { IClient } from "@/types/crm.types";
import type { IProject } from "@/types/project.types";

export type InvoiceStatus =
    | "draft"
    | "sent"
    | "partially_paid"
    | "paid"
    | "overdue"
    | "cancelled";

export interface IInvoiceItem {
    id: string;
    /** The catalogue service the line sells; null for a line typed by hand. */
    service_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    sort_order: number;
}

export interface IInvoice {
    id: string;
    client_id: string;
    project_id: string | null;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    status: InvoiceStatus;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes: string;
    terms: string;
    /** Derived on read from due_date, never stored. */
    is_overdue: boolean;
    paid_usd?: number;
    due_usd?: number;
    client?: Pick<IClient, "id" | "name" | "company" | "email">;
    project?: Pick<IProject, "id" | "name" | "code"> | null;
    items?: IInvoiceItem[];
    payments?: Array<Pick<IPayment, "id" | "date" | "amount_usd" | "reference">>;
    _count?: { items: number; payments: number };
}

export interface IPayment {
    id: string;
    client_id: string;
    project_id: string | null;
    invoice_id: string | null;
    date: string;
    amount_usd: number;
    /** Frozen when the payment was saved — not today's rate. */
    reporting_rate: number;
    amount_bdt_reporting: number;
    account_id: string;
    reference: string;
    notes: string;
    client?: Pick<IClient, "id" | "name" | "company">;
    project?: Pick<IProject, "id" | "name" | "code"> | null;
    account?: Pick<IAccount, "id" | "name" | "currency">;
}
