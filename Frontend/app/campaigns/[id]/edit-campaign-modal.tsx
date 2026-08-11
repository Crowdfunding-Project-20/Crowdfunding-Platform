"use client";

import { useEffect, useRef, useState, FormEvent, DragEvent } from "react";
import Image from "next/image";
import { UploadSimple, X, Spinner } from "@phosphor-icons/react";

import { api, ApiError } from "@/lib/api";
import {
  Campaign,
  CAMPAIGN_CATEGORIES,
  CATEGORY_LABELS,
} from "@/components/campaign-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Edit fundraiser — a modal (not a route) for a creator to update their own
 * campaign. Closed over the same controlled `Dialog` pattern as the fund modal,
 * pre-filled from the current campaign on each open (it's remounted via `key`,
 * so state initializers run fresh).
 *
 * Success PUTs to `/api/campaigns/{id}`, then the page re-fetches the campaign
 * (via `onSaved`) so the detail view updates immediately. Image is optional on
 * edit: an existing cover is preserved unless a new file is chosen or removed.
 */

type EditCampaignModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  onSaved: () => void | Promise<void>;
};

export function EditCampaignModal({
  open,
  onOpenChange,
  campaign,
  onSaved,
}: EditCampaignModalProps) {
  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description ?? "");
  const [goalAmount, setGoalAmount] = useState(String(campaign.goalAmount));
  const [category, setCategory] = useState(campaign.category ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    campaign.imageUrl ?? null,
  );
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    campaign.imageUrl ?? null,
  );
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free the object URL on unmount (or when a new preview replaces it).
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP, ...).");
      return;
    }
    setError(null);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic UX validation — the backend (title + goalAmount + category) is the real authority.
    if (!title.trim()) {
      setError("Give your fundraiser a title.");
      return;
    }
    const goal = Number(goalAmount);
    if (!goalAmount || !Number.isFinite(goal) || goal <= 0) {
      setError("Enter a goal amount greater than zero.");
      return;
    }
    if (!category) {
      setError("Choose a category for your fundraiser.");
      return;
    }

    setSaving(true);
    try {
      // If a new cover was chosen, upload it first (Cloudinary → URL).
      let finalImageUrl = imageUrl;
      if (image) {
        const fd = new FormData();
        fd.append("file", image);
        const { url } = await api.post<{ url: string }>(
          "/api/images/upload",
          fd,
        );
        finalImageUrl = url;
      }

      await api.put<Campaign>(`/api/campaigns/${campaign.id}`, {
        title: title.trim(),
        description: description.trim(),
        goalAmount: goal,
        imageUrl: finalImageUrl,
        category,
      });

      void onSaved(); // refresh the detail page
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Edit fundraiser</DialogTitle>
        <DialogDescription>{campaign.title}</DialogDescription>
      </DialogHeader>

      <DialogContent className="gap-6 sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              type="text"
              placeholder="Give your fundraiser a clear, compelling title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              rows={4}
              placeholder="Tell people why this campaign matters, what you'll do with the funds, and who it helps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-goalAmount">Goal amount</Label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground"
                aria-hidden="true"
              >
                GH₵
              </span>
              <Input
                id="edit-goalAmount"
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                placeholder="How much do you need to raise?"
                className="h-12 rounded-3xl pl-12 text-lg"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? "")}
            >
              <SelectTrigger id="edit-category" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cover image — optional on edit; keeps the existing cover if unchanged */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-image">Cover image</Label>
            <input
              ref={fileInputRef}
              id="edit-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={saving}
            />

            {preview ? (
              <div className="relative overflow-hidden rounded-3xl border border-border bg-muted">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={preview}
                    alt="Campaign cover preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                  onClick={() => {
                    setPreview(null);
                    setImage(null);
                    setImageUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  dragging
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60"
                }`}
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <UploadSimple size={22} weight="bold" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-medium text-primary">
                    Choose an image
                  </span>{" "}
                  or drag and drop it here
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP — this becomes your fundraiser cover
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="mt-1 w-full gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-3xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-3xl"
            >
              {saving ? (
                <>
                  <Spinner className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
