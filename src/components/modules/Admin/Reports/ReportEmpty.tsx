// The line a report card shows when it has nothing to rank yet.
const ReportEmpty = ({ children }: { children: React.ReactNode }) => (
  <p className="px-5 py-12 text-center text-sm text-muted-foreground">{children}</p>
)

export default ReportEmpty
