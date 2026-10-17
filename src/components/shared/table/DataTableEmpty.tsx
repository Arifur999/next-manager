import EmptyState from "@/components/shared/state/EmptyState";
import { Button } from "@/components/ui/button";
import { Inbox, SearchX } from "lucide-react";
import type { ReactNode } from "react";

interface DataTableEmptyProps {
  message: string;
  canReset: boolean;
  onReset: () => void;
  /** The one thing to do about an empty list, such as a create button. */
  action?: ReactNode;
}

// With a search or filter applied, "nothing here" is about the filter, not
// the business, so it says so and offers the way back instead of a create
// button that would not change what the filter shows.
const DataTableEmpty = ({ message, canReset, onReset, action }: DataTableEmptyProps) => {
  if (!canReset) {
    return (
      <EmptyState icon={Inbox} action={action}>
        {message}
      </EmptyState>
    );
  }

  return (
    <EmptyState
      icon={SearchX}
      action={
        <Button variant="outline" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      }
    >
      Nothing matches the current search or filters.
    </EmptyState>
  );
};

export default DataTableEmpty;
