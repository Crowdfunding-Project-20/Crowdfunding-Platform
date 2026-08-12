"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tab bar across the three dashboards.
 *
 * Built from <Link> + usePathname rather than the shadcn Tabs primitive: these
 * are real routes, so they need to be navigable, shareable and back-button
 * friendly. Tabs is state-driven and would fight the router.
 *
 * The admin tab is hidden for non-admins as a UX courtesy — the backend is what
 * actually refuses the data.
 */

const TABS = [
  { href: "/dashboard/backer", label: "Your giving", adminOnly: false },
  { href: "/dashboard/creator", label: "Your campaigns", adminOnly: false },
  { href: "/dashboard/admin", label: "Platform", adminOnly: true },
] as const;

export function DashboardTabs() {
  const pathname = usePathname();
  const { user } = useAuth();

  const visible = TABS.filter((tab) => !tab.adminOnly || user?.role === "ADMIN");

  return (
    <nav
      aria-label="Dashboard sections"
      className="flex items-center gap-1 overflow-x-auto border-b border-border pb-px"
    >
      {visible.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-3 text-sm transition-colors",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
