"use client";

import { use, useCallback, useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUp,
  Heart,
  Spinner,
  Star,
  Trash,
  UserCircle,
  Users,
} from "@phosphor-icons/react";

import { api, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Campaign, CATEGORY_LABELS } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FundCampaignModal } from "./fund-campaign-modal";

/**
 * Campaign detail page — `/campaigns/[id]`.
 *
 * Shows the campaign cover, story, progress, and a funding form.
 * Anonymous visitors can view everything; the donation action forces login.
 */

/** A donation as returned by the public backers endpoint. Anonymous donations
 * never appear here — the backend strips them from this list entirely. */
type BackerDonation = {
  id: number;
  campaignId: number;
  amount: number;
  feePercentSnapshot: number;
  createdAt: string;
  backerUsername: string;
  anonymous: boolean;
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [donors, setDonors] = useState<BackerDonation[] | null>(null);

  const campaignId = Number(id);

  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();

    async function load() {
      try {
        const data = await api.get<Campaign>(`/api/campaigns/${id}`, { signal: abort.signal });
        if (cancelled) return;
        setCampaign(data);
        setError(false);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [id]);

  // Public backers list. Failure is non-fatal — the page should render fine even
  // if this optional list is unavailable, so it degrades to an empty card.
  useEffect(() => {
    let cancelled = false;

    async function loadBackers() {
      try {
        const data = await api.get<BackerDonation[]>(
          `/api/campaigns/${id}/donations`
        );
        if (!cancelled) setDonors(data ?? []);
      } catch {
        if (!cancelled) setDonors([]);
      }
    }

    loadBackers();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleOpenFund() {
    if (!user) {
      router.push("/login");
      return;
    }
    setFundOpen(true);
  }

  // Refresh the campaign after a donation or an edit (totalCollected, title,
  // cover, %-funded...) so the page reflects the latest data immediately.
  // The backers list is refreshed alongside so a fresh donation shows up in the
  // sidebar without a manual reload.
  const refreshCampaign = useCallback(async () => {
    const data = await api.get<Campaign>(`/api/campaigns/${id}`);
    setCampaign(data);
    try {
      const backers = await api.get<BackerDonation[]>(
        `/api/campaigns/${id}/donations`
      );
      setDonors(backers ?? []);
    } catch {
      setDonors([]);
    }
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !campaign) {
    return <ErrorState />;
  }

  const isOwner = user?.email === campaign.creatorEmail;
  const goal = campaign.goalAmount > 0 ? campaign.goalAmount : 1;
  // Raw progress — allowed past 100% when a campaign is overfunded, so the
  // "% funded" line keeps climbing as donations keep arriving after the goal.
  const pct = Math.max(0, (campaign.totalCollected / goal) * 100);
  // The fill caps at a full bar (it can't overflow its track); only the
  // percentage text above keeps moving.
  const barWidth = Math.min(100, pct);
  // Display-only: once an active campaign reaches its goal, present it as
  // "completed" on the detail page. The stored status is unchanged (the
  // backend keeps ACTIVE), and funding stays open so overfunding is still
  // allowed.
  const displayStatus =
    campaign.status === "ACTIVE" && campaign.totalCollected >= goal
      ? "completed"
      : campaign.status;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      {/* Cover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-muted sm:aspect-[21/9]">
        {campaign.imageUrl ? (
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Heart
              weight="duotone"
              className="size-16 text-muted-foreground/40"
            />
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {campaign.category && (
                <Badge variant="secondary">
                  {CATEGORY_LABELS[campaign.category] || campaign.category}
                </Badge>
              )}
              {displayStatus && (
                <Badge
                  variant={
                    displayStatus === "ACTIVE" || displayStatus === "completed"
                      ? "default"
                      : "secondary"
                  }
                >
                  {displayStatus.toLowerCase()}
                </Badge>
              )}
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <UserCircle className="size-4" />
              <span>Created by {campaign.creatorEmail}</span>
              {campaign.createdAt && (
                <>
                  <span className="text-border">·</span>
                  <span>{format(new Date(campaign.createdAt), "MMMM d, yyyy")}</span>
                </>
              )}
            </div>
          </div>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>About this fundraiser</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                {campaign.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funding card */}
        <div className="flex flex-col gap-5">
          <Card className="shadow-none">
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-3xl font-semibold text-foreground">
                    {formatMoney(campaign.totalCollected)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of {formatMoney(campaign.goalAmount)} goal
                  </span>
                </div>
                <div
                  className="h-2.5 w-full rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={Math.round(barWidth)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round(pct)}% funded
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleOpenFund}
                className="w-full rounded-3xl"
              >
                Fund this campaign
                <ArrowRight size={16} />
              </Button>

              <FundCampaignModal
                key={fundOpen ? "open" : "closed"}
                open={fundOpen}
                onOpenChange={setFundOpen}
                campaign={campaign}
                onDonated={refreshCampaign}
              />

              {!user && (
                <p className="text-center text-sm text-muted-foreground">
                  Sign in to make a donation.
                </p>
              )}
            </CardContent>
          </Card>

          </div>
      </div>

      {isOwner && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Manage fundraiser</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full rounded-3xl"
                onClick={() => router.push(`/campaigns/${campaignId}/edit`)}
              >
                Edit fundraiser
              </Button>
              <DeleteCampaignDialog
                campaignId={campaignId}
                title={campaign.title}
                available={campaign.availableBalance ?? 0}
                onDeleted={() => router.push("/campaigns")}
              />
              <WithdrawForm
                campaignId={campaignId}
                available={campaign.availableBalance ?? 0}
                onSuccess={refreshCampaign}
              />
            </CardContent>
          </Card>
          <WithdrawalStatusCard
            totalWithdrawn={campaign.totalWithdrawn ?? 0}
            available={campaign.availableBalance ?? 0}
          />
        </div>
      )}

      <BackersSection
        donors={donors}
        totalCollected={campaign.totalCollected}
        onFund={handleOpenFund}
      />
    </main>
  );
}

/** Deterministic warm accents so every backer's medallion looks like a little portrait. */
const DONOR_COLORS = [
  "bg-amber-100 text-amber-900",
  "bg-orange-100 text-orange-900",
  "bg-yellow-100 text-yellow-900",
  "bg-rose-100 text-rose-900",
  "bg-stone-200 text-stone-800",
  "bg-orange-200 text-orange-950",
];

function donorColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  }
  return DONOR_COLORS[hash % DONOR_COLORS.length];
}

