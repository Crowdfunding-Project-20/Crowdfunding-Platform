/**
 * Shared client-side form validation.
 *
 * These rules mirror the backend's Bean Validation constraints so the user
 * gets fast, per-field feedback without a network round-trip. The backend
 * remains the real authority — if the two ever disagree, the server's message
 * is the one shown (surfaced via `err.data.fields`).
 */

/** Bare-bones email shape: one @, non-whitespace either side, a dot in the domain. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the backend's RegisterRequest pattern: 3-30 alphanumerics/underscores. */
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export type LoginFieldErrors = Partial<Record<"identifier" | "password", string>>;

/**
 * Login accepts an email *or* a username in one field (the backend matches
 * either). If the value contains an "@" it must be a valid email; otherwise it
 * must be a valid username.
 */
export function validateLogin(identifier: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  const value = identifier.trim();
  if (!value) {
    errors.identifier = "Enter your email or username.";
  } else if (value.includes("@")) {
    if (!EMAIL_RE.test(value)) {
      errors.identifier = "Enter a valid email address.";
    }
  } else if (!USERNAME_RE.test(value)) {
    errors.identifier =
      "Username must be 3-30 characters — letters, numbers, or underscores.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

export type CampaignField = "title" | "description" | "goalAmount" | "category" | "image";
export type CampaignFieldErrors = Partial<Record<CampaignField, string>>;

export type CampaignFormValues = {
  title: string;
  description: string;
  goalAmount: string;
  category: string;
  /** Whether a cover image is currently attached (new upload or existing). */
  hasImage: boolean;
};

export const TITLE_MIN = 5;
export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 2000;

/**
 * Campaign create/edit form. `requireImage` is true on the create page (a cover
 * is mandatory there) and false on edit, where the existing cover is kept.
 */
export function validateCampaign(
  values: CampaignFormValues,
  requireImage = false,
): CampaignFieldErrors {
  const errors: CampaignFieldErrors = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = "Give your fundraiser a title.";
  } else if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    errors.title = `Title must be between ${TITLE_MIN} and ${TITLE_MAX} characters.`;
  }

  const description = values.description.trim();
  if (!description) {
    errors.description = "Tell people why this campaign matters.";
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${DESCRIPTION_MAX} characters.`;
  }

  const goal = Number(values.goalAmount);
  if (!values.goalAmount.trim() || !Number.isFinite(goal) || goal <= 0) {
    errors.goalAmount = "Enter a goal amount greater than zero.";
  } else if (goal >= 10_000_000_000) {
    errors.goalAmount = "Goal amount must be below 10,000,000,000.";
  }

  if (!values.category) {
    errors.category = "Choose a category for your fundraiser.";
  }

  if (requireImage && !values.hasImage) {
    errors.image = "Add a cover image for your fundraiser.";
  }

  return errors;
}