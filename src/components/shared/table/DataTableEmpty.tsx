import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface DataTableEmptyProps {
  message: string;
  canReset: boolean;
  onReset: () => void;
}

// With a search or filter applied, "nothing here" is about the filter, not
// the business, so it says so and offers the way back.
const DataTableEmpty = ({ message, canReset, onReset }: DataTableEmptyProps) => {
  if (!canReset) return <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>;

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <SearchX className="size-7 text-muted-foreground/60" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Nothing matches the current search or filters.</p>
      <Button variant="outline" size="sm" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
};

export default DataTableEmpty;
