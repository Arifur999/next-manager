import ClientsReport from "@/components/modules/Admin/Reports/ClientsReport";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { clientRevenueQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ReportViewTabs from "@/components/modules/Admin/Reports/ReportViewTabs";
import ReportPeriodPicker from "@/components/modules/Admin/Reports/ReportPeriodPicker";
import { periodQueryString } from "@/lib/reportPeriod";

export const metadata: Metadata = {
  title: "Clients · Reports",
};

const ClientsReportPage = async ({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => {
  // The same from/to the period picker writes, so the prefetch lands on the key the cards ask for.
  const period = periodQueryString(await searchParams);

  const user = await getUserInfo();

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(clientRevenueQuery(period)),
  ]);

  // Only the wording changes here. The narrowing is done by the server,
  // which forces it for a salesperson rather than reading it from a query -
  // a page cannot be trusted to ask for less than it is allowed.
  const mine = user?.role === "sales";

  return (
    <div className="space-y-6">
      <PageHeader title="Reports">
        {mine
          ? "What the clients you brought in have actually paid. Money received, not money invoiced — an unpaid invoice is a hope, and ranking clients by what they were billed would put your worst payer at the top."
          : "Who actually pays. Money received, not money invoiced — an unpaid invoice is a hope, and ranking clients by what they were billed would put your worst payer at the top."}
      </PageHeader>
      <ReportViewTabs />
      <ReportPeriodPicker />

      <QueryPrefetch prefetch={prefetch}>
        <ClientsReport period={period} />
      </QueryPrefetch>
    </div>
  );
};

export default ClientsReportPage;
