# CLAUDE.md — Backend

Guidance for Claude Code (or any AI assistant) working in the `backend/` directory of this project.

## Project Context

Solo-dev, 7-day school project: a modular crowdfunding platform (Spring Boot + PostgreSQL). Simulated payments only — no real payment processor. Keep-what-you-raise funding model (no escrow/refund logic). Multi-creator, monolith architecture.

**Priority order when in doubt:** working > correct > clean > fast > pretty. This is a demo-quality proof of concept, not production software. Don't over-engineer.

## Tech Stack

- Java 17+, Spring Boot 3.x
- Spring Web, Spring Data JPA, Spring Security, Spring Validation
- PostgreSQL
- JWT for auth (no OAuth/social login)
- Maven (or Gradle — match whatever's already in the repo, don't switch build tools)
- Flyway for migrations if present; otherwise JPA `ddl-auto` is acceptable for this project's timeline

## Domain Model (source of truth)

- **User**: email, password (hashed), role. A user can create campaigns AND back campaigns — role is not mutually exclusive between backer/creator. Roles: `USER` (default, can create + back), `ADMIN`.
- **Campaign**: title, description, goal amount, image URL, status (`ACTIVE`/`CLOSED`), `total_collected`, `total_withdrawn`, creator (FK to User).
- **Donation**: campaign (FK), backer (FK to User), amount, platform fee % snapshot at time of donation, timestamp. Fee is snapshotted per-donation so historical stats stay accurate if the platform fee later changes.
- **PlatformSettings**: single-row (or key-value) table holding the configurable platform fee percentage. Admin-editable.

Do not add escrow, refund, deadline-triggered payout, or partial-withdrawal-approval logic — explicitly out of scope for this build.

## API Conventions

- REST endpoints under `/api/...`, JSON in/out.
- Auth via `Authorization: Bearer <jwt>` header.
- Role checks: `@PreAuthorize` at the controller/service method level, not scattered in business logic.
- Standard error shape: `{ "error": "message" }` with appropriate HTTP status (400/401/403/404/409/500). Keep this consistent across all endpoints.
- Validate request DTOs with `@Valid` + Bean Validation annotations — don't hand-roll validation in controllers.

## Money Handling

- Use `BigDecimal` for all monetary fields. Never `float`/`double`.
- Platform fee math: compute and store fee amount at donation time, don't recompute later from current settings.
- `total_collected` and `total_withdrawn` are simple running totals updated transactionally on donation/withdrawal — no ledger/event-sourcing needed for this project.

## What NOT to build

- No real payment integration (Stripe, PayPal, etc.) — the "Fund Campaign" endpoint just creates a `Donation` record and updates totals. Treat it as always-succeeds.
- No OAuth/social login.
- No microservices, no message queues, no separate services — one Spring Boot app.
- No all-or-nothing funding logic, no refunds, no escrow.
- No complex analytics engine — aggregate SQL queries (`SUM`, `COUNT`, `GROUP BY`) are sufficient. Don't reach for a reporting library.

## Testing Expectations

- Given the timeline, prioritize a handful of meaningful tests over full coverage: auth flow, donation math (including fee calculation), and role-based access on protected endpoints.
- Manual/Postman testing is acceptable for lower-risk CRUD endpoints (campaign browse/view).

## Working Style for Claude

- When implementing a feature, check this file and the sprint plan before introducing new libraries or architectural patterns — if it's not already in the stack, don't add it without asking.
- Prefer editing/extending existing entities and endpoints over introducing parallel structures.
- If a request implies scope beyond what's listed in "Domain Model" or would require escrow/refund/OAuth/microservices, flag it rather than silently implementing it — this project has a hard 7-day deadline.
- Keep controllers thin; put business logic (fee calc, total updates) in service classes.
- When generating migrations or entity changes, keep them additive where possible so seed data / prior work doesn't break mid-sprint.