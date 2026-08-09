# DESIGN.md — Visual Direction

Reference for the frontend's look and feel. Keep this in sync with `CLAUDE.md` — this file is the "what it should look like," `CLAUDE.md` is the "how it's built."

## Direction

Warm, community-driven, approachable — closer to a neighborhood fundraiser than a fintech dashboard. Inspired by GoFundMe's *layout warmth* (soft rounded cards, generous whitespace, friendly non-corporate tone) — not their brand color, which is green. This app's identity color is amber/orange.

## Color Palette

Primary: **Amber** — used for the main CTA ("Fund this campaign"), progress bars, active states, key numbers.

| Stop | Hex | Use |
|------|-----|-----|
| 50 | `#FAEEDA` | Light background fills, badge backgrounds |
| 100 | `#FAC775` | Light accents |
| 200 | `#EF9F27` | Primary buttons, progress bar fill, links |
| 400 | `#BA7517` | Text on light amber backgrounds, secondary emphasis |
| 600 | `#854F0B` | Strong borders, hover states |
| 800 | `#633806` | Text on light amber fills (headings on badges) |
| 900 | `#412402` | Darkest — high-contrast text on amber-50 |

Secondary/semantic ramps (used sparingly, only for their semantic meaning — not decoration):
- **Green** — funded / goal reached / success states only (e.g. "Goal met!" badge, successful donation confirmation)
- **Red** — errors, validation failures, rejected actions (e.g. withdrawal exceeding balance)
- **Warm gray/cream** — neutral backgrounds, borders, secondary text. Avoid cool blue-grays; keep everything in the warm end of the spectrum for consistency with amber.

**Rule of thumb:** amber = brand and primary action. Green = "this worked / goal reached." Red = "this failed / can't do that." Don't reach for green or red decoratively — they carry meaning, so keep them rare and purposeful.

## Light / Dark Mode

Both required (toggle in nav). Use CSS variables, never hardcoded hex, so both modes stay in sync automatically:
- Light mode: 50-fill backgrounds, 600-800 stops for text/emphasis
- Dark mode: 800-fill backgrounds, 100-200 stops for text/emphasis
- Test every page in both modes before considering it "done" — a page that only looks right in light mode isn't finished.

## Typography

- Sans-serif throughout (this is a UI, not an editorial surface)
- Sentence case everywhere — buttons, headings, labels. Never Title Case, never ALL CAPS.
- Two weights only: regular (400) for body, medium (500) for headings/emphasis. Avoid bold (700) — it reads heavy against a warm, friendly palette.
- Heading sizes: keep a simple scale (e.g. 22px page titles, 18px section headings, 16px card titles, 14-15px body).

## Components & Patterns

- **Cards** (campaign cards, dashboard stat cards): white/surface background, 0.5px border, 12px corner radius, generous internal padding (1rem+). No drop shadows — flat and clean.
- **Progress bars**: amber fill on a light neutral track, rounded/pill-shaped, thin (4-6px).
- **Buttons**: primary action (Fund, Create, Login) uses amber fill with dark amber (800/900) text for contrast. Secondary actions use outline/ghost style — don't let every button compete for attention; one amber CTA per view.
- **Badges/pills** (e.g. "5% platform fee", "Goal met!"): light-stop background (50) + dark-stop text (800/900) from the matching ramp. Never plain black text on a colored background.
- **Icons**: simple outline-style icons (heart for fund/donate, trending-up for progress, users for backers) — used sparingly as visual anchors, not decoration.

## Copy Tone

Match the warm, community feel in the words too, not just the colors:
- "Your campaigns" not "My campaigns" — UI speaks to the user
- Verb-first buttons: "Fund this campaign", "Create campaign", "Withdraw funds" — not "Submit" or "OK"
- No exclamation points on routine confirmations ("Campaign created" not "Campaign created!"); save warmth for the visual design, keep copy calm and clear
- Empty states are inviting, not apologetic: "Start your first campaign" rather than "No campaigns found"

## What to Avoid

- Cool blues/grays as primary — breaks the warm/earthy direction
- Gradients, drop shadows, glow effects — keep it flat
- More than one saturated accent color competing per screen
- Corporate/fintech visual language (heavy borders, dense tables, cold neutrals) — this should feel like a community project, not a bank