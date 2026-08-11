"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/dashboard/data-states";

/**
 * /dashboard — routes to the right tab for the signed-in user.
 *
 * The navbar links here rather than to a role-specific path so it doesn't need
 * to wait for the session to hydrate before rendering a correct href.
 */
export default function DashboardIndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role === "ADMIN") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/dashboard/backer");
    }
  }, [loading, user, router]);

  return <DashboardSkeleton />;
}
