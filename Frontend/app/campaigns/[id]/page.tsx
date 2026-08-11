"use client";

import { use, useCallback, useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, Heart, Spinner, UserCircle } from "@phosphor-icons/react";

import { api, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
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
import { FundCampaignModal } from "./fund-campaign-modal";

/**
 * Campaign detail page — `/campaigns/[id]`.
 *
 * Shows the campaign cover, story, progress, and a funding form.
 * Anonymous visitors can view everything; the donation action forces login.
 */

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

  function handleOpenFund() {
    if (!user) {
      router.push("/login");
      return;
    }
    setFundOpen(true);
  }

  // Refresh the campaign's figures (totalCollected, %-funded) after a donation.
  const handleDonated = useCallback(async () => {
    const data = await api.get<Campaign>(`/api/campaigns/${id}`);
    setCampaign(data);
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !campaign) {
    return <ErrorState />;
  }

  const isOwner = user?.email === campaign.creatorEmail;
  const goal = campaign.goalAmount > 0 ? campaign.goalAmount : 1;
  const pct = Math.min(
    100,
    Math.max(0, (campaign.totalCollected / goal) * 100),
  );

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
              {campaign.status && (
                <Badge
                  variant={
                    campaign.status === "ACTIVE" ? "default" : "secondary"
                  }
                >
                  {campaign.status.toLowerCase()}
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
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
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
                onDonated={handleDonated}
              />

              {!user && (
                <p className="text-center text-sm text-muted-foreground">
                  Sign in to make a donation.
                </p>
              )}
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Creator actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="outline" className="w-full rounded-3xl" render={<a href={`/campaigns/${campaign.id}/edit`} />}>
                  Edit fundraiser
                </Button>
                <WithdrawForm
                  campaignId={campaignId}
                  available={campaign.availableBalance ?? 0}
                  onSuccess={() =>
                    api
                      .get<Campaign>(`/api/campaigns/${campaignId}`)
                      .then((data) => setCampaign(data))
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
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
        text: "Withdrawal request processed successfully.",
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
