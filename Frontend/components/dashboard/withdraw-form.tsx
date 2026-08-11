"use client";

import { useState } from "react";
import { Wallet } from "@phosphor-icons/react";

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
 * The campaign list is filtered to campaigns with something to withdraw — a
 * campaign with an empty available balance has nothing to offer.
 *
 * Validation here is UX only: positive amount, not above the shown balance.
 * The backend owns the real balance check and rejects over-withdrawals.
 */

const FIELD = "flex flex-col gap-1.5";

export function WithdrawForm({
  campaigns,
  onWithdrawn,
}: {
  campaigns: Campaign[];
  onWithdrawn: () => void;
}) {
  const withdrawable = campaigns.filter((c) => (c.availableBalance ?? 0) > 0);

  const [selectedId, setSelectedId] = useState<number>(
    withdrawable[0]?.id ?? 0,
  );
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = withdrawable.find((c) => c.id === selectedId) ?? null;
  const parsed = Number(amount);

  // UX-only checks — the backend re-validates on every submit.
  const amountValid = !Number.isNaN(parsed) && parsed > 0;
  const withinBalance = selected ? parsed <= (selected.availableBalance ?? 0) : false;
  const canSubmit = amountValid && withinBalance && !submitting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !amountValid) return;
    if (!withinBalance) {
      setError("Amount can't exceed the campaign's available balance.");
      return;
    }

    setSubmitting(true);
    setError(null);
    api
      .post(`/api/campaigns/${selected.id}/withdraw`, { amount: parsed })
      .then(() => {
        setAmount("");
        setError(null);
        onWithdrawn();
      })
      .catch((err: unknown) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Try again.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              {c.title} — {formatMoney(c.availableBalance ?? 0)} available
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
        />
        {selected ? (
          <p className="text-xs text-muted-foreground">
            {formatMoney(selected.availableBalance ?? 0)} available
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={!canSubmit}>
        {submitting ? <Spinner className="size-4" /> : <Wallet className="size-4" />}
        Withdraw funds
      </Button>
    </form>
  );
}
