"use client";

import ViewTabs from "@/components/shared/ViewTabs";
import { projectViews } from "@/lib/pageViews";
import { workflowStatusesListQuery } from "@/queries/work.queries";
import { useQuery } from "@tanstack/react-query";

// All, Mine, then one tab per column of the agency's own project board, in
// board order. A retired column keeps its projects but loses its tab.
const ProjectViewTabs = () => {
  const { data } = useQuery(workflowStatusesListQuery("kind=project"));
  const statusNames = (data?.data ?? [])
    .filter((status) => status.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((status) => status.name);

  return <ViewTabs label="Project views" tabs={projectViews(statusNames)} />;
};

export default ProjectViewTabs;
