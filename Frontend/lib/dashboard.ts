/**
 * Pure derivation helpers for the dashboards.
 *
 * The backend owns all business rules (fees, balances, ownership). Nothing here
 * re-implements one — these only reshape data the API already returned so it
 * can be charted or tabulated. No React, no fetching, so it stays trivially
 * testable and reusable across all three dashboards.
 */

import { format, parseISO } from "date-fns";

import type { Campaign } from "@/components/campaign-card";

export type Donation = {
  id: number;
  campaignId: number;
  amount: number;
  feePercentSnapshot?: number;
  createdAt: string;
};

/** A single {date, amount} point, as returned by the creator analytics endpoint. */
export type SeriesPoint = { date: string; amount: number };

/* ─── Campaign title resolution ───────────────────────────────────── */

/**
 * Donation rows carry only `campaignId`, so titles come from a separate
 * campaigns fetch and get joined here.
 */
export function buildCampaignTitleMap(campaigns: Campaign[] | null | undefined) {
  const map = new Map<number, string>();
  for (const campaign of campaigns ?? []) {
    if (campaign?.id != null && campaign.title) map.set(campaign.id, campaign.title);
  }
  return map;
}

/**
 * `GET /api/campaigns` only returns *active* campaigns, so a donation to a
 * closed or fully-funded one won't resolve. Fall back to the ID rather than
 * rendering a blank cell.
 */
export function resolveTitle(map: Map<number, string>, campaignId: number) {
  return map.get(campaignId) ?? `Campaign #${campaignId}`;
}

/* ─── Time series ─────────────────────────────────────────────────── */

/**
 * Collapse raw points into one entry per calendar day, ascending.
 *
 * `key` is the ISO day (stable for sorting), `label` is what the axis shows.
 */
export function bucketByDay(points: SeriesPoint[]): { key: string; label: string; amount: number }[] {
  const buckets = new Map<string, number>();

  for (const point of points) {
    if (!point?.date) continue;
    let key: string;
    try {
      key = format(parseISO(point.date), "yyyy-MM-dd");
    } catch {
      continue; // Unparseable timestamp — skip rather than poison the series
    }
    buckets.set(key, (buckets.get(key) ?? 0) + (Number(point.amount) || 0));
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({
      key,
      label: format(parseISO(key), "d MMM"),
      amount,
    }));
}

/**
 * Running total across a bucketed series.
 *
 * The dashboards chart cumulative totals rather than per-day amounts: with the
 * handful of donations a campaign gets in practice, a per-day chart is mostly
 * empty gaps, while a cumulative curve stays readable at any data density.
 */
export function toCumulative(series: { key: string; label: string; amount: number }[]) {
  let running = 0;
  return series.map((point) => {
    running += point.amount;
    return { ...point, amount: running };
  });
}

/** Bucket by day, then accumulate — the series every trend chart plots. */
export function toCumulativeDailySeries(points: SeriesPoint[]) {
  return toCumulative(bucketByDay(points));
}

/* ─── Backer metrics ──────────────────────────────────────────────── */

/**
 * There is no backer analytics endpoint, so these come from the donation list.
 * Purely descriptive sums over what the user already sees — no business rules.
 */
export function deriveBackerMetrics(donations: Donation[]) {
  const donationCount = donations.length;
  const totalGiven = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const campaignsSupported = new Set(donations.map((d) => d.campaignId)).size;
  const averageDonation = donationCount > 0 ? totalGiven / donationCount : 0;

  const lastDonationAt = donations.reduce<string | null>((latest, d) => {
    if (!d.createdAt) return latest;
    if (!latest) return d.createdAt;
    return new Date(d.createdAt) > new Date(latest) ? d.createdAt : latest;
  }, null);

  return { totalGiven, campaignsSupported, donationCount, averageDonation, lastDonationAt };
}

/** Newest first — the order history tables read in. */
export function sortByNewest<T extends { createdAt?: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );
}

/** Clamped 0–100 funding percentage, guarding a zero or malformed goal. */
export function fundedPercent(collected: number, goal: number) {
  const safeGoal = goal > 0 ? goal : 1;
  return Math.min(100, Math.max(0, (collected / safeGoal) * 100));
}
