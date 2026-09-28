---
version: "alpha"
name: "Vey"
description: "A calm, light-first product interface for meeting artifacts, decisions, and work context."
colors:
  canvas: "#F8F7F3"
  surface: "#FFFFFF"
  surface-subtle: "#F0F0EA"
  surface-raised: "#FDFCF9"
  text: "#1D211C"
  text-muted: "#5E645C"
  text-disabled: "#888D85"
  border: "#D9DAD2"
  border-strong: "#BFC3B9"
  primary: "#49614D"
  primary-hover: "#3D5241"
  on-primary: "#FFFFFF"
  primary-subtle: "#E7EDE5"
  on-primary-subtle: "#26392A"
  success: "#2F6E4F"
  warning: "#94631D"
  danger: "#B43A32"
  info: "#315F8A"
  focus-ring: "#49614D"
  backdrop: "rgba(29, 33, 28, 0.16)"
  auth-background: "#F7F7F5"
  auth-visual-background: "#EDEAE4"
typography:
  display:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  heading-1:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  heading-2:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  heading-3:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.35
  caption:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  metadata:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 12px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 12px"
  button-destructive:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-small}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 10px"
  sidebar-item-active:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.on-primary-subtle}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 10px"
---

## Overview

Vey is a meeting and work-intelligence product, not an analytics dashboard or an AI spectacle. Its visual grammar is light-first, warm, calm, focused, and professionally restrained. The interface makes a meeting artifact feel like a readable document with traceable context: spacious while someone is reading a transcript, note, decision, or evidence; compact when scanning metadata, lists, or controls.

Use hierarchy, typography, quiet surfaces, and predictable interaction states to convey intelligence. Do not use decoration to imply intelligence. A single muted sage accent indicates meaningful action and focus; content remains the visual center.

## Colors

`canvas` is the warm off-white application background. `surface` is the clean document and control surface; `surface-subtle` groups quiet navigation or secondary content without creating a tile-heavy dashboard. `surface-raised` is reserved for menus and dialogs.

`text` is charcoal rather than pure black. `text-muted` supports metadata and helper copy but must remain readable at normal sizes. `border` is the standard warm-gray hairline; `border-strong` is for clearer separation or an invalid neutral control state.

`primary` (`#49614D`) is Vey's restrained sage action color. It is intentionally not a bright fintech green. Use it for primary actions, visible focus, and current/selected navigation—not for large decorative fills. `primary-subtle` supports selected states and should be paired with `on-primary-subtle`.

Semantic colors have stable meaning: `success` means completed/healthy, `warning` means needs attention, `danger` means destructive/error, and `info` means informational/system context. Pair every semantic color with text, iconography, or a status label; color alone never communicates state. Do not introduce competing semantic accent palettes.

## Typography

Albert Sans is the single UI typeface. It is bundled locally with its SIL Open Font License in `src/assets/fonts/albert-sans/OFL.txt`; use the supplied variable font through `next/font/local`. The system sans stack is the fallback. Technical identifiers may use the `code` stack only where it improves clarity.

Use `display` only for a small number of page-level titles, never a marketing hero inside the product. `heading-1` through `heading-3` give documents a clear outline without excessive weight changes. `body` is optimized for note and transcript reading; use 1.6 line height. `body-small`, `label`, `caption`, and `metadata` serve compact controls and supporting information. Avoid all-caps UI labels, exaggerated tracking, and weights above 600 unless a genuine emphasis needs it.

## Layout

The desktop application shell is a quiet sidebar beside the main content area. The sidebar is 232px wide, visually dimmer than the main surface, and contains compact 36px navigation rows with 16px icons. There is no oversized brand block. The main area has a consistent page header, a hairline divider only when it clarifies structure, then content.

Use the spacing scale as an 8px-derived rhythm: 4, 8, 12, 16, 20, 24, 32, 40, and 48px. Standard main gutters are 24px at tablet, 32px at desktop, and 16px at small phone widths. Document-like content has a reading measure of 680px (roughly 60–75 characters per line); list, calendar, and detail work may use up to 1280px. Avoid making ordinary text fill a broad desktop canvas.

