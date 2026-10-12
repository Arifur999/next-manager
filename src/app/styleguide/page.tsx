// Every token and core primitive, light and dark side by side, so the direction
// can be judged (and screenshotted by design-review). noindex, out of the sitemap.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatTile from "@/components/shared/StatTile";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import { formatBdt, formatUsd } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Clock, Receipt } from "lucide-react";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

// [surface token, text token]. Swatches use inline var() because Tailwind cannot see dynamic class names.
const COLOR_PAIRS = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["muted", "muted-foreground"],
  ["secondary", "secondary-foreground"],
  ["primary", "primary-foreground"],
  ["destructive", "destructive-foreground"],
  ["success", "success-foreground"],
  ["warning", "warning-foreground"],
  ["info", "info-foreground"],
  ["success-subtle", "success-subtle-foreground"],
  ["warning-subtle", "warning-subtle-foreground"],
  ["destructive-subtle", "destructive-subtle-foreground"],
  ["info-subtle", "info-subtle-foreground"],
  ["sidebar", "sidebar-foreground"],
  ["accent", "accent-foreground"],
  ["marker", "marker-foreground"],
] as const;

const CHART_TOKENS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;

const TYPE_SCALE = [
  { className: "font-display text-display-lg", label: "display-lg" },
  { className: "font-display text-display", label: "display" },
  { className: "text-heading", label: "heading" },
  { className: "text-title", label: "title" },
  { className: "text-lg", label: "lg" },
  { className: "text-base", label: "base" },
  { className: "text-sm", label: "sm" },
  { className: "text-xs", label: "xs" },
] as const;

const RADII = ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"] as const;
const SHADOWS = ["shadow-frame"] as const;
const SPACING = ["w-1", "w-2", "w-3", "w-4", "w-6", "w-8", "w-12", "w-16", "w-24", "w-32"] as const;
const BUTTON_VARIANTS = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;

const SAMPLE_HEADLINE = "Every client, hour and invoice in one ledger.";
const SAMPLE_BODY =
  "Naxified Management runs the work and the money of a service business together. Leads become projects, logged hours become invoices, and each role sees only what it should.";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-4">
    <h2 className="text-title">{title}</h2>
    {children}
  </section>
);

const Board = ({ theme }: { theme: "light" | "dark" }) => (
  <div className={cn("min-w-0 space-y-10 rounded-xl border bg-background p-4 sm:p-6 text-foreground md:p-8", theme === "dark" && "dark")}>
    <p className="text-sm text-muted-foreground">Theme: {theme}</p>

    <Section title="Color">
      <div className="grid gap-3 sm:grid-cols-2">
        {COLOR_PAIRS.map(([surface, text]) => (
          <div
            key={surface}
            className="rounded-lg border p-4"
            style={{ background: `var(--${surface})`, color: `var(--${text})` }}
          >
            <p className="text-sm font-medium">{surface}</p>
            <p className="text-xs">text: {text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {CHART_TOKENS.map((token) => (
          <div key={token} className="h-10 flex-1 rounded-md" style={{ background: `var(--${token})` }} title={token} />
        ))}
      </div>
      <p className="text-sm">
        Body text with a <a href="#" className="text-primary-strong underline underline-offset-4">brand link</a> and{" "}
        <span className="text-muted-foreground">muted secondary text</span>.
      </p>
    </Section>

    <Section title="Type">
      <div className="space-y-4">
        {TYPE_SCALE.map(({ className, label }) => (
          <div key={label} className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={className}>{SAMPLE_HEADLINE}</p>
          </div>
        ))}
        <p className="max-w-prose text-base">{SAMPLE_BODY}</p>
        <p className="font-mono text-sm tabular-nums break-words">INV-2041 . {formatUsd(4820)} . {formatBdt(482300)}</p>
      </div>
    </Section>

    <Section title="Space, radius, elevation">
      <div className="space-y-2">
        {SPACING.map((width) => (
          <div key={width} className="flex items-center gap-3">
            <span className="w-12 text-xs text-muted-foreground">{width}</span>
            <div className={cn("h-3 rounded-sm bg-primary", width)} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {RADII.map((radius) => (
          <div key={radius} className={cn("grid size-20 place-items-center border bg-muted text-xs", radius)}>
            {radius}
          </div>
        ))}
        {SHADOWS.map((shadow) => (
          <div key={shadow} className={cn("grid size-20 place-items-center rounded-lg bg-card text-xs", shadow)}>
            {shadow}
          </div>
        ))}
      </div>
    </Section>

    <Section title="Controls">
      <div className="flex flex-wrap gap-3">
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        <Button disabled>Disabled</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Create your workspace</Button>
      </div>
      <div className="grid max-w-form gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${theme}-name`}>Full name</Label>
          <Input id={`${theme}-name`} autoComplete="name" defaultValue="Alex Morgan" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${theme}-email`}>Work email</Label>
          <Input id={`${theme}-email`} type="email" aria-invalid="true" aria-describedby={`${theme}-email-error`} defaultValue="alex@northwind" />
          <p id={`${theme}-email-error`} className="text-sm text-destructive">
            Enter a full email address, like you@company.com
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${theme}-disabled`}>Disabled</Label>
          <Input id={`${theme}-disabled`} disabled defaultValue="Read only" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <StatusBadgeCell status="active" />
        <StatusBadgeCell status="pending" />
        <StatusBadgeCell status="suspended" />
        <StatusBadgeCell status="inactive" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile label="Unpaid invoices" value={formatUsd(18240)} secondary="7 invoices, 2 overdue" icon={<Receipt className="size-5" />} />
        <StatTile label="Hours awaiting approval" value="46.5" hint="From 4 people this week" icon={<Clock className="size-5" />} tone={2} />
      </div>
    </Section>
  </div>
);

const StyleguidePage = () => (
  <main id="main-content" tabIndex={-1} className="mx-auto max-w-content space-y-8 px-4 py-12 md:px-8">
    <h1 className="font-display text-display">Styleguide</h1>
    <div className="grid gap-8 xl:grid-cols-2">
      <Board theme="light" />
      <Board theme="dark" />
    </div>
  </main>
);

export default StyleguidePage;
