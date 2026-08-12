"use client";

import { useState } from "react";
import { CheckCircle, Wallet } from "@phosphor-icons/react";

import { api, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { Campaign } from "@/components/campaign-card";

/**
 * Withdraw form for the creator dashboard.
 *
 * Withdrawal is the highest-stakes action on this surface — it moves collected
 * funds out of a campaign — so it gets the same confirm-succeed dignity as the
 * fund-donation flow, rather than posting on click with no feedback. Three
 * inline steps: `amount` → `confirm` → `success`, all inside the host panel.
 *
 * Validation here is UX only: positive amount, not above the shown balance.
 * The backend owns the real balance check and rejects over-withdrawals.
 */

const FIELD = "flex flex-col gap-1.5";

type Step = "amount" | "confirm" | "success";

export function WithdrawForm({
  campaigns,
  onWithdrawn,
}: {
  campaigns: Campaign[];
  onWithdrawn: () => void;
}) {
  const withdrawable = campaigns.filter((c) => (c.availableBalance ?? 0) > 0);

  const [step, setStep] = useState<Step>("amount");
  const [selectedId, setSelectedId] = useState<number>(
    withdrawable[0]?.id ?? 0,
  );
  const [amount, setAmount] = useState("");
  // Amount we actually withdrew, for the success step.
  const [withdrawn, setWithdrawn] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = withdrawable.find((c) => c.id === selectedId) ?? null;
  const parsed = Number(amount);

  // UX-only checks — the backend re-validates on every submit.
  const amountValid = !Number.isNaN(parsed) && parsed > 0;
  const withinBalance = selected ? parsed <= (selected.availableBalance ?? 0) : false;
  const canContinue = amountValid && withinBalance && !submitting;

  // Compute the over-balance condition live so the explanatory error is
  // reachable even though the submit button is disabled (see #53).
  const overBalanceError =
    amountValid && selected && parsed > (selected.availableBalance ?? 0)
      ? "Amount can't exceed the campaign's available balance."
      : null;

  function handleOpenConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !amountValid) return;
    if (overBalanceError) return;
    setError(null);
    setStep("confirm");
  }

  function handleConfirm() {
    if (!selected || !amountValid) return;
    setSubmitting(true);
    setError(null);
    api
      .post(`/api/campaigns/${selected.id}/withdraw`, { amount: parsed })
      .then(() => {
        setWithdrawn(parsed);
        setAmount("");
        setStep("success");
        onWithdrawn();
      })
      .catch((err: unknown) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Try again.",
        );
        // Return to the amount step so the error reads beside the field.
        setStep("amount");
      })
      .finally(() => setSubmitting(false));
  }

  function handleDone() {
    setAmount("");
    setWithdrawn(0);
    setError(null);
    setStep("amount");
  }

  // Confirm & success steps share a centred card layout.
  if (step === "confirm" && selected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-lg font-medium text-foreground">
            Withdraw {formatMoney(parsed)} from {selected.title}?
          </p>
          <p className="text-sm text-muted-foreground">
            This moves funds out of your campaign. It can&apos;t be undone.
          </p>
        </div>
        <p className="rounded-2xl bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          {formatMoney(selected.availableBalance ?? 0)} available to withdraw
        </p>
        {error ? (
          <p id="withdraw-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="w-full"
          >
            {submitting ? (
              <Spinner className="size-4" />
            ) : (
              <Wallet className="size-4" />
            )}
            Confirm withdrawal
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={handleDone}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success ring-1 ring-success/20 dark:text-success">
          <CheckCircle weight="fill" className="size-6" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="font-heading text-xl font-medium text-foreground">
            Withdrawal complete
          </p>
          <p className="text-sm text-muted-foreground">
            {formatMoney(withdrawn)} moved out of your campaign
          </p>
        </div>
        <Button type="button" onClick={handleDone} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleOpenConfirm} className="flex flex-col gap-3">
      <div className={FIELD}>
        <Label htmlFor="withdraw-campaign">Campaign</Label>
        <NativeSelect
          id="withdraw-campaign"
          className="w-full"
          value={selectedId}
          onChange={(e) => {
            setSelectedId(Number(e.target.value));
            setError(null);
          }}
        >
          {withdrawable.map((c) => (
            <NativeSelectOption key={c.id} value={c.id}>
              {c.title}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className={FIELD}>
        <Label htmlFor="withdraw-amount">Amount</Label>
        <Input
          id="withdraw-amount"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          disabled={submitting}
          aria-invalid={amount !== "" && !amountValid}
          aria-describedby={`withdraw-balance-hint${overBalanceError ? " withdraw-error" : ""}${error ? " withdraw-error" : ""}`}
        />
        {selected ? (
          <p id="withdraw-balance-hint" className="text-xs text-muted-foreground">
            {formatMoney(selected.availableBalance ?? 0)} available · a 5% platform fee applies
          </p>
        ) : null}
        {overBalanceError ? (
          <p id="withdraw-error" role="alert" className="text-sm text-destructive">
            {overBalanceError}
          </p>
        ) : null}
        {!overBalanceError && error ? (
          <p id="withdraw-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={!canContinue}>
        {submitting ? <Spinner className="size-4" /> : <Wallet className="size-4" />}
        Withdraw funds
      </Button>
    </form>
  );
}