At widths below 768px, collapse the desktop sidebar into an accessible menu or sheet and retain a 16px page gutter. Keep page actions reachable without horizontal scrolling; compact controls may wrap only when their labels remain understandable. Desktop data density must not become cramped mobile density.

## Elevation & Depth

Vey uses separation before elevation. Standard sections and list rows use `border`; cards only use a surface and a hairline by default. Do not give every section a shadow.

Use no shadow for ordinary content. Use `0 1px 2px rgba(29, 33, 28, 0.05)` for a deliberately raised small surface. Use `0 12px 32px rgba(29, 33, 28, 0.12)` only for a dialog, popover, or command palette above a backdrop. Backdrops use `backdrop` without blur or glass effects.

## Shapes

The radius scale is small and deliberate: 6px for dense inner controls, 8px for buttons, inputs, sidebar items, and list selection, 10px for grouped product surfaces, and 12px for dialogs. Buttons and inputs are rounded rectangles, not pills, unless a chip represents a compact categorical status. Borders are 1px solid `border`; use a 2px visible focus ring in `focus-ring` with an offset where it will not be obscured.

## Components

### Button

Use four action variants: primary (the one clear next action), secondary (bounded neutral action), ghost (low-emphasis contextual action), and destructive (irreversible or error-adjacent action). Use concise, exact labels that state the outcome. Default height is 36px; dense controls may be 32px and touch-first controls should provide at least a 44px target. Do not turn every action into a pill or use vague labels such as “Continue” when the action can be named.

### Input

Inputs are 36px high with a calm `border`, `surface` fill, 8px radius, visible label, and 10px horizontal inset. On focus, use the 2px `focus-ring`; on error, show a `danger` border plus a nearby text explanation. Placeholder text is a hint, never the only label.

### Sidebar item

A sidebar item pairs a 16px line icon with a label in a 36px row. Default and hover states are low contrast but readable; the active state uses `primary-subtle` and `on-primary-subtle`, not a large saturated block. Every item supports keyboard focus with the standard focus ring. Preserve a clear text label when the sidebar is expanded.

### Page header

Every application page has a consistent header: title, optional concise description, and contextual actions aligned without competing with the title. Use `heading-1` or `display`, 16–24px spacing to the body, and avoid a standalone dashboard metric strip unless it directly answers the page's task.

### List row

The reusable list-row primitive serves meetings, decisions, action items, and integrations. It has a clear title, a single readable metadata line, an optional semantic status, and an optional trailing action that remains keyboard reachable. Rows use a 1px divider or grouping surface, then a muted hover/selection state. Never hide the row's only action on hover; focus must reveal the same affordance.

### Meeting card / row

Future meeting surfaces should emphasize time then title, followed by participants, source, and processing/status. Use a row for dense libraries and a bounded document-like card only when preview or context needs additional room. An event join affordance is explicit, compact, and available without opening a separate dashboard.

### Transcript block

Transcript text uses `body`, 1.6 line height, and the 680px reading measure. A speaker label and timestamp form quiet, scan-friendly metadata; the spoken text retains primary visual weight. Hover may expose segment actions without shifting text. Selection and search use a pale `primary-subtle` highlight plus non-color context such as the active result count or selected state.

### Decision block

A decision presents the decision text first, then lifecycle status, rationale/context, provenance, and owner/time where available. Its provenance must remain a legible link to evidence rather than an opaque confidence score. Status is text plus an icon where needed, never a colored dot alone.

### Action item

An action item prioritizes its title, then assignee, due date, and status. Due and status information is compact and scannable; missing owner or due date is stated clearly rather than disguised with a neutral placeholder. Do not make action items resemble generic task-dashboard statistics.

### Empty state

Empty states are contextual, quiet, and action-oriented: a short explanation and one relevant next action when one exists. Use whitespace, not giant illustrations, colored panels, or AI sparkle imagery. Do not fabricate meeting data to avoid an empty state.

### Dialog, popover, and command palette

