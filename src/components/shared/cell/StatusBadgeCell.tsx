import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// One mapping, so a status renders identically in every table it appears in.
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  active: "default",
  pending: "secondary",
  suspended: "destructive",
  inactive: "outline",
};

const StatusBadgeCell = ({ status }: { status?: string | null }) => {
  if (!status) {
    return <span className="text-sm text-muted-foreground">N/A</span>;
  }

  const variant = STATUS_VARIANTS[status.toLowerCase()] ?? "outline";
  const label = status.replace(/_/g, " ");

  return <Badge variant={variant} className="capitalize">{label}</Badge>;
};

export default StatusBadgeCell;
