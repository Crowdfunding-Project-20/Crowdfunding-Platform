"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { api } from "@/lib/api";
import type { Campaign } from "@/components/campaign-card";
import { DashboardSkeleton } from "@/components/dashboard/data-states";

/**
 * /dashboard — routes to the right tab for the signed-in user.
 *
 * The navbar links here rather than to a role-specific path so it doesn't need
 * to wait for the session to hydrate before rendering a correct href.
 *
 * Only role the session carries is USER or ADMIN, so a creator is decided by
 * whether they have created any campaigns: admins → admin, anyone with at
 * least one campaign → creator, everyone else → backer.
 */
export default function DashboardIndexPage() {
  const { user } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }
    // No role distinguishes creator from backer — decide by whether the user
    // has created any campaigns. Backer is the fallback for a fresh account.
    api
      .get<Campaign[]>("/api/campaigns/my")
      .then((mine) => {
        router.replace(
          Array.isArray(mine) && mine.length > 0
            ? "/dashboard/creator"
            : "/dashboard/backer",
        );
      })
      .catch(() => router.replace("/dashboard/backer"));
  }, [user, router]);

  return <DashboardSkeleton />;
}