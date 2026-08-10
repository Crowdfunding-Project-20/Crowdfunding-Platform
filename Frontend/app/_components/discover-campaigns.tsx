"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { CampaignCard, type Campaign } from "@/components/campaign-card";

/**
 * DiscoverCampaigns — homepage section showing a bento grid of active
 * campaigns pulled from `GET /api/campaigns`.
 *
 * Shows up to 6: the first is the featured card (spans 2×2 on the grid), the
 * rest are compact 1×1 tiles. A "See all" link points at `/campaigns`, the
 * full browse page (built later).
 *
 * Loading, error, and empty states are all handled — per CLAUDE.md these are
 * part of building a data-fetching page, not optional polish.
 */

export function DiscoverCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/campaigns")
      .then((data) => {
        if (cancelled) return;
        setCampaigns(Array.isArray(data) ? (data as Campaign[]) : []);
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

  return (
    <section className="w-full px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Discover fundraisers
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Community campaigns you can back right now.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:self-auto"
          >
            See all
            <ArrowRight weight="bold" className="size-3.5" />
          </Link>
        </div>

        {/* Body */}
        {error ? (
          <ErrorState />
        ) : campaigns === null ? (
          <LoadingSkeleton />
        ) : campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <Bento campaigns={campaigns} />
        )}
      </div>
    </section>
  );
}

/** 3×3 bento: featured card spans 2×2, up to 5 compact tiles fill the rest. */
function Bento({ campaigns }: { campaigns: Campaign[] }) {
  const featured = campaigns[0];
  const rest = campaigns.slice(1, 6);

  return (
    <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-3 md:auto-rows-[220px]">
      <CampaignCard
        campaign={featured}
        featured
        className="col-span-2 row-span-2"
      />
      {rest.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:grid-cols-3 md:auto-rows-[220px]">
      <div className="col-span-2 row-span-2 animate-pulse rounded-xl bg-muted" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <h3 className="text-lg font-medium text-foreground">No campaigns yet</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Be the first to start a campaign and rally your community.
      </p>
      <Link
        href="/campaigns/new"
        className="mt-2 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Start a campaign
      </Link>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <h3 className="text-lg font-medium text-foreground">
        We couldn't load campaigns
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
