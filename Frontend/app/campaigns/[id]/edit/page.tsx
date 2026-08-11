"use client";

import { use, useEffect, useRef, useState, FormEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, UploadSimple, X } from "@phosphor-icons/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Campaign,
  CAMPAIGN_CATEGORIES,
  CATEGORY_LABELS,
} from "@/components/campaign-card";

import { api, ApiError } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Edit Campaign page — `/campaigns/[id]/edit`.
 *
 * Creator-only. A full page (not a modal) so the whole form stays visible,
 * laid out like the "Raise funds" create page and pre-filled from the current
 * campaign. Success PUTs to `/api/campaigns/{id}`, then redirects back to the
 * campaign detail page.
 *
 * Goal-lock rule: once a campaign has received donations (totalCollected > 0),
 * its goal can no longer be changed — the goal input is disabled and a note is
 * shown. This is enforced server-side too; the UI lock is UX only.
 */

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, ready } = useRequireAuth();

  const campaignId = Number(id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Owner guard — only the creator edits their own campaign (UX only; the
  // backend PUT enforces ownership as the real boundary).
  const isOwner = !!user && user.email === campaign?.creatorEmail;

  useEffect(() => {
    if (!ready || !campaign) return;
    if (!isOwner) {
      router.replace(`/campaigns/${campaignId}`);
    }
  }, [ready, campaign, isOwner, campaignId, router]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const abort = new AbortController();

    async function load() {
      try {
        const data = await api.get<Campaign>(`/api/campaigns/${id}`, {
          signal: abort.signal,
        });
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
  }, [id, ready]);

  if (!ready || !user) return null;

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center text-muted-foreground">Loading…</div>
      </main>
    );
  }

  if (error || !campaign) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="text-muted-foreground">
          This fundraiser could not be loaded.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href={`/campaigns/${campaignId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to campaign
      </Link>

      {/* Page heading + caption */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Edit fundraiser
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Update your story and keep your community in the loop.
        </p>
      </div>

      <EditCampaignForm campaign={campaign} campaignId={campaignId} />
    </main>
  );
}

/**
 * The editable form, seeded once from the loaded campaign. Lives in its own
 * component so the field state initializers run fresh from the campaign data.
 */
function EditCampaignForm({
  campaign,
  campaignId,
}: {
  campaign: Campaign;
  campaignId: number;
}) {
  const router = useRouter();

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

  // The goal is locked once the campaign has received any donation.
  const goalLocked = campaign.totalCollected > 0;

  // Free the object URL when the preview changes or the page unmounts.
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

      await api.put<Campaign>(`/api/campaigns/${campaignId}`, {
        title: title.trim(),
        description: description.trim(),
        goalAmount: goal,
        imageUrl: finalImageUrl,
        category,
      });

      router.push(`/campaigns/${campaignId}`);
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
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">
          Fundraiser details
        </CardTitle>
        <CardDescription>
          Save your changes and your community will see them right away.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              type="text"
              autoFocus
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
              rows={5}
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
                disabled={saving || goalLocked}
              />
            </div>
            {goalLocked && (
              <p className="text-xs text-muted-foreground">
                Goal can&apos;t be changed once donations are received.
              </p>
            )}
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
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
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

          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="mt-2 w-full"
          >
            {saving ? (
              <>
                <Spinner />
                Saving changes...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}