"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { HandHeart, Heart, Receipt, TrendUp } from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import {
  buildCampaignTitleMap,
  deriveBackerMetrics,
  resolveTitle,
  sortByNewest,
  toCumulativeDailySeries,
  type Donation,
} from "@/lib/dashboard";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Campaign } from "@/components/campaign-card";
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
import {
  DashboardEmpty,
  DashboardError,
  DashboardPanel,
  DashboardSkeleton,
} from "@/components/dashboard/data-states";

/**
 * /dashboard/backer — the signed-in user's own giving history.
 *
 * There is no backer analytics endpoint, so the figures here are sums over
 * `GET /api/donations/my`. Donation rows carry only `campaignId`, so campaign
 * titles come from a parallel `GET /api/campaigns` and are joined client-side.
 *
 * The campaigns fetch is deliberately non-fatal: if it fails we still show the
 * full history with "Campaign #12" in place of titles, rather than erroring out
 * a page whose primary data loaded fine.
 */
export default function BackerDashboardPage() {
  const { ready } = useRequireAuth();

  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setDonations(null);
    setError(false);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();

    async function load() {
      try {
        const [mine, all] = await Promise.all([
          api.get<Donation[]>("/api/donations/my", { signal: controller.signal }),
          api
            .get<Campaign[]>("/api/campaigns", { signal: controller.signal })
            .catch(() => [] as Campaign[]),
        ]);
        if (controller.signal.aborted) return;
        setDonations(Array.isArray(mine) ? mine : []);
        setCampaigns(Array.isArray(all) ? all : []);
        setError(false);
      } catch {
        if (controller.signal.aborted) return;
        setDonations([]);
        setError(true);
      }
    }

    load();
    return () => controller.abort();
  }, [ready, reloadKey]);

  if (!ready) return <DashboardSkeleton />;
  if (error) return <DashboardError onRetry={retry} />;
  if (donations === null) return <DashboardSkeleton />;

  const metrics = deriveBackerMetrics(donations);
  const titles = buildCampaignTitleMap(campaigns);
  const history = sortByNewest(donations);
  const series = toCumulativeDailySeries(
    donations.map((d) => ({ date: d.createdAt, amount: d.amount })),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[22px] font-medium text-foreground">
          Your giving
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve funded, in one place.
        </p>
      </div>

      <HeroCard
        label="Total given"
        value={formatMoney(metrics.totalGiven)}
        meta={
          metrics.lastDonationAt
            ? `Last gift ${format(parseISO(metrics.lastDonationAt), "d MMM yyyy")}`
            : "No gifts yet"
        }
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/campaigns" />}
          >
            Find a campaign
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Campaigns supported"
          value={metrics.campaignsSupported}
          icon={<HandHeart className="size-4" />}
        />
        <StatCard
          label="Donations made"
          value={metrics.donationCount}
          icon={<Receipt className="size-4" />}
        />
        <StatCard
          label="Average gift"
          value={formatMoney(metrics.averageDonation)}
          icon={<TrendUp className="size-4" />}
        />
        <StatCard
          label="Total given"
          value={formatMoney(metrics.totalGiven)}
          icon={<Heart className="size-4" />}
        />
      </div>

      {donations.length === 0 ? (
        <DashboardEmpty
          title="Fund your first campaign"
          body="Once you support a campaign, your giving history and totals show up here."
          action={
            <Button nativeButton={false} render={<Link href="/campaigns" />}>
              Browse campaigns
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <DashboardPanel
            title="Giving over time"
            description="Cumulative total of everything you've funded"
            className="lg:col-span-2"
          >
            <TrendChart data={series} />
          </DashboardPanel>

          <DashboardPanel
            title="Latest donations"
            description={`${history.length} ${history.length === 1 ? "gift" : "gifts"}`}
            className="lg:col-span-3"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="max-w-[220px]">
                        <Link
                          href={`/campaigns/${donation.campaignId}`}
                          className="line-clamp-1 hover:text-primary hover:underline"
                        >
                          {resolveTitle(titles, donation.campaignId)}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {donation.createdAt
                          ? format(parseISO(donation.createdAt), "d MMM yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatMoney(donation.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DashboardPanel>
        </div>
      )}
    </div>
  );
}
