# App Shell V2 — AI Instructions

## Stack (overrides global rules)

This is a **Vue 3 + Vite 8 + Tailwind CSS v4** project. Global rules about `.jsx` files, React, or `lucide-react` do NOT apply here.

- Files are `.vue` (SFCs) — `<script setup>`, `<template>`, `<style>`
- No TypeScript — plain `<script setup>` without `lang="ts"`
- No React, no JSX

---

## Icons — `@gohighlevel/ghl-icons`

Always import from `@gohighlevel/ghl-icons/24/outline`. Never use lucide or any other icon library.

```js
import { PlusIcon, Settings01Icon, ArrowLeftIcon } from '@gohighlevel/ghl-icons/24/outline'
```

Size icons with Tailwind classes — NOT a `:size` prop:

| Use case | Class |
|---|---|
| Nav / sidebar | `class="w-5 h-5"` |
| Buttons, toolbar | `class="w-4 h-4"` |
| Dense / inline | `class="w-3.5 h-3.5"` |
| Inside HLButton slot | no class — HLButton sizes it |

Browse available icons at `node_modules/@gohighlevel/ghl-icons/24/outline/`.

---

## HL Components — `@platform-ui/highrise`

Highrise is registered globally in `main.js`. Use HL components in any template **without importing them**. Never use raw HTML where an HL component exists.

| Avoid | Use instead |
|---|---|
| `<button>` | `<HLButton variant="primary\|secondary\|tertiary\|ghost\|text">` |
| `<input>` | `<HLInput>` |
| `<select>` | `<HLSelect>` |
| badge `<span>` | `<HLBadge>` |
| tooltip wrapper | `<HLTooltip>` |
| modal/overlay | `<HLModal>` |
| tabs row | `<HLTabs>` / `<HLTab>` / `<HLTabPane>` |
| toggle/switch | `<HLToggle>` |
| tag/chip | `<HLTag>` |
| avatar | `<HLAvatar>` |

**HLButton sizes:** `xs` = 32px, `sm` = 36px, `md` = 40px, `lg` = 44px

**HLButton with icon:**
```html
<HLButton variant="primary" size="xs">
  <template #iconLeft><PlusIcon /></template>
  New post
</HLButton>
```

Icon-only button (no default slot text = icon-only mode):
```html
<HLButton variant="secondary" size="xs">
  <template #iconLeft><Settings01Icon /></template>
</HLButton>
```

---

## Design Tokens

Colors come from `src/index.css @theme`. Always use Tailwind token classes — never hex values.
Every `--color-*` token is a reference to HighRise's own variable (`--color-primary-600: var(--primary-600)`),
never a copied hex, so the app follows HighRise if a value changes. Add new tokens the same way.

**Primary (blue):** `primary-50` through `primary-900`. Key values:
- `primary-600` = #155EEF — main brand blue (buttons, active states)
- `primary-500` = #2970FF — lighter blue
- `primary-50` = #EFF4FF — light blue backgrounds

**Gray:** `gray-50` through `gray-900` (Untitled UI scale)

**Semantic — two steps each, both from HighRise.** These do two jobs and one value cannot
serve both, so there is a mark colour and a text colour:
- `bg-positive` / `bg-negative` / `bg-warning` — the 500 steps. Dots, bars, status fills.
- `text-positive-strong` / `text-negative-strong` / `text-warning-strong` — the 700 steps.
  Deltas, labels, anything read. **Only the 700s clear 4.5:1 on white**, which is why text
  never uses the base token.
- `bg-positive-light` / `-negative-light` / `-warning-light` — the 50 steps.

Every value above is a step off HighRise's own `success` / `error` / `warning` scales. Before
this they were Tailwind's stock green-600, red-600 and amber-600, which HighRise does not
define, and two of the three failed contrast as text.

**Other tokens:** `accent-purple`, `accent-pink`, `accent-green`, `accent-indigo`. All are HighRise steps.
`hl-yellow` and `hl-teal` were removed (1 Oct 2026): not HighRise colours, HighLevel brand marks, unused.

**Typography (locked, 1 Oct 2026): all text renders through `<HLText>`.** Never put size or weight classes
on text, and never write `text-[13px]` or any raw pixel size. HLText sets size, line height and weight;
colour stays a Tailwind class.
- `<HLText size="sm|md|lg|2xl" weight="regular|medium|semibold" html-tag="p|span|h2|…">`. `html-tag`
  defaults to `p`; keep the element the text had. Figures use `type="display" size="xs"` (24px) or
  `type="display" size="sm"` (30px).
- HLText's stylesheet resets margin and line height and beats Tailwind utilities, so margins on an
  HLText need the important suffix (`mt-1!`, `mx-auto!`). Don't add `leading-*`: HighRise's line heights apply.
- Never make a `<button>`, `<a>` or HL component into HLText; put an `<HLText html-tag="span">` inside it.
  Text inside `HLButton` is HLButton's.
- In render functions: `const HLText = resolveComponent('HLText')`, then `h(HLText, { htmlTag: 'span', size: 'md' }, () => text)`.
- The only `text-hr-*` classes left are on SVG `<text>`, where HLText cannot render.
- Font: `--font-sans` maps to `var(--hr-font-family-base)` and `index.html` loads rsms Inter, which registers
  "Inter var", the family HighRise asks for. HLContentWrap adds `font-sans` to its root, so without that mapping
  every screen fell back to the system font.
