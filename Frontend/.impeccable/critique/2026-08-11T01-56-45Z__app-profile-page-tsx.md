---
target: profile page (app/profile/page.tsx) — account details + change password
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
p2_count: 3
p3_count: 1
timestamp: 2026-08-11T01-56-45Z
slug: app-profile-page-tsx
---
# Design Critique — `app/profile/page.tsx` (profile display + update-profile screen)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Spinner + role="status" on success, but "done" is a thin line below the button, easy to miss |
| 2 | Match System / Real World | 4 | Warm clear copy, real placeholders, descriptive CardDescriptions |
| 3 | User Control and Freedom | 3 | No cancel/undo for edits or password change — once confirmed it sticks |
| 4 | Consistency and Standards | 3 | Identity card is a raw div not Card; success green bypasses tokens; two equal full-width buttons |
| 5 | Error Prevention | 3 | Placeholders prime the user, but all validation fires only on submit |
| 6 | Recognition Rather Than Recall | 4 | Everything prefilled/visible; nothing to remember |
| 7 | Flexibility and Efficiency | 3 | Shared show/hide toggle is efficient but has a cross-field side effect |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and flat, but two stacked full forms + two giant buttons compete |
| 9 | Error Recovery | 3 | Values retained on failure (strong); one shared error not tied to a field via aria-describedby |
| 10 | Help and Documentation | 3 | Good inline context via CardDescriptions and placeholders |
| **Total** | | **32/40** | **Good** |

## Design Specificity Verdict

Mostly authored for the product, with a clear generic drift at the margins. The page keeps faith with the warm, community-fundraiser identity: "Your profile" / "The details we have for your account." (verb-first, warm "Your…" voice, no exclamation points), sentence case throughout, amber-tinted avatar fallback (`bg-primary/10 text-primary`), one amber primary CTA, and calm no-exclamation confirmations. It drifts at the margins: success messages use hardcoded Tailwind green (`text-green-700 dark:text-green-300`) instead of a token (DESIGN.md: green-as-semantic-only, CSS variables not hardcoded); the identity card is a raw `div`, not the `Card` primitive; the h1 uses `font-semibold` (600), nudging above the "400/500 only" type rule.

Deterministic scan: clean (exit 0, zero findings, zero rules fired) on `app/profile/page.tsx` and the parent dir. No false positives. No browser overlays — Playwright/Puppeteer not installed, so no user-visible overlay is available.

## Overall Impression

On-brand, structurally sound, and quietly well-built (excellent auth/session handling and a11y scaffolding). The single biggest opportunity: this is a trust surface, but the layout is two utilitarian stacked CRUD forms — it reads "forms" before it reads "your account is safe and current."

## What's Working

1. **Resilient, correct data flow.** `/api/users/me` failure falls back to context `user`; `createdAt` is optional — the page always renders a working identity card, no blank-page state. `handleSaved` refreshes both server state AND the session token after an email change (old JWT is invalidated) — subtle correctness most auth pages miss.
2. **Disciplined backend contract use.** Real validation is UX-only; the empty-string trap is called out and avoided by always sending prefilled fields. Exactly per CLAUDE.md.
3. **Quiet a11y hygiene.** Real `<Label htmlFor>`, correct `autoComplete` on every field, `aria-hidden` on decorative icons, `aria-label` toggles, `role="alert"`/`role="status"`.

## Priority Issues

- **P1 — Shared `show` state reveals all three password fields at once.** One `show` boolean drives every `PasswordField`, so toggling any eye changes all three. On a security-sensitive form this is a least-surprise failure — the user's mental model ("I revealed my current password") is wrong and can momentarily expose unintended text. Fix: per-field reveal — give `PasswordField` its own local `showPassword` state (or key the toggle by id). Suggested: `/impeccable clarify`.
- **P2 — Reveal toggle hit target is ~16px with weak focus affordance.** The eye button is `size-16` with only `hover:text-foreground`, no visible `focus-visible` treatment, no `aria-pressed`. Far below the ~44px touch target for one-handed thumb use; underspecified for keyboard/SR on a repeated-control form. Fix: pad the button to a ~44px target, add a focus ring, `aria-expanded`/`aria-pressed`. Suggested: `/impeccable harden` + `/impeccable adapt`.
- **P2 — Success/error feedback not field-scoped; green bypasses the token system.** One shared error `<p>` sits under all fields, not tied to the offending field via `aria-describedby`; success uses hardcoded `text-green-700 dark:text-green-300` instead of a token, and it appears below the button, shifting layout. Fix: define a semantic `--success`/`text-success` token in `globals.css`; anchor errors to fields via `aria-describedby`; use an `aria-live` region that doesn't reflow. Suggested: `/impeccable colorize` + `/impeccable harden`.
- **P2 — Two `w-full size="lg"` submit buttons read as near-equal, competing CTAs.** "Save changes" (amber) and "Update password" (outline) are identical size, full width, stacked. DESIGN.md's "one amber CTA per view" is respected (only one is amber), but two equal-mass buttons across a scroll makes both look primary. Fix: keep "Save changes" as the sole primary; make "Update password" non-full-width or a clearly subordinate treatment. Suggested: `/impeccable quiet`.
- **P3 — Identity card is hand-rolled markup, not the `Card` primitive.** Raw `div` with `rounded-xl border border-border bg-card p-6` while both forms use `<Card className="shadow-none">`. Fix: render the identity block as `<Card>`. Suggested: `/impeccable layout`.

## Persona Red Flags

- **Jordan (first-timer, clarity):** The shared reveal toggle breaks clarity — tapping "Show" on current-password reveals new and confirm too, so a first-timer can't explain why unrelated fields changed. Both stacked full-width buttons look like equal "do it" actions; Jordan may not know which is primary.
- **Sam (accessibility / keyboard / focus):** The eye toggle has an `aria-label` but no `aria-pressed`/`aria-expanded` and no explicit `focus-visible` ring. Errors use `role="alert"` (good) but aren't associated with a field via `aria-describedby`. Success correctly uses `role="status"`. `autoComplete` is exemplary.
- **Casey (mobile, one-handed):** Two stacked full forms, three 16px eye buttons near the right edge — tiny thumb targets, long scroll, crowded inputs on narrow widths.
- **Riley (edge cases / recovery):** Good recoveries — values retained after failed submit, password form clears only on success, fetch falls back to context. Gaps: no persistence across mid-form refresh (acceptable/secure for passwords), and no message that the session persists after a password change (the 400 is handled correctly, the UI never reassures).

## Minor Observations

- `font-semibold` (600) on the h1 nudges above the 400/500-only type rule (mitigated as the display face).
- Password button says "Saving..." — "Updating…" would be more precise.
- "Member since" only shows when the `/api/users/me` fetch succeeds — a visually silent drop on fallback.
- No post-success disabled state on either button (only during submit).
- No inline hint that changing your email logs you out of other sessions (the code already handles token invalidation) — a good candidate for a small reassurance line.
- "At least 8 characters" placeholder doubles as constraint disclosure — a nice touch.

## Questions to Consider

- Does this page need both forms at once? Could "Change password" be progressive disclosure so the account-details flow owns the page?
- Why is the done-state so quiet for the highest-stakes action (password change)? Should it reassure what keeps working (session intact)?
- If green is strictly semantic, should success be a first-class `--success` token so both modes stay in tune?
- Is a shared reveal toggle ever right for a credential form, or always a clarity tax?
- Does the "Member"/"Admin" badge earn its place, or is it decoration a trusted surface can drop?
- If the backend owns all business rules, what is this page's job emotionally — and does the current layout say "your account is safe and current"?
