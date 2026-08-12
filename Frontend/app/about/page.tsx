import type { Metadata } from "next";

import { AboutStory } from "./_sections/about-story";
import { Team } from "./_sections/team";
import { Contact } from "./_sections/contact";
import { AboutFaq } from "./_sections/faq";

export const metadata: Metadata = {
  title: "About Nkoso",
  description:
    "The story, the people, and the answers — what Nkoso is, who's behind it, and how to reach us.",
};

/**
 * About page — story + team + contact + FAQ on a single route.
 *
 * A warm intro header, then a sticky in-page anchor nav keeps visitors
 * oriented as they scroll through the four sections (each set with a
 * scroll-mt offset so headings clear both the site navbar and this subnav).
 */
const SECTIONS = [
  { href: "#story", label: "Our story" },
  { href: "#team", label: "The team" },
  { href: "#contact", label: "Get in touch" },
  { href: "#faq", label: "FAQ" },
] as const;

export default function AboutPage() {
  return (
    <main className="flex flex-col">
      {/* Intro header */}
      <section className="w-full px-6 pt-16 sm:pt-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="text-sm font-medium text-primary">About Nkoso</span>
          <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Crowdfunding that feels like family.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nkoso is a crowdfunding platform built around a simple belief: when
            a community comes together, even the biggest goals become possible.
            Here&apos;s who we are, who&apos;s behind it, and how to reach us.
          </p>
        </div>
      </section>

      {/* Sticky in-page anchor nav */}
      <nav
        aria-label="Sections"
        className="sticky top-16 z-30 mt-8 w-full border-y border-border bg-background/80 backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-1 px-4 py-2.5 sm:px-6">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <AboutStory />
      <Team />
      <Contact />
      <AboutFaq />
    </main>
  );
}