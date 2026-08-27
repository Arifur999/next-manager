import DateCell from "@/components/shared/cell/DateCell";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { Badge } from "@/components/ui/badge";
import { type IUser } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";

const roleLabel = (role: string) => role.replace(/_/g, " ");

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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {roleLabel(row.original.role)}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <StatusBadgeCell status={row.original.is_active ? "active" : "inactive"} />
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
