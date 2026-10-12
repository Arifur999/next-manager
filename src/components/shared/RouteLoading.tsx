import Loader from "./Loader";

// What every route's loading.tsx returns, so one file restyles every route
// transition in the app.
const RouteLoading = ({ label = "Loading..." }: { label?: string }) => {
  return (
    // The Loader is the polite live region (role="status", labelled), so the
    // visible line is hidden from screen readers rather than read twice.
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3">
      <Loader size={32} label={label} />
      <p aria-hidden="true" className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

export default RouteLoading;
