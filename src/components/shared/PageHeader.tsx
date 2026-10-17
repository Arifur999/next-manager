import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: ReactNode;
  children?: ReactNode;
  /** The page's own buttons, top right; on a phone they wrap under the title. */
  actions?: ReactNode;
  /** The pages above this one, outermost first. The title is the last crumb, so it is not repeated here. */
  breadcrumb?: Crumb[];
};

const Breadcrumb = ({ crumbs }: { crumbs: Crumb[] }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {crumbs.map((crumb) => (
        <li key={`${crumb.label}-${crumb.href ?? ""}`} className="flex items-center gap-1">
          {crumb.href ? (
            <Link href={crumb.href} className="rounded-sm hover:text-foreground hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
          <ChevronRight aria-hidden="true" className="size-3.5" />
        </li>
      ))}
    </ol>
  </nav>
);

// The heading every dashboard page opens with: what the page is, then one
// paragraph on what it is for.
const PageHeader = ({ title, children, actions, breadcrumb }: PageHeaderProps) => (
  <div className="space-y-1">
    {breadcrumb && breadcrumb.length > 0 && <Breadcrumb crumbs={breadcrumb} />}

    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {children && <p className="text-sm text-muted-foreground">{children}</p>}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
