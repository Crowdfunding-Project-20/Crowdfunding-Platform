"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

/**
 * ClosingCta — the final conversion nudge at the bottom of the homepage.
 *
 * Like the hero, it's context-aware: logged-in users start a new campaign,
 * visitors create an account first. Its amber CTA is separated from the hero's
 * by a full viewport of scroll, so it respects the "one saturated amber per
 * screen" rule — every middle section stays CTA-neutral.
 */
export function ClosingCta() {
  const { user } = useAuth();
  const ctaHref = user ? "/campaigns/new" : "/signup";

  return (
    <section className="w-full px-6 py-20 sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-xl border border-border bg-card px-6 py-14 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {user ? "Ready to start your next campaign?" : "Ready to rally your community?"}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground sm:text-base">
          {user
            ? "Turn your idea into a campaign in a few minutes."
            : "Create an account and start raising funds today."}
        </p>
        <Button
          size="lg"
          nativeButton={false}
          className="h-12 rounded-full px-8 text-base"
          render={<Link href={ctaHref} />}
        >
          {user ? "Start a campaign" : "Create your account"}
          <ArrowRight weight="bold" />
        </Button>
      </div>
    </section>
  );
}
