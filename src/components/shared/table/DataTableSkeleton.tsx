import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const ROW_COUNT = 5;

// Placeholder rows for the first load, shaped like the table so the layout
// does not jump when the rows arrive.
const DataTableSkeleton = ({ columnCount }: { columnCount: number }) => {
  return (
    <>
      {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: columnCount }, (_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full max-w-36" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default DataTableSkeleton;
