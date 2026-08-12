"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Coins, Users, Megaphone, ArrowUp } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { fundedPercent, toCumulativeDailySeries } from "@/lib/dashboard";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Campaign } from "@/components/campaign-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HeroCard } from "@/components/dashboard/hero-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { WithdrawForm } from "@/components/dashboard/withdraw-form";
import {
  DashboardEmpty,
  DashboardError,
  DashboardPanel,
  DashboardSkeleton,
} from "@/components/dashboard/data-states";

/**
 * /dashboard/creator — how the signed-in user's own campaigns are doing.
 *
 * Combines the analytics summary with the campaign list: the summary carries
 * the headline figures and the only time series the backend exposes
 * (`recentDonations`), the list drives the per-campaign table and the withdraw
 * form's campaign picker.
 */

type CreatorDashboard = {
  totalRaised: number;
  totalWithdrawn: number;
  availableBalance: number;
  numberOfBackers: number;
  numberOfCampaigns: number;
  recentDonations?: { date: string; amount: number }[];
};

export default function CreatorDashboardPage() {
  const { ready } = useRequireAuth();

  const [stats, setStats] = useState<CreatorDashboard | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);
  const retry = useCallback(() => {
    setStats(null);
    setError(false);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();

    async function load() {
      try {
        const [summary, mine] = await Promise.all([
          api.get<CreatorDashboard>("/api/analytics/creator", {
            signal: controller.signal,
          }),
          api.get<Campaign[]>("/api/campaigns/my", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setStats(summary);
        setCampaigns(Array.isArray(mine) ? mine : []);
        setError(false);
      } catch {
        if (controller.signal.aborted) return;
        setError(true);
      }
    }

    load();
    return () => controller.abort();
  }, [ready, reloadKey]);

  // useMemo must stay above every early return — calling it after one of the
  // returns below would change the hook count between renders (Rules of Hooks).
  const series = useMemo(
    () => toCumulativeDailySeries(stats?.recentDonations ?? []),
    [stats],
  );
  const hasWithdrawable = campaigns.some((c) => (c.availableBalance ?? 0) > 0);

  if (!ready) return <DashboardSkeleton />;
  if (error) return <DashboardError onRetry={retry} />;
  if (stats === null) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[22px] font-medium text-foreground">
          Your campaigns
        </h1>
        <p className="text-sm text-muted-foreground">
          How your fundraisers are tracking, and what&apos;s ready to withdraw.
        </p>
      </div>

      <HeroCard
        label="Available to withdraw"
        value={formatMoney(stats.availableBalance)}
        meta={`of ${formatMoney(stats.totalRaised)} raised across ${
          stats.numberOfCampaigns
        } ${stats.numberOfCampaigns === 1 ? "campaign" : "campaigns"}`}
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
          label="Total raised"
          value={formatMoney(stats.totalRaised)}
          icon={<Coins className="size-4" />}
        />
        <StatCard
          label="Total withdrawn"
          value={formatMoney(stats.totalWithdrawn)}
          icon={<ArrowUp className="size-4" />}
        />
        <StatCard
          label="Backers"
          value={stats.numberOfBackers}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Campaigns"
          value={stats.numberOfCampaigns}
          icon={<Megaphone className="size-4" />}
        />
      </div>

      {campaigns.length === 0 ? (
        <DashboardEmpty
          title="Start your first campaign"
          body="Raise funds for something your community cares about. Your stats will show up here once it's live."
          action={
            <Button nativeButton={false} render={<Link href="/campaigns/new" />}>
              Create campaign
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-5">
            <DashboardPanel
              title="Raised over time"
              description="Cumulative total across your campaigns"
              className="lg:col-span-3"
            >
              {series.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Your funding trend appears once your first donation lands.
                </p>
              ) : (
                <TrendChart data={series} />
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Withdraw funds"
              description="Move collected funds out of a campaign"
              className="lg:col-span-2"
            >
              {hasWithdrawable ? (
                <WithdrawForm campaigns={campaigns} onWithdrawn={refresh} />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Nothing to withdraw yet. Funds appear here as your campaigns
                  collect donations.
                </p>
              )}
            </DashboardPanel>
          </div>

          <DashboardPanel
            title="Campaign performance"
            description={`${campaigns.length} ${
              campaigns.length === 1 ? "campaign" : "campaigns"
            }`}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="w-[160px]">Progress</TableHead>
                    <TableHead className="text-right">Raised</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const pct = fundedPercent(
                      campaign.totalCollected,
                      campaign.goalAmount,
                    );
                    // `pct` can exceed 100 for overfunded campaigns; cap only
                    // the fill width so the bar stays inside its track while
                    // the % text below keeps climbing.
                    const barWidth = Math.min(100, pct);
                    const met = pct >= 100;
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="max-w-[240px]">
                          <div className="flex flex-col gap-1">
                            <Link
                              href={`/campaigns/${campaign.id}`}
                              className="line-clamp-1 hover:text-primary hover:underline"
                            >
                              {campaign.title}
                            </Link>
                            {met ? (
                              <Badge variant="success" className="w-fit">
                                Goal met
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* aria-valuenow is clamped to 100 (the bar can't
                              overflow its track) while the visible % text below
                              keeps climbing — intentional for overfunded goals. */}
                          <div
                            className="h-1.5 w-full rounded-full bg-muted"
                            role="progressbar"
                            aria-valuenow={Math.round(barWidth)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${campaign.title} funding progress`}
                          >
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {Math.round(pct)}% of {formatMoney(campaign.goalAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatMoney(campaign.totalCollected)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatMoney(campaign.availableBalance ?? 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </DashboardPanel>
        </>
      )}
    </div>
  );
}
