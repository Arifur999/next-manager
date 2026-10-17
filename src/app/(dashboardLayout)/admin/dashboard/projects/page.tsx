import ProjectsHeading from "@/components/modules/Admin/Projects/ProjectsHeading";
import ProjectViewTabs from "@/components/modules/Admin/Projects/ProjectViewTabs";
import ProjectsTable from "@/components/modules/Admin/Projects/ProjectsTable";
import { PROJECTS_TABLE } from "@/components/modules/Admin/Projects/projectsTable.config";
import { buildTableQueryString, type SearchParamsRecord } from "@/lib/table/urlState";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { projectsListQuery } from "@/queries/project.queries";
import { workflowStatusesListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Projects",
};

const ProjectsPage = async ({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) => {
  const [params, user] = await Promise.all([searchParams, getUserInfo()]);

  // The same two the API lets create and edit a project. Operations opens this
  // to see the work they are on - the server returns only those - and every
  // write behind it is refused, so the forms come off rather than failing.
  const canManage = user?.role === "admin" || user?.role === "project_manager";

  // Built from the table's own config, so the prefetched page is exactly the
  // view in the URL and the first paint never shows the wrong list.
  const queryString = buildTableQueryString(params, PROJECTS_TABLE);

  // The statuses are the tabs and the table's filter, so both paint complete.
  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(projectsListQuery(queryString)),
    queryClient.prefetchQuery(workflowStatusesListQuery("kind=project")),
  ]);

  return (
    <div className="space-y-6">
      <ProjectsHeading />

      <QueryPrefetch prefetch={prefetch}>
        {/* The tabs and the table read the view from the URL, which needs a
            Suspense boundary around useSearchParams. */}
        <Suspense fallback={null}>
          <ProjectViewTabs />
          <ProjectsTable canManage={canManage} />
        </Suspense>
      </QueryPrefetch>
    </div>
  );
};

export default ProjectsPage;
