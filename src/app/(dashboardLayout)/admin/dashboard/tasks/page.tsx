import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import { getUserInfo } from "@/services/auth.services";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { tasksListQuery, workflowStatusesListQuery } from "@/queries/work.queries";
import PageHeader from "@/components/shared/PageHeader";
import ViewTabs from "@/components/shared/ViewTabs";
import { taskViewsFor } from "@/lib/pageViews";
import type { SearchParamsRecord } from "@/lib/table/urlState";
import { sentenceCase } from "@/lib/text";
import { toUserRole } from "@/types/user.types";
import CreateTaskModal from "@/components/modules/Admin/Tasks/CreateTaskModal";
import { taskAccessFor } from "@/components/modules/Admin/Tasks/taskAccess";
import {
  isNarrowed,
  readTaskView,
  taskQueryString,
  taskViewTitle,
  type TaskView,
} from "@/components/modules/Admin/Tasks/taskView";

export const metadata: Metadata = {
  title: "Tasks",
};

// The title stays "Tasks", the sidebar's word, unless the view is one status;
// the tab says which view, and this line says what the view is for.
const BLURBS = {
  overdue: "Past their date and still unfinished. Finishing one takes it off this list.",
  unassigned: "Nobody holds these yet. Give each one an owner, or it waits.",
  sales:
    "Everything happening inside the clients you brought in — whoever is doing it. Watching, not running: the work belongs to whoever the project manager gave it to.",
  mine: "Assigned to you.",
  all: "Everything in flight, in the order work moves through.",
};

// Old links can combine filters; the first match describes the page.
const blurbFor = (view: TaskView) => {
  if (view.overdue) return BLURBS.overdue;
  if (view.unassigned) return BLURBS.unassigned;
  if (view.status) return `Every task in the ${sentenceCase(view.status)} column, on every project.`;
  if (view.clientOwner) return BLURBS.sales;
  if (view.mine) return BLURBS.mine;
  return BLURBS.all;
};

const TasksPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) => {
  // Read the same way the board reads it, so the first paint is the view that
  // was asked for rather than every task followed by a correction.
  const view = readTaskView(await searchParams);

  const user = await getUserInfo();
  const role = toUserRole(user?.role);

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(tasksListQuery(taskQueryString(view))),
    // The board draws its COLUMNS from these, so without them the server
    // renders a board with no columns and therefore no tasks — everything
    // appearing only once the browser has hydrated and fetched them. The list
    // and calendar views never showed it because they read tasks directly.
    queryClient.prefetchQuery(workflowStatusesListQuery("kind=task")),
  ]);

  // The two roles that own the schedule. Sales reads this board; the API
  // refuses them every write behind it, so the create button would only be a
  // button that fails. On a narrowed view a new task would not land in sight.
  const access = taskAccessFor(role);
  const canCreate = access === "manage" && !isNarrowed(view);

  return (
    <div className="space-y-6">
      <PageHeader title={taskViewTitle(view.status)} actions={canCreate ? <CreateTaskModal /> : undefined}>
        {blurbFor(view)}
      </PageHeader>
      {role && <ViewTabs label="Task views" tabs={taskViewsFor(role)} />}

      <QueryPrefetch prefetch={prefetch}>
        <TaskBoard access={access} userId={user?.id ?? null} />
      </QueryPrefetch>
    </div>
  );
};

export default TasksPage;