/** "Just now" for the first minute, then date-fns relative time. */
function timeAgo(iso: string) {
  const then = new Date(iso);
  const diff = Date.now() - then.getTime();
  if (Number.isNaN(diff)) return "";
  if (diff < 60_000) return "just now";
  return formatDistanceToNow(then, { addSuffix: true });
}

function DonorMedallion({
  username,
  className = "size-9 text-sm",
}: {
  username: string;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-medium ${donorColor(
        username
      )} ${className}`}
    >
      {username.charAt(0).toUpperCase()}
    </span>
  );
}

function BackersSection({
  donors,
  totalCollected,
  onFund,
}: {
  donors: BackerDonation[] | null;
  totalCollected: number;
  onFund: () => void;
}) {
  const list = donors ?? [];
  // The biggest single gift earns a hero spotlight; everyone else forms the wall.
  const top =
    list.length > 0
      ? list.reduce((a, b) => (b.amount > a.amount ? b : a))
      : null;
  const wall = top ? list.filter((d) => d.id !== top.id) : [];
  const total = list.reduce((s, d) => s + d.amount, 0);

  return (
    <Card className="relative overflow-hidden shadow-none">
      {/* Warm accents — the same soft blobs as the withdrawal status card */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-12 size-36 rounded-full bg-primary/5"
        aria-hidden="true"
      />
      <CardContent className="relative flex flex-col gap-6 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Users size={18} weight="duotone" />
          </span>
          <CardTitle>Backers</CardTitle>
          {donors && donors.length > 0 && (
            <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {donors.length}
            </span>
          )}
        </div>

        {donors === null ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : donors.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users size={28} weight="duotone" />
            </span>
            <p className="font-heading text-lg font-medium text-foreground">
              No public donations yet
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Be the first to back this campaign — every gift moves the goal.
            </p>
            <Button
              type="button"
              size="lg"
              onClick={onFund}
              className="mt-1 w-full max-w-xs rounded-3xl"
            >
              Fund this campaign
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 divide-x divide-border/60 rounded-2xl border border-primary/10 bg-primary/5 text-center">
              <div className="px-4 py-3">
                <p className="font-heading text-2xl font-semibold text-foreground">
                  {donors.length}
                </p>
                <p className="text-xs text-muted-foreground">backers</p>
              </div>
              <div className="px-4 py-3">
                <p className="font-heading text-2xl font-semibold text-foreground">
                  {formatMoney(total)}
                </p>
                <p className="text-xs text-muted-foreground">raised from backers</p>
              </div>
              <div className="px-4 py-3">
                <p className="font-heading text-2xl font-semibold text-foreground">
                  {top ? formatMoney(top.amount) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">biggest gift</p>
              </div>
            </div>

            {top && (
              <div className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <DonorMedallion
                    username={top.backerUsername}
                    className="size-14 text-xl"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <Star size={14} weight="fill" />
                      Biggest backer
                    </span>
                    <span className="font-heading text-xl font-medium text-foreground">
                      {top.backerUsername}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(top.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-medium text-muted-foreground">
                    Biggest single gift
                  </p>
                  <p className="font-heading text-3xl font-semibold text-primary">
                    {formatMoney(top.amount)}
                  </p>
                </div>
              </div>
            )}

            {wall.length > 0 && (
              <ul className="flex flex-col divide-y divide-border/60">
                {wall.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-3">
                    <DonorMedallion username={d.backerUsername} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {d.backerUsername}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(d.createdAt)}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-foreground">
                      {formatMoney(d.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {total < totalCollected && (
              <p className="text-center text-xs text-muted-foreground">
                Some supporters chose to give anonymously — their names
                don&apos;t appear here.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WithdrawalStatusCard({
  totalWithdrawn,
  available,
}: {
  totalWithdrawn: number;
  available: number;
}) {
  const nothingYet = totalWithdrawn <= 0 && available <= 0;
  const raised = totalWithdrawn + available;
  const withdrawnPct = raised > 0 ? (totalWithdrawn / raised) * 100 : 0;

  return (
    <Card className="relative overflow-hidden shadow-none">
      {/* Soft amber accents to give the panel a bit of warmth */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-primary/5"
        aria-hidden="true"
      />
      <CardContent className="relative flex flex-col gap-5 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ArrowUp size={18} weight="duotone" />
          </span>
          <CardTitle>Withdrawal status</CardTitle>
        </div>

        {nothingYet ? (
          <p className="py-2 text-sm text-muted-foreground">
            Nothing withdrawn yet. Funds appear here as your campaign collects
            donations.
          </p>
        ) : (
          <>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Left to withdraw
                </p>
                <p className="mt-1 font-heading text-3xl font-semibold text-primary">
                  {formatMoney(available)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground">
                  Withdrawn
                </p>
                <p className="mt-1 font-heading text-xl font-medium text-foreground">
                  {formatMoney(totalWithdrawn)}
                </p>
              </div>
            </div>

            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${withdrawnPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {Math.round(withdrawnPct)}% of raised funds withdrawn
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WithdrawForm({
  campaignId,
  available,
  onSuccess,
}: {
  campaignId: number;
  available: number;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleWithdraw(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value <= 0) {
      setMessage({ type: "error", text: "Enter an amount greater than zero." });
      return;
    }
    if (value > available) {
      setMessage({
        type: "error",
        text: `You can only withdraw up to ${formatMoney(available)}.`,
      });
      return;
    }
    setWithdrawing(true);
    try {
      await api.post(`/api/campaigns/${campaignId}/withdraw`, { amount: value });
      setAmount("");
      setMessage({
        type: "success",
        text: `${formatMoney(value)} moved out of your campaign.`,
      });
      await onSuccess();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Try again.",
      });
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <form onSubmit={handleWithdraw} className="flex flex-col gap-3">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertTitle>
            {message.type === "success" ? "Withdrawal successful" : "Withdrawal failed"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground"
          aria-hidden="true"
        >
          GH₵
        </span>
        <Input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="any"
          max={available}
          placeholder="Withdraw amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={withdrawing}
          className="h-10 rounded-3xl pl-12"
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        disabled={withdrawing}
        className="w-full rounded-3xl"
      >
        {withdrawing ? <Spinner className="size-4" /> : "Withdraw funds"}
      </Button>
    </form>
  );
}

function DeleteCampaignDialog({
  campaignId,
  title,
  available,
  onDeleted,
}: {
  campaignId: number;
  title: string;
  available: number;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/api/campaigns/${campaignId}`);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="w-full rounded-3xl"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Trash size={16} />
        Delete campaign
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setError(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{title}&rdquo; will be removed and can&apos;t be brought
              back.
              {available > 0 && (
                <span className="mt-1 block">
                  You have {formatMoney(available)} available — withdraw it
                  before deleting.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <>
                  <Spinner className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete campaign"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="aspect-[16/9] w-full animate-pulse rounded-3xl bg-muted sm:aspect-[21/9]" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded-xl bg-muted" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </main>
  );
}

function ErrorState() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h2 className="font-heading text-xl font-medium text-foreground">
        Couldn&apos;t load this fundraiser
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        It may have been removed or there was a connection problem.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Try again
      </button>
    </main>
  );
}
