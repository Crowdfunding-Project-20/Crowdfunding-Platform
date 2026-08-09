@AGENTS.md
# CLAUDE.md — Frontend

Guidance for Claude Code (or any AI assistant) working in the `frontend/` directory of this project.

## Project Context

Solo-dev, school project. This is the frontend for a modular crowdfunding platform. The backend (Spring Boot, deployed on Render) is already built, tested, and live — this app is a consumer of that API, not a place to reinvent business logic. If something feels like it needs new business logic (fee calculation, ownership checks, balance validation), it almost certainly already exists on the backend — call the API, don't duplicate the rule client-side.

**Priority order when in doubt:** working > correct > clean > fast > pretty. This is a demo-quality proof of concept on a tight deadline, not production software. Don't over-engineer.

## Tech Stack

- Next.js (App Router), plain JavaScript (no TypeScript — kept out deliberately to reduce friction on a tight timeline)
- Tailwind CSS for styling
- React Context (`AuthContext`) for auth state — no Redux/Zustand/other state libraries, unnecessary for this scope
- `localStorage` for storing the JWT (acceptable tradeoff for a school project; not production-grade, and that's a known, intentional tradeoff — don't "fix" it by adding cookie-based auth or refresh tokens unless explicitly asked)
- `fetch` via one shared API helper — no axios or other HTTP libraries needed

## Backend Contract

- Base URL comes from an environment variable (`NEXT_PUBLIC_API_URL` or similar) pointing at the deployed Render backend. Never hardcode the URL in individual pages/components.
- Auth: `Authorization: Bearer <token>` header on every protected request. The shared API helper should attach this automatically — don't repeat that logic per-call.
- Swagger docs exist on the backend for the exact request/response shapes — check those before guessing a field name or endpoint shape.
- The backend already enforces all authorization rules (ownership checks, admin-only routes, balance validation on withdrawals). Any role/ownership checks done in the frontend are for **UX only** (hiding a button, redirecting away from a page) — never treat frontend checks as the real security boundary, and don't skip building the backend call correctly just because a frontend check exists.

## Pages / Routes (source of truth)

- `/login`, `/signup` — public, hit `/api/auth/login` and `/api/auth/register`
- `/` or `/campaigns` — public campaign browse (grid/list from `GET /api/campaigns`)
- `/campaigns/[id]` — public campaign detail + "Fund Campaign" action (auth required to fund)
- `/campaigns/new` — create campaign form, auth required
- `/dashboard/creator` — creator's own stats + withdraw form, auth required
- `/dashboard/backer` — logged-in user's own donation history, auth required
- `/dashboard/admin` — platform-wide stats, auth + ADMIN role required (backend enforces this; frontend just hides the nav link for non-admins)

Do not invent additional pages/routes beyond what's listed here without checking — this list matches the finalized sprint plan.

## Auth State

- `AuthContext` should expose: current user (or null), the token, `login()`, `logout()`, and a loading/hydration flag (so pages don't flash "logged out" before localStorage is read on mount).
- Any page requiring auth should redirect to `/login` if there's no valid user in context — do this consistently via a shared pattern (e.g. a wrapper/hook), not copy-pasted per page.
- Role checks (e.g. showing the admin nav link) read `user.role` from the decoded/stored user info — don't re-derive role from the raw JWT string in multiple places; decode it once, store it in context.

## What NOT to build

- No real payment UI (card forms, Stripe Elements, etc.) — funding is a simple amount input that calls the mock donation endpoint.
- No social login buttons.
- No client-side business logic that duplicates backend rules (fee math, balance checks, ownership) — display what the backend returns, validate only for basic UX (e.g. "amount must be positive" before even hitting the network).
- No new state management library, no TypeScript migration, no component library beyond Tailwind utility classes — matches the "keep it simple" spirit of the whole project.

## Working Style for Claude

- Reuse the shared API helper and `AuthContext` rather than writing new fetch/auth logic per page.
- Keep components close to the page that uses them unless something is genuinely shared across 2+ pages (e.g. a `CampaignCard`, a `StatCard`) — don't prematurely build a shared component library.
- Loading, error, and empty states are expected on every data-fetching page, not optional polish — treat "what does this look like with zero campaigns / a failed fetch / while loading" as part of building the page, not an afterthought.
- If a request implies scope beyond the routes listed above, or reintroducing something explicitly descoped (payment processor UI, social login, TypeScript, etc.), flag it rather than silently implementing it.