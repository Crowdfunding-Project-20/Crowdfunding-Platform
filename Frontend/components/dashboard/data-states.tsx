"use client";

import { ArrowClockwise } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Loading / error / empty states shared by the three dashboards.
 *
 * The existing pages define these locally per file, which is right when each is
 * shaped differently. All three dashboards share one layout (hero, tile row,
 * panel), so they share these instead of triplicating them.
 */

/** Mirrors the real layout so the page doesn't reflow when data lands. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-[168px] animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-[320px] animate-pulse rounded-xl bg-muted lg:col-span-3" />
        <div className="h-[320px] animate-pulse rounded-xl bg-muted lg:col-span-2" />
      </div>
    </div>
  );
}

export function DashboardError({
  message = "We couldn't load your dashboard just now.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry ?? (() => window.location.reload())}>
        <ArrowClockwise className="size-4" />
        Try again
      </Button>
    </div>
  );
}

/**
 * Empty state. Inviting rather than apologetic, per DESIGN.md — an empty
 * dashboard is a starting point, not a failure.
 */
export function DashboardEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <p className="font-heading text-lg font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Section wrapper for the panels below the tile row. */
export function DashboardPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-base font-medium text-foreground">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
