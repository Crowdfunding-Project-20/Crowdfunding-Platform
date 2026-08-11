@AGENTS.md
# CLAUDE.md — Frontend

Guidance for Claude Code (or any AI assistant) working in the `frontend/` directory of this project.

## Project Context

Solo-dev, school project. This is the frontend for a modular crowdfunding platform. The backend (Spring Boot, deployed on Render) is already built, tested, and live — this app is a consumer of that API, not a place to reinvent business logic. If something feels like it needs new business logic (fee calculation, ownership checks, balance validation), it almost certainly already exists on the backend — call the API, don't duplicate the rule client-side.

**Priority order when in doubt:** working > correct > clean > fast > pretty. This is a demo-quality proof of concept on a tight deadline, not production software. Don't over-engineer.

## Tech Stack

- Next.js (App Router), **TypeScript** — every file under `app/`, `components/` and `contexts/` is `.tsx`/`.ts`. The one exception is `lib/api.js`, which stays JS and exposes JSDoc generics so `api.get<T>()` still type-checks from TSX callers.
- Tailwind CSS **v4, CSS-first** — there is no `tailwind.config.*`. All theme tokens live in `app/globals.css` under `@theme inline`, and dark mode is the class strategy via `@custom-variant dark (&:is(.dark *))`.
- **shadcn/ui** (`components/ui/`, ~60 primitives) built on `@base-ui/react` — note: Base UI, *not* Radix, so component APIs differ from the shadcn docs. Icons are `@phosphor-icons/react` (use the `/dist/ssr` entry in server components). Charts are `recharts` via the `components/ui/chart.tsx` wrapper.
- React Context (`AuthContext`) for auth state — no Redux/Zustand/other state libraries, unnecessary for this scope
- `localStorage` for storing the JWT (acceptable tradeoff for a school project; not production-grade, and that's a known, intentional tradeoff — don't "fix" it by adding cookie-based auth or refresh tokens unless explicitly asked)
- `fetch` via one shared API helper — no axios or other HTTP libraries needed

## Backend Contract

- The API helper calls **same-origin `/api/*` paths**. `next.config.ts` rewrites those to `NEXT_PUBLIC_API_URL` server-to-server, so CORS never applies and the browser never sees the backend URL. Read `NEXT_PUBLIC_API_URL` only in `next.config.ts` — never in a page or component.
- Auth: `Authorization: Bearer <token>` header on every protected request. The shared API helper should attach this automatically — don't repeat that logic per-call.
- Swagger docs exist on the backend for the exact request/response shapes — check those before guessing a field name or endpoint shape.
- The backend already enforces all authorization rules (ownership checks, admin-only routes, balance validation on withdrawals). Any role/ownership checks done in the frontend are for **UX only** (hiding a button, redirecting away from a page) — never treat frontend checks as the real security boundary, and don't skip building the backend call correctly just because a frontend check exists.

## Pages / Routes (source of truth)

- `/login`, `/signup` — public, hit `/api/auth/login` and `/api/auth/register`
- `/` or `/campaigns` — public campaign browse (grid/list from `GET /api/campaigns`)
- `/campaigns/[id]` — public campaign detail + "Fund Campaign" action (auth required to fund)
- `/campaigns/new` — create campaign form, auth required
- `/dashboard` — redirects to the right tab for the user's role; the navbar links here
- `/dashboard/creator` — creator's own stats + withdraw form, auth required
- `/dashboard/backer` — logged-in user's own donation history, auth required
- `/dashboard/admin` — platform-wide stats, auth + ADMIN role required (backend enforces this; frontend just hides the nav link for non-admins)

The three dashboards share `app/dashboard/layout.tsx` and its tab bar.

Do not invent additional pages/routes beyond what's listed here without checking — this list matches the finalized sprint plan.

## Auth State

- `AuthContext` should expose: current user (or null), the token, `login()`, `logout()`, and a loading/hydration flag (so pages don't flash "logged out" before localStorage is read on mount).
- Any page requiring auth should redirect to `/login` if there's no valid user in context — use the shared `useRequireAuth()` hook in `hooks/use-require-auth.ts`, not a copy-pasted guard. Pass `"ADMIN"` for admin-only pages.
- Role checks (e.g. showing the admin nav link) read `user.role` from the decoded/stored user info — don't re-derive role from the raw JWT string in multiple places; decode it once, store it in context.

## What NOT to build

- No real payment UI (card forms, Stripe Elements, etc.) — funding is a simple amount input that calls the mock donation endpoint.
- No social login buttons.
- No client-side business logic that duplicates backend rules (fee math, balance checks, ownership) — display what the backend returns, validate only for basic UX (e.g. "amount must be positive" before even hitting the network).
- No new state management library — matches the "keep it simple" spirit of the whole project. (Reach for an existing `components/ui/` primitive before hand-rolling markup, but don't add a *new* component library on top of shadcn.)

## Working Style for Claude

- Reuse the shared API helper and `AuthContext` rather than writing new fetch/auth logic per page.
- Keep components close to the page that uses them unless something is genuinely shared across 2+ pages (e.g. a `CampaignCard`, a `StatCard`) — don't prematurely build a shared component library.
- Loading, error, and empty states are expected on every data-fetching page, not optional polish — treat "what does this look like with zero campaigns / a failed fetch / while loading" as part of building the page, not an afterthought.
- If a request implies scope beyond the routes listed above, or reintroducing something explicitly descoped (payment processor UI, social login, etc.), flag it rather than silently implementing it.

## Design Direction
@DESIGN.md

## API Integration
@apis.json

## Fund Campaign Flow

The "Fund this campaign" action opens a modal (not a new route) with 3 internal steps: `amount` → `processing` → `receipt`. Manage the step as local state in one component rather than three separate components.

- **Amount step**: preset pills ($10/$25/$50/$100) + a custom number input, sharing one source of truth for the current amount (selecting a preset fills the input; don't track preset selection separately from the input value). Show a fee breakdown line under the input (e.g. "You're giving $25. $1.25 supports the platform."). Disable "Confirm donation" until the amount is a valid positive number.
- **Processing step**: purely frontend theater — wrap a `setTimeout` (~1200ms) *before* calling `POST /api/donations`. Never add an artificial delay on the backend; the API already responds instantly and should stay that way.
- **Receipt step**: on success, show a checkmark, the amount, campaign name, timestamp, and the donation's `id` as a reference number — all straight from the existing `DonationResponse`, no new backend fields needed. One "Done" button closes the modal.
- **On close**: update the campaign detail page's displayed `totalCollected` (refetch or callback prop — match whatever data-flow pattern the rest of the page already uses).
- **On failure**: catch the error, return to the amount step (or a distinct error step) with a short message and a retry option. Never leave the user stuck on the processing spinner indefinitely.

This flow is entirely frontend presentation over an already-complete backend endpoint (`POST /api/donations`) — no backend changes are needed to build it.