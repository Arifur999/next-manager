import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const ROW_COUNT = 5;

// Placeholder rows for the first load, shaped like the table so the layout
// does not jump when the rows arrive. One class per visible column, so a
// column that steps aside on a phone steps aside here too.
const DataTableSkeleton = ({ cellClassNames }: { cellClassNames: (string | undefined)[] }) => {
  return (
    <>
      {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {cellClassNames.map((className, cellIndex) => (
            <TableCell key={cellIndex} className={className}>
              <Skeleton className="h-4 w-full max-w-36" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default DataTableSkeleton;