Overlays have a clear title or accessible label, a predictable close action, focus management, and the elevated surface defined above. Menus and popovers are compact, anchored to their trigger, and preserve spatial context. Command surfaces favor keyboard discovery and concise, scannable rows; they do not use decorative animation.

## Do's and Don'ts

Do make meeting content feel like an authored document with useful work context. Do use one primary action, a clear hierarchy, hairline separation, stable component sizing, semantic status text, and visible focus. Do favor whitespace for reading and compact rhythm for lists. Do retain provenance as a first-class visible detail.

Do not make Vey dark-first. Do not use purple AI gradients, cyan/purple neon, giant hero gradients in the application, glassmorphism, glow effects, floating blobs, generic AI sparkle icons, random illustrations, or ambient/moving gradients. Do not use excessive shadows, excessive rounded pills, oversized dashboard statistics, rainbow semantic colors, five or more competing accents, or a card around every section. Do not cram transcript text or let marketing landing-page grammar leak into the product.

Do not visually clone Granola, Linear, or Notion Calendar. Vey must remain recognizably its own product; their public interaction concepts inform this contract, not its assets, colors, typography, logos, copy, or layouts.

## Product Surfaces

There are three primary application surface modes: document (notes, transcripts, decisions, and evidence; reading-first and constrained), workflow (meeting lists, actions, and integrations; compact and scannable), and time (future calendar/upcoming meeting views; date/time first with accessible join and timezone context). Move between modes with a stable shell and shared component sizing, not a different visual identity.

Time surfaces should group events by day/week, make start time and duration immediately scannable, expose participant metadata without overwhelming titles, show event selection clearly, and state timezone when it matters. Calendar navigation and command shortcuts are future interaction grammar only; VEY-14 does not implement a calendar.

### Authentication Surface (AUTH != PRODUCT SHELL)

Authentication is a dedicated entry gateway governed by a distinct visual contrast: `AUTH != PRODUCT SHELL`.

- **Canvas & Contrast**: While the product application uses a warm off-white canvas (`canvas`: `#F8F7F3`) calibrated for long-form, low-glare reading of notes and transcripts, authentication uses a brighter, neutral near-white canvas (`auth-background`: `#F7F7F5`). The form side feels gallery-white with low chroma and minimal beige undertones. This architectural clarity ensures visual energy is carried predominantly by the right-side artwork rather than synthetic UI ornaments.
- **Split Composition**: On desktop viewports (≥ 1024px), auth uses a full-height split ratio: left form side (~46–48%) and right visual panel (~52–54%). Mobile viewports collapse cleanly into a single-column form container without displaying the heavy artwork panel.
- **Form Surface**: Clean, uncarded layout. Avoid floating cards or heavy container shadows around the form; the bright page canvas is the surface. Primary actions retain Vey's restrained sage (`#49614D`), while social identity buttons use neutral surface styling.
- **Order of Authentications**: Strict user hierarchy places social identity providers first (Google, GitHub, Facebook), followed by an accessible text divider (`"or continue with email"` / `"or sign in with email"`), credential inputs, and the primary CTA.
- **Editorial Artwork**: The right panel features a single, dominant expressive oil painting asset (`/images/auth-artwork.webp`, 2:3 vertical portrait aspect ratio) cropped with `object-cover` inside a framed `rounded-2xl` container. Do not overlay fake meeting documents, checklist cards, analytics dashboards, or quotes onto the painting. The artwork carries the visual narrative independently without beige or sage duotone washes.

## Motion

Motion at Vey preserves continuity and clarity; it is never decorative by default. All animations follow interaction principles guided by `transitions-dev` and strictly respect `prefers-reduced-motion: reduce`.

### Motion Principles

