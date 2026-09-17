# VizCo style guide

Enterprise InsureTech UI. Light mode only. Minimal chrome. **Data speaks first.**

## Principles

1. **Quiet by default** — No decorative gradients, glow, emoji, or marketing clutter in product surfaces.
2. **One job per view** — Clear title, short supporting line, then the data or primary action.
3. **No fake cards** — Borders/backgrounds only when they clarify structure or afford interaction.
4. **Light mode** — Product UI is always light. Do not ship dark product themes.
5. **Density with air** — Comfortable spacing; prefer tables and lists over stacked widgets.

## Brand

- **Name:** VizCo
- **Wordmark:** “VizCo” in primary sans, weight 600. No tagline in the app chrome.
- **Product frames:** Vendor portal and Underwriter portal — same system, distinct nav labels.

## Color

CSS variables (see `web/src/app/globals.css`):

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#F6F7F9` | Page background |
| `--surface` | `#FFFFFF` | Panels, forms |
| `--ink` | `#0B1220` | Primary text |
| `--muted` | `#5B6575` | Secondary text |
| `--border` | `#E3E6EC` | Dividers, inputs |
| `--accent` | `#0F5E52` | Primary actions, focus |
| `--accent-hover` | `#0C4C43` | Hover for accent |
| `--danger` | `#B42318` | Errors, destructive |
| `--success` | `#067647` | Positive status |

Do **not** use purple/indigo gradient themes, warm cream + terracotta, or neon accents.

## Typography

- **Sans:** IBM Plex Sans — UI, body, headings
- **Mono:** IBM Plex Mono — IDs, counts, technical values
- Scale: 12 / 14 / 16 / 20 / 28 / 36 — prefer 14–16 for product body
- Headings: semibold (600), tight tracking; body: regular (400)

## Layout

- Max content width for forms: ~480px
- Portal content: fluid with `max-width: 1120px`, horizontal padding 24px
- Top bar: 56px, hairline bottom border, logo left, org + user right
- Side nav (portals): 220px, quiet labels, active state = ink weight + left accent bar

## Components

- **Buttons:** Rectangular, 8px radius max. Primary = accent fill. Secondary = border only.
- **Inputs:** 40px height, 1px border, focus ring in accent at 2px outline offset 0.
- **Tables:** Header muted 12px uppercase tracking; rows separated by hairlines; no zebra unless needed for scan.
- **Status:** Text + optional dot. Avoid pill badges unless status is the interaction.

## Motion

Use sparingly (2–3 product motions max):

1. Page enter: 120ms fade
2. Focus ring: instant
3. Toast/slide for confirmations only

No continuous animation in chrome.

## Do / don’t

| Do | Don’t |
| --- | --- |
| Let empty states explain the next step in one sentence | Fill empty states with illustrations and promo blocks |
| Use real role copy (“Underwriter”, “Vendor”) | Use playful or startup-speak labels |
| Keep login and portals visually related | Build a flashy marketing landing inside the app |
| Prefer black/ink links in dense data | Color every link accent teal |
