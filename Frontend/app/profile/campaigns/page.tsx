"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Coins, Megaphone, Target, TrendUp } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { deriveCreatorMetrics, sortByNewest } from "@/lib/dashboard";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { CampaignCard, type Campaign } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { HeroCard } from "@/components/dashboard/hero-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  DashboardEmpty,
  DashboardError,
  DashboardSkeleton,
} from "@/components/dashboard/data-states";

/**
 * /profile/campaigns — the signed-in user's own fundraisers, as cards.
 *
 * Unlike the /dashboard/creator analytics view (status + withdraw), this page
 * is where a creator goes to find a campaign they've built and click through to
 * edit it — each card links to the detail page, which shows the "Edit
 * fundraiser" action for the owner. The headline figures are sums over
 * `GET /api/campaigns/my`; there's no dedicated card-list analytics endpoint.
 */

export default function MyCampaignsPage() {
  const { ready } = useRequireAuth();

  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setCampaigns(null);
    setError(false);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();

    async function load() {
      try {
        const mine = await api.get<Campaign[]>("/api/campaigns/my", {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setCampaigns(Array.isArray(mine) ? mine : []);
        setError(false);
      } catch {
        if (controller.signal.aborted) return;
        setCampaigns([]);
        setError(true);
      }
    }

    load();
    return () => controller.abort();
  }, [ready, reloadKey]);

  if (!ready) return <DashboardSkeleton />;
  if (error) return <DashboardError onRetry={retry} />;
  if (campaigns === null) return <DashboardSkeleton />;

  const metrics = deriveCreatorMetrics(campaigns);
  const list = sortByNewest(campaigns);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[22px] font-medium text-foreground">
          Your fundraisers
        </h1>
        <p className="text-sm text-muted-foreground">
          Every campaign you&apos;ve created, ready to view or edit.
        </p>
      </div>

      <HeroCard
        label="Total raised"
        value={formatMoney(metrics.totalCollected)}
        meta={`Across ${metrics.campaignCount} ${
          metrics.campaignCount === 1 ? "campaign" : "campaigns"
        }`}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/campaigns/new" />}
          >
            Create campaign
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Campaigns"
          value={metrics.campaignCount}
          icon={<Megaphone className="size-4" />}
        />
        <StatCard
          label="Total goal"
          value={formatMoney(metrics.totalGoal)}
          icon={<Target className="size-4" />}
        />
        <StatCard
          label="Available to withdraw"
          value={formatMoney(metrics.availableBalance)}
          icon={<Coins className="size-4" />}
        />
        <StatCard
          label="Total raised"
          value={formatMoney(metrics.totalCollected)}
          icon={<TrendUp className="size-4" />}
        />
      </div>

      {list.length === 0 ? (
        <DashboardEmpty
          title="Start your first campaign"
          body="Raise funds for something your community cares about. Your fundraisers will show up here once they're live."
          action={
            <Button nativeButton={false} render={<Link href="/campaigns/new" />}>
              Create campaign
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {list.length} {list.length === 1 ? "fundraiser" : "fundraisers"}
          </p>
          {/* auto-rows gives each card a definite height — CampaignCard's
              image area fills leftover space, so it collapses to 0px in an
              auto-height row. */}
          <div className="grid auto-rows-[360px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
