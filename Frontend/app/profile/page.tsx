"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "@phosphor-icons/react";

import { useAuth } from "@/contexts/AuthContext";

/**
 * Read-only profile view.
 *
 * The backend currently exposes no profile-update endpoint and the user
 * model only carries `email` + `role`, so this page shows account info
 * without edit controls. If a profile endpoint is added later, this is
 * where an edit form would live.
 *
 * Auth-required: redirects to /login when there's no session. This is a UX
 * guard only — the real security boundary lives on the backend.
 */
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    // Reserve the viewport while the session hydrates / redirect fires.
    return null;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          The details we have for your account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Heart weight="fill" className="size-7 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-foreground">
              {user.email}
            </span>
            <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {user.role === "ADMIN" ? "Admin" : "Member"}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Profile editing isn't available yet.
      </p>
    </main>
  );
}
