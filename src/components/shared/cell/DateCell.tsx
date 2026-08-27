import { format } from "date-fns";

type DateCellProps = {
  date: string | Date;
  formatString?: string;
};

// Every date in a table goes through here. date-fns' format(), never
// toLocaleDateString - which renders differently per machine locale, so two
// users comparing screenshots see two different dates.
const DateCell = ({ date, formatString = "MMM dd, yyyy" }: DateCellProps) => {
  const parsed = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsed.getTime())) {
    return <span className="text-sm text-muted-foreground">N/A</span>;
  }

  return <span className="text-sm">{format(parsed, formatString)}</span>;
};

export default DateCell;
