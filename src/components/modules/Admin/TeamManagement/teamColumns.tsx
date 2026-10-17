import DateCell from "@/components/shared/cell/DateCell";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { Badge } from "@/components/ui/badge";
import { roleTitle } from "@/types/permission.types";
import { type IUser } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";

export const teamColumns: ColumnDef<IUser>[] = [
  {
    id: "full_name",
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Phone",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.phone || "N/A"}</span>
    ),
  },
  {
    id: "role",
    // The label people read, so search, sort and export all use it too.
    accessorFn: (user) => roleTitle(user.role),
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="outline">{roleTitle(row.original.role)}</Badge>
    ),
  },
  {
    id: "department",
    header: "Department",
    meta: { exportValue: (user) => user.department?.name },
    enableSorting: false,
    cell: ({ row }) =>
      // Said out loud rather than left blank. An empty cell reads as data
      // that failed to load; "No department" is a fact about the person.
      row.original.department ? (
        <Badge variant="secondary">{row.original.department.name}</Badge>
      ) : (
        <span className="text-sm text-muted-foreground">No department</span>
      ),
  },
  {
    id: "status",
    header: "Status",
    meta: { exportValue: (user) => user.status },
    enableSorting: false,
    cell: ({ row }) => (
      <StatusBadgeCell status={row.original.status} />
    ),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      if (!row.original.created_at) {
        return <span className="text-sm text-muted-foreground">N/A</span>;
      }
      return <DateCell date={row.original.created_at} formatString="MMM dd, yyyy" />;
    },
  },
];
