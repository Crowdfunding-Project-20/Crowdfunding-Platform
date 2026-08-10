"use client";

import { useState, useEffect, useRef, FormEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, UploadSimple, X } from "@phosphor-icons/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAMPAIGN_CATEGORIES,
  CATEGORY_LABELS,
} from "@/components/campaign-card";

import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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

type CampaignResponse = { id: number };

/**
 * Create Campaign page — `/campaigns/new` (the "Raise funds" action).
 *
 * Authenticated only. User fills in title, description, goal amount and
 * selects a cover image, then we:
 *   1. upload the image to the backend (`/api/images/upload` → Cloudinary URL)
 *   2. create the campaign with that URL (`/api/campaigns`)
 *   3. redirect to the new campaign's detail page
 *
 * All four fields are required. Validation here is basic UX only — the
 * backend (which enforces title + goalAmount) is the real authority.
 */
export default function CreateCampaignPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth guard — users must be signed in to create a campaign (UX only).
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Free the object URL when the preview changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (loading || !user) return null;

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WebP, ...).");
      return;
    }
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setImage(file);
    setPreview(url);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic UX validation — all fields required.
    if (!title.trim()) {
      setError("Give your fundraiser a title.");
      return;
    }
    if (!description.trim()) {
      setError("Tell people why this campaign matters.");
      return;
    }
    const goal = Number(goalAmount);
    if (!goalAmount || !Number.isFinite(goal) || goal <= 0) {
      setError("Enter a goal amount greater than zero.");
      return;
    }
    if (!image) {
      setError("Add a cover image for your fundraiser.");
      return;
    }
    if (!category) {
      setError("Choose a category for your fundraiser.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload the image and get back a hosted URL.
      const fd = new FormData();
      fd.append("file", image);
      const { url } = await api.post<{ url: string }>("/api/images/upload", fd);

      // 2. Create the campaign with that image URL.
      const campaign = await api.post<CampaignResponse>("/api/campaigns", {
        title: title.trim(),
        description: description.trim(),
        goalAmount: goal,
        imageUrl: url,
        category,
      });

      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
      {/* Page heading + caption */}
      <div className="mb-8 flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Create a fundraiser
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Share your story, set a goal, and let your community rally behind your
          idea.
        </p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Fundraiser details
          </CardTitle>
          <CardDescription>
            A little detail now goes a long way in getting people to donate.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                autoFocus
                placeholder="Give your fundraiser a clear, compelling title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Tell people why this campaign matters, what you'll do with the funds, and who it helps..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="goalAmount">Goal amount</Label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground"
                  aria-hidden="true"
                >
                  $
                </span>
                <Input
                  id="goalAmount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="any"
                  placeholder="How much do you need to raise?"
                  className="h-12 rounded-3xl pl-8 text-lg"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
                <SelectTrigger id="category" className="w-full">
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

            {/* Image upload */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">Cover image</Label>
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={submitting}
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
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview(null);
                      setImage(null);
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
              disabled={submitting}
              size="lg"
              className="mt-2 w-full"
            >
              {submitting ? (
                <>
                  <Spinner />
                  Creating campaign...
                </>
              ) : (
                <>
                  Create campaign
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
