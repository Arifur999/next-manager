import ProjectDetail from "@/components/modules/Admin/Projects/ProjectDetail";
import { getTasks } from "@/services/work.services";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { projectDetailQuery, projectFinancialsQuery } from "@/queries/project.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Project",
};

// Next 16 hands params in as a promise.
const ProjectDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const user = await getUserInfo();

  // The same two roles /projects/:id/financials allows. Sales opens this page
  // to see where a client's work has got to, not what it earns — and the check
  // lives here so the page never asks a question it would be refused.
  const canSeeMoney = user?.role === "admin" || user?.role === "project_manager";
  // The same pair, and for the same reason: the milestone, team and link
  // panels are all admin/PM at the API.
  const canManage = canSeeMoney;

  // Prefetched in parallel rather than one after another — the page needs them
  // all before it can paint, so serialising would just add round-trips.
  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(projectDetailQuery(id)),
    queryClient.prefetchQuery({
      queryKey: ["tasks", `project_id=${id}`],
      queryFn: () => getTasks(`project_id=${id}`),
      staleTime: 1000 * 30,
    }),
    ...(canSeeMoney
      ? [
          queryClient.prefetchQuery(projectFinancialsQuery(id)),
        ]
      : []),
  ]);

  return (
    <QueryPrefetch prefetch={prefetch}>
      <ProjectDetail projectId={id} canSeeMoney={canSeeMoney} canManage={canManage} />
    </QueryPrefetch>
  );
};

export default ProjectDetailPage;
