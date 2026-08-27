import { cn } from "@/lib/utils";

type LoaderProps = {
  size?: number;
  onDark?: boolean;
  label?: string;
  className?: string;
};

const Loader = ({ size = 24, onDark = false, label = "Loading", className }: LoaderProps) => {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        onDark ? "text-primary-foreground" : "text-primary",
        className,
      )}
    />
  );
};

export default Loader;
