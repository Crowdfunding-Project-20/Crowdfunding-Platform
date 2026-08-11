import { cn } from "@/lib/utils";

/**
 * StatCard — one compact metric tile.
 *
 * Used in the row-of-four beneath the hero on every dashboard. Flat surface,
 * hairline border, no shadow (see DESIGN.md). The value carries the emphasis
 * through size, not weight — medium (500) is as heavy as this design goes.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="font-heading text-2xl font-medium text-foreground">
        {value}
      </span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
