"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

/**
 * Redirect-if-not-allowed guard for protected pages.
 *
 * Replaces the guard that was copy-pasted into every protected page. Returns
 * `ready` so the caller can render `null` until the session has hydrated —
 * without that, a protected page flashes its logged-out shape for one frame
 * before the redirect lands.
 *
 * This is UX only. The backend enforces every ownership and role rule; a user
 * who edits their way past this sees an empty page and 403s from the API.
 */
export function useRequireAuth(requiredRole?: "ADMIN") {
  const { user, loading } = useAuth();
  const router = useRouter();

  const allowed = !!user && (!requiredRole || user.role === requiredRole);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (requiredRole && user.role !== requiredRole) {
      // Signed in but wrong role — send them to their own dashboard rather
      // than to /login, which would read as "you've been logged out".
      router.replace("/dashboard");
    }
  }, [loading, user, requiredRole, router]);

  return { user, loading, ready: !loading && allowed };
}
