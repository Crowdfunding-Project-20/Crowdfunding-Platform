import Link from "next/link";
import { ArrowRight, Heart } from "@phosphor-icons/react/dist/ssr";

/**
 * AboutTeaser — a warm "who we are" band near the bottom of the homepage.
 *
 * Sits between DiscoverCampaigns and Faq as a brief, low-pressure introduction
 * to Nkoso, with a quiet outline pill ("See more") that links through to the
 * full story on /about. No saturated CTA here — the hero already owns that
 * spot on this screen (see DESIGN.md), so the pill stays outline/neutral.
 */
export function AboutTeaser() {
  return (
    <section className="w-full px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 overflow-hidden rounded-2xl border border-border bg-primary/10 px-6 py-10 sm:px-12 sm:py-12 md:flex-row md:items-center md:justify-between dark:bg-primary/15">
          {/* Copy */}
          <div className="flex max-w-xl flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Heart weight="fill" className="size-4" />
              About Nkoso
            </span>
            <h2 className="font-heading text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
              We believe every good idea deserves a community behind it.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Nkoso is a small crowdfunding platform built by people who want
              raising money to feel like an act of community — not a business
              transaction.
            </p>
          </div>

          {/* Action */}
          <div className="shrink-0">
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 dark:bg-transparent dark:hover:bg-input/30"
            >
              See more
              <ArrowRight weight="bold" className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}