- **Continuity over spectacle**: Transitions communicate spatial context and state changes. Avoid dramatic marketing entrances, bounces, and elastic springs.
- **Tokenized timing**: Use tokenized duration and easing primitives:
  - Micro-interactions (`120–160ms`, `--duration-quick` to `--duration-fast`): button hover/active states, input border and ring transitions, text link states.
  - State transitions (`160–220ms`, `--duration-fast`, `--ease-smooth-out`): auth step changes (e.g., credentials to email verification code). Outgoing step fades up/out (`opacity: 1 -> 0, translateY: 0 -> -4px`) while incoming step emerges smoothly (`opacity: 0 -> 1, translateY: 6px -> 0`).
  - Page & artwork entrance (`180–400ms`): form container smoothly enters with `--ease-smooth-out` (`opacity: 0 -> 1, translateY: 8px -> 0`), while the artwork panel enters over `350–400ms` (`opacity: 0 -> 1, scale: 1.01 -> 1`).
- **Stable pending states**: Submit buttons maintain fixed dimensions (`h-11 sm:h-9`) during submission to prevent layout shift. The resting label smoothly cross-fades with the spinner and pending status copy while user input is disabled.
- **Calm error and status feedback**: Error banners and status confirmations enter subtly with `t-alert-enter` (~150ms fade + slight vertical shift) adjacent to the input context. The whole form must never shake.
- **Property-specific transitions**: Always enumerate animated properties (`transition: border-color, box-shadow`, etc.); never apply `transition: all`.
- **Mandatory reduced-motion guard**: When `prefers-reduced-motion: reduce` is detected, animations and positional transforms are bypassed (`animation: none !important; transform: none !important; opacity: 1 !important`), ensuring instant, accessible state progression.

## Accessibility

Target WCAG 2.2 AA. Body and control text must meet 4.5:1 contrast; meaningful icons, input boundaries, and focus indicators must meet their appropriate non-text contrast requirements. Provide a visible keyboard focus state for every interactive element, keep focus unobscured by sticky or overlay UI, and use native semantic controls wherever possible.

Interactive targets are at least 36px visually and at least 44px in touch contexts through padding or hit area. Labels, errors, statuses, and selection communicate in text and/or icons in addition to color. Auth and form flows allow paste and password managers. Transcript lines remain within the reading measure; do not depend on tiny text to achieve density.

## Responsive Behavior

Design mobile-first adaptations, not a shrunken desktop. At 375px, retain readable `body` size, 16px gutters, tap targets, and a single clear action. At 768px, reveal more contextual actions and use 24px gutters. From 1024px, use the sidebar shell, 32px gutters, document reading widths, and wider workflow layouts. Test long titles, multiple participants, error copy, and user-control menus at each breakpoint.

## Reference Provenance

This contract synthesizes public, visible product references and does not copy their code or visual assets.

- Granola (primary product feel): its public documentation shows calendar-driven “Coming up,” meeting notes, and a sidebar organized around personal/team note spaces. Vey takes the calm, meeting-centric, note-as-artifact idea and reinterprets it with Vey's provenance-first product principles. The Granola portion was synthesized from visible official product documentation; no ready-made Granola DESIGN.md was used.
- Linear (structure and interaction discipline): the March 2026 official UI refresh describes more consistent headers, navigation, and view controls, resized icons, and a dimmer sidebar to prioritize main content. Vey applies that hierarchy and predictable compact controls on a warm light canvas, not Linear's branding or dark surface treatment. The VoltAgent Linear DESIGN.md listing was treated only as a secondary discovery reference.
- Notion Calendar (time/event grammar): public product material emphasizes at-a-glance schedules, direct meeting joins, time-zone work, command/shortcut workflows, and work context alongside events. Vey uses these as future time-surface rules only; it does not implement or imitate a calendar here. The VoltAgent Notion reference was treated as secondary only.
- Original Vey decisions: warm neutral/sage token palette, Albert Sans typography, provenance-visible decision grammar, document/workflow/time surface model, accessibility rules, and explicit anti-patterns are Vey-specific decisions aligned with Vey's product principles.

Source material: [Google DESIGN.md format](https://github.com/google-labs-code/design.md), [VoltAgent awesome-design-md](https://github.com/VoltAgent/awesome-design-md), [Granola 101](https://docs.granola.ai/help-center/getting-started/granola-101), [Linear UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh), and [Notion Calendar](https://www.notion.com/product/calendar).
