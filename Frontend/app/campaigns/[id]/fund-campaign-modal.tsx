"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Spinner } from "@phosphor-icons/react";

import { api, ApiError } from "@/lib/api";
import { cn, formatMoney } from "@/lib/utils";
import type { Campaign } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  campaign: Pick<Campaign, "id" | "title">;
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

  const value = Number(amount);
  const isValid = amount !== "" && Number.isFinite(value) && value > 0;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Fund this campaign</DialogTitle>
        <DialogDescription>{campaign.title}</DialogDescription>
      </DialogHeader>

      <DialogContent className="gap-6">
        <div className="flex min-h-[20rem] flex-col">
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
              <Spinner className="size-6 animate-spin text-amber-600" />
              <p className="text-sm text-muted-foreground">Processing…</p>
            </div>
          )}

          {step === "receipt" && response && (
            <div className="flex flex-1 flex-col items-center gap-2 pt-2 text-center">
              <CheckCircle
                weight="fill"
                className="size-12 text-emerald-600"
              />
              <span className="font-heading text-3xl font-medium text-foreground">
                {formatMoney(response.amount)}
              </span>
              <div className="flex flex-col items-center gap-0.5 text-sm text-muted-foreground">
                <span>{campaign.title}</span>
                <span>{format(new Date(response.createdAt), "MMM d, yyyy · HH:mm")}</span>
                <span>Donation #{response.id}</span>
              </div>
              <DialogFooter className="mt-auto w-full pt-2">
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
