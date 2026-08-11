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
import { validateCampaign, type CampaignFieldErrors } from "@/lib/validation";

type CampaignResponse = { id: number };

/** Focusable fields in display order — image is validated but not auto-focused. */
const FIELD_ORDER: (keyof CampaignFieldErrors)[] = [
  "title",
  "description",
  "goalAmount",
  "category",
];

/** Focus the first invalid field so the error is immediately visible. */
function focusFirstError(errors: CampaignFieldErrors) {
  for (const key of FIELD_ORDER) {
    if (errors[key]) {
      document.getElementById(key)?.focus();
      return;
    }
  }
}

/**
 * Create Campaign page — `/campaigns/new` (the "Raise funds" action).
 *
 * Authenticated only. User fills in title, description, goal amount and
 * selects a cover image, then we:
 *   1. upload the image to the backend (`/api/images/upload` → Cloudinary URL)
 *   2. create the campaign with that URL (`/api/campaigns`)
 *   3. redirect to the new campaign's detail page
 *
 * All five fields are required; rules mirror the backend's Bean Validation so
 * the user gets per-field feedback immediately.
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
  // Per-field validation messages (shown under the affected control).
  const [fieldErrors, setFieldErrors] = useState<CampaignFieldErrors>({});
  // Form-level banner for server rejections (auth expiry, outages, ...).
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  /** Re-typing in a field (or picking a new file) clears its error. */
  function clearFieldError(field: keyof CampaignFieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "Please choose an image file (JPG, PNG, WebP, ...).",
      }));
      return;
    }
    clearFieldError("image");
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
    setSubmitError(null);

    // Per-field validation — matches the backend's rules.
    const errors = validateCampaign(
      { title, description, goalAmount, category, hasImage: !!image },
      true, // cover image is required on create
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      return;
    }
    // The validator required an image, so narrowing here is guaranteed — but TS
    // only sees `!!image`, so re-narrow into a local for the form data below.
    const coverImage = image;
    if (!coverImage) return;

    setSubmitting(true);
    try {
      // 1. Upload the image and get back a hosted URL.
      const fd = new FormData();
      fd.append("file", coverImage);
      const { url } = await api.post<{ url: string }>("/api/images/upload", fd);

      // 2. Create the campaign with that image URL.
      const campaign = await api.post<CampaignResponse>("/api/campaigns", {
        title: title.trim(),
        description: description.trim(),
        goalAmount: Number(goalAmount),
        imageUrl: url,
        category,
      });

      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.data?.fields) {
        // Backend rejected specific fields (400) → per-field messages.
        setFieldErrors(err.data.fields as CampaignFieldErrors);
      } else {
        setSubmitError(
          err instanceof ApiError ? err.message : "Something went wrong. Try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
      {/* Page heading + caption */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
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
                aria-invalid={!!fieldErrors.title || undefined}
                aria-describedby={fieldErrors.title ? "title-error" : undefined}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearFieldError("title");
                }}
                disabled={submitting}
              />
              {fieldErrors.title && (
                <p id="title-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Tell people why this campaign matters, what you'll do with the funds, and who it helps..."
                value={description}
                aria-invalid={!!fieldErrors.description || undefined}
                aria-describedby={fieldErrors.description ? "description-error" : undefined}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearFieldError("description");
                }}
                disabled={submitting}
              />
              {fieldErrors.description && (
                <p id="description-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="goalAmount">Goal amount</Label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground"
                  aria-hidden="true"
                >
                  GH₵
                </span>
                <Input
                  id="goalAmount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="any"
                  placeholder="How much do you need to raise?"
                  className="h-12 rounded-3xl pl-12 text-lg"
                  value={goalAmount}
                  aria-invalid={!!fieldErrors.goalAmount || undefined}
                  aria-describedby={fieldErrors.goalAmount ? "goalAmount-error" : undefined}
                  onChange={(e) => {
                    setGoalAmount(e.target.value);
                    clearFieldError("goalAmount");
                  }}
                  disabled={submitting}
                />
              </div>
              {fieldErrors.goalAmount && (
                <p id="goalAmount-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.goalAmount}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value ?? "");
                  clearFieldError("category");
                }}
              >
                <SelectTrigger
                  id="category"
                  className="w-full"
                  aria-invalid={!!fieldErrors.category || undefined}
                  aria-describedby={fieldErrors.category ? "category-error" : undefined}
                >
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
              {fieldErrors.category && (
                <p id="category-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.category}
                </p>
              )}
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
              {fieldErrors.image && (
                <p id="image-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.image}
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
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
