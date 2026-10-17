import ActivityFeed from "@/components/modules/Admin/Activity/ActivityFeed";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Activity",
};

// No _action.ts, and there will not be one: the API is GET-only, because a
// history somebody can edit answers no question worth asking.
const ActivityPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Activity">
        Who did what, in the words recorded at the time. Deletions are here too —
        that is mostly what this is for.
      </PageHeader>

      <ActivityFeed />
    </div>
  );
};

export default ActivityPage;
