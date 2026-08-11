"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CampaignCard,
  CAMPAIGN_CATEGORIES,
  CATEGORY_LABELS,
  type Campaign,
} from "@/components/campaign-card";

/**
 * Browse fundraisers — `/campaigns`.
 *
 * Public page that lists every active campaign. Visitors can search by name
 * or description, filter by category, and click a card to view the detail
 * page. The layout is inspired by the reference in public/inspo3.png but uses
 * the project's warm cream + amber palette.
 */

export default function BrowseCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/campaigns")
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? (data as Campaign[])
          : [];
        // Newest first.
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        setCampaigns(list);
        setError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCampaigns([]);
        setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    const search = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesCategory =
        activeCategory === "ALL" || campaign.category === activeCategory;
      const matchesSearch =
        !search ||
        campaign.title?.toLowerCase().includes(search) ||
        campaign.description?.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [campaigns, query, activeCategory]);

  return (
    <main className="flex flex-1 flex-col pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-primary/10 px-6 pb-16 pt-20 sm:pb-20 sm:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Discover fundraisers in your community
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Find a cause that matters to you, or start one of your own.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Search */}
        <div className="relative -mt-8 mb-6 sm:-mt-10">
          <div className="relative">
            <MagnifyingGlass
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or description"
              className="h-12 w-full rounded-3xl bg-card pl-11 text-base shadow-sm sm:h-14 sm:text-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Browse by category
          </h2>
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Button
              variant={activeCategory === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("ALL")}
              className="shrink-0 rounded-full"
            >
              All
            </Button>
            {CAMPAIGN_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 rounded-full"
              >
                {CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {error ? (
          <ErrorState />
        ) : campaigns === null ? (
          <LoadingSkeleton />
        ) : campaigns.length === 0 ? (
          <EmptyState type="no-campaigns" />
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState type="no-results" />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filteredCampaigns.length}{" "}
              {filteredCampaigns.length === 1 ? "fundraiser" : "fundraisers"}
            </p>
            {/* auto-rows gives each card a definite height — CampaignCard's
                image area fills leftover space, so it collapses to 0px in an
                auto-height row. */}
            <div className="grid auto-rows-[360px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid auto-rows-[360px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

function EmptyState({ type }: { type: "no-results" | "no-campaigns" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <h3 className="text-lg font-medium text-foreground">
        {type === "no-results" ? "No fundraisers match" : "No fundraisers yet"}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {type === "no-results"
          ? "Try a different search or category."
          : "Be the first to start a campaign and rally your community."}
      </p>
      {type === "no-campaigns" && (
        <Link
          href="/campaigns/new"
          className="mt-2 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Start a campaign
        </Link>
      )}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <h3 className="text-lg font-medium text-foreground">
        We couldn&apos;t load fundraisers
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong on our end. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Try again
      </button>
    </div>
  );
}
