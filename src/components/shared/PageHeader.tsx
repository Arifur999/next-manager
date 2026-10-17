import type { ReactNode } from "react";

// The heading every dashboard page opens with: what the page is, then one
// paragraph on what it is for.
const PageHeader = ({ title, children }: { title: ReactNode; children?: ReactNode }) => (
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    {children && <p className="text-sm text-muted-foreground">{children}</p>}
  </div>
);

export default PageHeader;
