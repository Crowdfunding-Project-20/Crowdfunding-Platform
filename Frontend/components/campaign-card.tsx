"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "@phosphor-icons/react";

import { cn, formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * CampaignCard — a reusable campaign tile.
 *
 * Used by the homepage discover grid and the browse page.
 * The whole card is a link to the campaign's detail page, `/campaigns/{id}`.
 *
 * `featured` tweaks the layout for the large bento cell: a taller image area
 * and the description shown. Plain cards omit the description to stay
 * compact in a 1×1 cell.
 *
 * The image area fills whatever card height is left over (`flex-1` + next/image
 * `fill`, which is absolutely positioned and so has no intrinsic height). The
 * parent grid must therefore give the card a definite height — e.g.
 * `auto-rows-[360px]`. In an auto-height row the image collapses to 0px and
 * disappears.
 *
 * Images render with `unoptimized` so any external imageUrl host
 * (Cloudinary, etc.) works without configuring next/image remotePatterns —
 * a deliberate tradeoff for a school project (no optimizer, no config).
 */

export type Campaign = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string | null;
  goalAmount: number;
  totalCollected: number;
  totalWithdrawn?: number;
  availableBalance?: number;
  status?: string;
  creatorEmail?: string;
  category?: string;
  createdAt?: string;
};

export const CAMPAIGN_CATEGORIES = [
  "EDUCATION",
  "HEALTH",
  "ENVIRONMENT",
  "BUSINESS",
  "CHARITY",
  "ARTS",
  "SPORTS",
  "TECHNOLOGY",
  "OTHER",
] as const;

export type CampaignCategory = (typeof CAMPAIGN_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  EDUCATION: "Education",
  HEALTH: "Health",
  ENVIRONMENT: "Environment",
  BUSINESS: "Business",
  CHARITY: "Charity",
  ARTS: "Arts",
  SPORTS: "Sports",
  TECHNOLOGY: "Technology",
  OTHER: "Other",
};

export function CampaignCard({
  campaign,
  featured = false,
  className,
}: {
  campaign: Campaign;
  featured?: boolean;
  className?: string;
}) {
  const { id, title, description, imageUrl, goalAmount, totalCollected, category } =
    campaign;
  // Avoid divide-by-zero on a malformed goal; clamp to 0–100.
  const goal = goalAmount > 0 ? goalAmount : 1;
  const pct = Math.min(100, Math.max(0, (totalCollected / goal) * 100));

  return (
    <Link
      href={`/campaigns/${id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        className,
      )}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Heart
              weight="duotone"
              className="size-10 text-muted-foreground/40"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3 sm:p-4">
        {category && (
          <Badge variant="secondary" className="w-fit">
            {CATEGORY_LABELS[category] || category}
          </Badge>
        )}
        <h3
          className={cn(
            "line-clamp-2 font-medium text-foreground",
            featured ? "text-lg" : "text-sm",
          )}
        >
          {title}
        </h3>
        {featured && description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div
          className="mt-1 h-1.5 w-full rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatMoney(totalCollected)}
          </span>
          <span>of {formatMoney(goalAmount)}</span>
        </div>
      </div>
    </Link>
  );
}