- The scale below is what each HLText size is for; the `text-hr-*` names are the old class names.
- `text-hr-display-sm font-semibold tabular-nums` — 30px, the one headline figure in a card (2,402 · 41,000)
- `text-hr-display-xs font-semibold` — 24px, stat-tile figures and page/landing heroes
- `text-hr-2xl font-semibold` — 16px, page, card and modal titles
- `text-hr-lg font-medium` — 14px, labels, buttons, nav, table cells, list items; sub-card titles semibold
- `text-hr-md` — 13px, body, helper text, descriptions, metadata
- `text-hr-sm font-medium` — 12px, badges, chart axis labels, legends, fine print
- Eyebrows / section labels: `text-hr-sm font-medium text-gray-500`, **sentence case**. No `uppercase`.
- Weights: `font-normal`, `font-medium`, `font-semibold` — mapped in `@theme` to HighRise's
  `--hr-font-weight-regular|medium|semibold`. No `font-bold`.
- In SVG text use the same classes (`class="text-hr-sm"`), not `font-size` attributes.

**Greys — one per role.** Three were in use for the same job, which is how a screen ends up
feeling unresolved without anything being obviously wrong:
- `text-gray-900` — headings and figures
- `text-gray-600` — supporting prose and card subtext
- `text-gray-500` — metadata, captions, benchmark lines
- `text-gray-400` — de-emphasised only: chart axis labels, separators (`·`). Never gray-300/700/800 for text.

**Radius:** `rounded-xl` (12px) for cards and tiles, `rounded-lg` (8px) for controls, chips and
panels nested inside a card, `rounded-full` for pills, dots and avatars. Nothing else (`rounded`,
`rounded-md`, `rounded-sm`, `rounded-2xl`, arbitrary). HLButton keeps HighRise's own 4px — it sets that
inline per instance, so overriding it needs `!important` on every button, which is not worth
a 4px difference against a component that is internally consistent.

**Shadows:** HighRise's own variables only — `shadow-(--shadow-xs|sm|md|lg)`. No arbitrary
`shadow-[…]` and no stock `shadow-lg`.

**Deltas:** one pattern everywhere — `ArrowUpIcon`/`ArrowDownIcon` at `w-3.5 h-3.5` plus the absolute
value, coloured `text-positive-strong` / `text-negative-strong`. No ▲ ↑ ↓ glyphs, no hard-coded `+`.

---

## HighRise setup

- The app is wrapped in `<HLContentWrap>` in `App.vue`. It sets naive's class prefix to `hr` and the
  version namespace (`hr-v-4-8-5`), which is what HighRise's stylesheet is scoped to. Never remove it,
  and never nest a second one.
- Rendered classes are `hr-*`, never `n-*`. HighRise rules are `.hr-v-4-8-5 .hr-x[data-v]`, so an
  override needs `.hr-v-4-8-5` in front to win. Shared helpers live in `src/index.css`
  (`.sl-dashed`, `.sl-danger-option`, `.sl-cards`, `.sl-full`) — use them rather than re-inventing.
- Sizes are HighRise's: `lg | md | sm | xs | 2xs | 3xs`. `small` / `large` / `medium` are invalid and
  silently fall back to the default.
- Toasts: call `toast(title, body, tone, actions)` from the composable; it renders a HighRise
  notification. Never hand-build a toast.
- Several HL components don't forward `class` (`HLRadioGroup`, `HLDropdown`); put the class on a wrapper.

## Whitelabel

Sub-accounts and their clients see this UI under their agency's brand. Never show "HighLevel", its
logo colours, its mascot, its support numbers or its domains in UI copy or data. Use neutral copy and
placeholders like `alerts@youragency.com`.

---

## Shell Architecture

All pages use `<AppShell>` from `src/shell/AppShell.vue`. Never rebuild shell chrome from scratch.

```html
<AppShell
  sidebar="main-nav | settings"
  :sidebar-props="{ ... }"
  topbar="simple | tabbed"
  :topbar-props="{ ... }"
>
  <Canvas :level="1 | 2">
    <!-- page content here -->
  </Canvas>
</AppShell>
```

**Sidebar modes:**
- `main-nav` — left navigation with icon + label items
- `settings` — settings sidebar with sections and back button

**Topbar modes:**
- `simple` — title + optional icon
- `tabbed` — section tabs + sub-tabs (like Marketing → Social planner → Statistics)

**Canvas levels:**
- `level="1"` — standard page content
- `level="2"` — detail/drill-down panel with back button

**Reference existing pages** in `src/pages/` before building anything new — they show the correct prop shapes and patterns.

---

## Where New Work Goes

All new pages go in `src/pages/`. Register each new page as a route in `src/router.js`.

The shell components in `src/shell/` are infrastructure — edit them only when adding a new shell capability, not for page-specific needs.

---

## What Never to Do

- Never install or import from `lucide-vue-next`, `lucide-react`, or any other icon library
- Never use raw `<button>` where HLButton fits
- Never use hex color values — use token classes
- Never use `text-[15px]`
- Never add `:size` prop to ghl-icons — use Tailwind `class` instead
- Never import HLButton or other HL components manually — they're globally registered
