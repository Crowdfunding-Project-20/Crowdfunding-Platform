import { cn } from "@/lib/utils";

/**
 * HeroCard — the headline figure at the top of a dashboard.
 *
 * The inspiration's hero is a saturated fill with the balance in a large type
 * size and actions inline. DESIGN.md caps us at one saturated accent per
 * screen, so the amber fill lives here and the stat tiles below stay neutral.
 *
 * `primary-foreground` is the dark amber that both palettes pair with the amber
 * fill, so contrast holds in light and dark without a per-mode override.
 */
export function HeroCard({
  label,
  value,
  meta,
  actions,
  children,
  className,
}: {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-6 rounded-2xl bg-primary p-6 text-primary-foreground",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm text-primary-foreground/80">{label}</span>
          <span className="break-words font-heading text-4xl font-medium tracking-tight tabular-nums sm:text-5xl">
            {value}
          </span>
          {meta ? (
            <span className="text-sm text-primary-foreground/80">{meta}</span>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
