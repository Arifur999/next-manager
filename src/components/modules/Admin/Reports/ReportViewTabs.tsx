import ViewTabs from "@/components/shared/ViewTabs";
import { REPORT_VIEWS, viewsFor } from "@/lib/pageViews";
import { getUserInfo } from "@/services/auth.services";
import { toUserRole } from "@/types/user.types";

// The reports the reader may open, as tabs: a salesperson sees Clients and
// Sales, a project manager Projects, Tasks and Team. getUserInfo is cached per
// request, so this costs the page nothing.
const ReportViewTabs = async () => {
  const role = toUserRole((await getUserInfo())?.role);
  if (!role) return null;

  return <ViewTabs label="Reports" tabs={viewsFor(REPORT_VIEWS, role)} />;
};

export default ReportViewTabs;
