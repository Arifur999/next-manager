import ProjectsTable from "@/components/modules/Admin/Projects/ProjectsTable";
import { getProjects } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Projects",
};

const ProjectsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mine?: string }>;
}) => {
  const params = await searchParams;
  const queryClient = new QueryClient();
  const user = await getUserInfo();

  // The same two the API lets create and edit a project. Operations opens this
  // to see the work they are on - the server returns only those - and every
  // write behind it is refused, so the forms come off rather than failing.
  const canManage = user?.role === "admin" || user?.role === "project_manager";

  // Built the same way the table builds it, so the first paint is the view that
  // was asked for rather than every project followed by a correction.
  const query = [
    params.status ? `status=${encodeURIComponent(params.status)}` : "",
    params.mine === "true" ? "mine=true" : "",
  ]
    .filter(Boolean)
    .join("&");

  await queryClient.prefetchQuery({
    queryKey: ["projects", query],
    queryFn: () => getProjects(query || undefined),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {params.mine === "true" ? "My projects" : (params.status ?? "Projects")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {params.mine === "true"
            ? "Projects you are on the team for."
            : params.status
              ? `Projects sitting at ${params.status}.`
              : "Work for clients. Payments, expenses and payouts can all be tied to one."}
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        {/* The table reads its filter from the URL, which needs a Suspense
            boundary around useSearchParams. */}
        <Suspense fallback={null}>
          <ProjectsTable canManage={canManage} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default ProjectsPage;
