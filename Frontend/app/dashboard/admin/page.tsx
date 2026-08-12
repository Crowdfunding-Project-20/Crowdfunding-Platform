"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Buildings, Receipt, TrendUp, Users } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { HeroCard } from "@/components/dashboard/hero-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  DashboardEmpty,
  DashboardError,
  DashboardPanel,
  DashboardSkeleton,
} from "@/components/dashboard/data-states";

/**
 * /dashboard/admin — platform-wide analytics.
 *
 * The role check here is UX only: it keeps non-admins from landing on a page
 * they can't populate. The backend is what actually refuses the data.
 *
 * No trend chart on this page — AdminDashboardResponse exposes only scalars and
 * `topCampaigns`, with no time series to plot. The ranked list carries the
 * visual weight instead of a fabricated one.
 */

type TopCampaign = { id: number; title: string; totalCollected: number };

type AdminDashboard = {
  totalPlatformRaised: number;
  totalFeesCollected: number;
  totalCampaigns: number;
  totalUsers: number;
  topCampaigns?: TopCampaign[];
};

export default function AdminDashboardPage() {
  const { ready } = useRequireAuth("ADMIN");

  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setStats(null);
    setError(false);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();

    api
      .get<AdminDashboard>("/api/analytics/admin", { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setStats(data);
        setError(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(true);
      });

    return () => controller.abort();
  }, [ready, reloadKey]);

  if (!ready) return <DashboardSkeleton />;
  if (error) return <DashboardError onRetry={retry} />;
  if (stats === null) return <DashboardSkeleton />;

  const top = stats.topCampaigns ?? [];
  // Bars are scaled against the leader, so the ranking stays readable whatever
  // the absolute amounts are.
  const leader = top.reduce((max, c) => Math.max(max, c.totalCollected || 0), 0);
  const feeShare =
    stats.totalPlatformRaised > 0
      ? (stats.totalFeesCollected / stats.totalPlatformRaised) * 100
      : 0;
  const avgPerCampaign =
    stats.totalCampaigns > 0 ? stats.totalPlatformRaised / stats.totalCampaigns : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[22px] font-medium text-foreground">
          Platform
        </h1>
        <p className="text-sm text-muted-foreground">
          How Nkoso is doing across every campaign.
        </p>
      </div>

      <HeroCard
        label="Total raised on the platform"
        value={formatMoney(stats.totalPlatformRaised)}
        meta={`across ${stats.totalCampaigns} ${
          stats.totalCampaigns === 1 ? "campaign" : "campaigns"
        } and ${stats.totalUsers} ${stats.totalUsers === 1 ? "member" : "members"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Avg. per campaign"
          value={formatMoney(avgPerCampaign)}
          icon={<TrendUp className="size-4" />}
        />
        <StatCard
          label="Fees collected"
          value={formatMoney(stats.totalFeesCollected)}
          hint={`${feeShare.toFixed(1)}% of funds raised`}
          icon={<Receipt className="size-4" />}
        />
        <StatCard
          label="Campaigns"
          value={stats.totalCampaigns}
          icon={<Buildings className="size-4" />}
        />
        <StatCard
          label="Members"
          value={stats.totalUsers}
          icon={<Users className="size-4" />}
        />
      </div>

      <DashboardPanel
        title="Top campaigns"
        description="Ranked by total collected"
      >
        {top.length === 0 ? (
          <DashboardEmpty
            title="No campaigns yet"
            body="Once members start raising funds, the leaders show up here."
          />
        ) : (
          <ol className="flex flex-col gap-4">
            {top.map((campaign, index) => {
              const width = leader > 0 ? (campaign.totalCollected / leader) * 100 : 0;
              return (
                <li key={campaign.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {index + 1}
                      </span>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="line-clamp-1 text-sm hover:text-primary hover:underline"
                      >
                        {campaign.title}
                      </Link>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-foreground">
                      {formatMoney(campaign.totalCollected)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </DashboardPanel>
    </div>
  );
}
