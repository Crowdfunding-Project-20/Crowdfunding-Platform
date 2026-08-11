"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Check,
  CheckCircle,
  Copy,
  Heart,
  Spinner,
} from "@phosphor-icons/react";

import { api, ApiError } from "@/lib/api";
import { cn, formatMoney } from "@/lib/utils";
import type { Campaign } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Fund this campaign — a modal (not a route) with 3 internal steps:
 * `amount` → `processing` → `receipt`. State is local to this single component.
 *
 * Success posts to `POST /api/donations`, then the page re-fetches the campaign
 * (via `onDonated`) so `totalCollected` stays in sync.
 */

const PRESETS = [10, 25, 50, 100]; // GH₵

// Mirrors PlatformSettings.feePercent on the backend. No settings endpoint exists
// yet, so this is hardcoded for now — swap for a fetch when one is available.
const FEE_PERCENT = 5;

/** GH₵ with up to 2 decimals — for the fee breakdown (formatMoney rounds to whole cedis). */
function fmtGhs(amount: number) {
  return (
    "GH₵" +
    amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
  );
}

type Step = "amount" | "processing" | "receipt";

type DonationResponse = {
  id: number;
  campaignId: number;
  amount: number;
  feePercentSnapshot: number;
  createdAt: string;
};

type FundCampaignModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Pick<
    Campaign,
    "id" | "title" | "imageUrl" | "goalAmount" | "totalCollected"
  >;
  onDonated: () => void | Promise<void>;
};

export function FundCampaignModal({
  open,
  onOpenChange,
  campaign,
  onDonated,
}: FundCampaignModalProps) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [response, setResponse] = useState<DonationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const value = Number(amount);
  const isValid = amount !== "" && Number.isFinite(value) && value > 0;

  // Mini progress status — same guard/cap logic as the campaign detail page:
  // the label can keep climbing past 100% (overfunded), the bar never overflows.
  const goal = campaign.goalAmount > 0 ? campaign.goalAmount : 1;
  const pct = Math.max(0, (campaign.totalCollected / goal) * 100);
  const barWidth = Math.min(100, pct);

  async function handleConfirm() {
    if (!isValid) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    setStep("processing");
    try {
      // Frontend theater before the POST — the API responds instantly and stays that way.
      await new Promise((r) => setTimeout(r, 1200));
      const res = await api.post<DonationResponse>("/api/donations", {
        campaignId: campaign.id,
        amount: value,
        anonymous,
      });
      setResponse(res);
      void onDonated(); // refresh totalCollected; don't fail the receipt on a refresh error
      setStep("receipt");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Try again."
      );
      setStep("amount");
    }
  }

  async function handleCopyReference() {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(`Donation #${response.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the reference stays
      // visible on screen, so there's nothing meaningful to recover here.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative gap-5 overflow-hidden sm:max-w-[26rem]">
        {/* Soft amber accents — same warmth as the withdrawal status card */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 size-24 rounded-full bg-primary/5"
          aria-hidden="true"
        />

        {/* Header: cover thumbnail (or heart medallion) + campaign context */}
        <div className="relative flex items-center gap-3 pr-8">
          {campaign.imageUrl ? (
            <Image
              src={campaign.imageUrl}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="size-11 shrink-0 rounded-2xl object-cover ring-1 ring-foreground/10"
            />
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Heart size={20} weight="duotone" />
            </span>
          )}
          <div className="flex min-w-0 flex-col">
            <DialogTitle className="text-lg leading-snug">
              Fund this campaign
            </DialogTitle>
            <DialogDescription className="truncate">
              {campaign.title}
            </DialogDescription>
          </div>
        </div>

        <div className="relative flex min-h-[19rem] flex-col">
          {step === "amount" && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const selected = Number(amount) === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(String(p))}
                      className={cn(
                        "rounded-full border border-transparent bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800",
                        selected && "border-2 border-amber-600"
                      )}
                    >
                      {formatMoney(p)}
                    </button>
                  );
                })}
              </div>

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
                  min="1"
                  step="any"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 rounded-3xl pl-14 text-lg"
                />
              </div>

              {isValid && (
                <p className="text-[13px] text-muted-foreground">
                  You&apos;re giving {fmtGhs(value)}.{" "}
                  {fmtGhs((value * FEE_PERCENT) / 100)} supports the platform.
                </p>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Mini progress status — anchors the donation in the campaign's goal */}
              <div className="flex flex-col gap-1.5 rounded-2xl bg-primary/5 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatMoney(campaign.totalCollected)} of{" "}
                    {formatMoney(campaign.goalAmount)} goal
                  </span>
                  <span className="font-medium text-foreground">
                    {Math.round(pct)}% funded
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
                <Switch
                  checked={anonymous}
                  onCheckedChange={setAnonymous}
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    Donate anonymously
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Your username won&apos;t appear on the backer list
                  </span>
                </span>
              </label>

              <Button
                type="button"
                size="lg"
                disabled={!isValid}
                onClick={handleConfirm}
                className="mt-auto w-full rounded-3xl"
              >
                Confirm donation
              </Button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Spinner className="size-6 animate-spin" />
              </span>
              <p className="text-sm text-muted-foreground">Processing…</p>
            </div>
          )}

          {step === "receipt" && response && (
            <div className="flex flex-1 flex-col items-center gap-3 pt-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                <CheckCircle weight="fill" className="size-8" />
              </span>

              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-3xl font-medium text-foreground">
                  {formatMoney(response.amount)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {campaign.title}
                </span>
              </div>

              <div className="w-full rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(response.createdAt), "MMM d, yyyy · HH:mm")}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Donation #{response.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {copied ? (
                    <Check size={13} weight="bold" />
                  ) : (
                    <Copy size={13} />
                  )}
                  {copied ? "Copied" : "Copy reference"}
                </button>
              </div>

              <DialogFooter className="mt-auto w-full pt-1">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  className="w-full rounded-3xl"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}