import ActivityFeed from "@/components/modules/Admin/Activity/ActivityFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity",
};

// No _action.ts, and there will not be one: the API is GET-only, because a
// history somebody can edit answers no question worth asking.
const ActivityPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Who did what, in the words recorded at the time. Deletions are here too —
          that is mostly what this is for.
        </p>
      </div>

      <ActivityFeed />
    </div>
  );
};

export default ActivityPage;
