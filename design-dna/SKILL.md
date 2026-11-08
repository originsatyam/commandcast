---
name: design-dna
description: Use when designing or building UI that should feel like Contra (monochrome editorial catalogue) or VoiceOS (liquid-glass native app), or when the user asks to "make it feel like" either reference, harvest their tokens, or audit a screen against a known visual language. Ships measured tokens, a swappable stylesheet, and free stand-ins for the paid typefaces.
---

# Design DNA

Two design systems, measured from live sites on **2026-10-29**, reduced to one semantic contract. This skill exists so a visual direction becomes testable constraints instead of adjectives.

## Route first

| The brief | Take | Because |
|---|---|---|
| Marketplace, portfolio, directory, editorial commerce | **Contra** | The chrome can disappear so inventory can carry the colour. |
| Consumer AI, desktop software, dev tool with an OS feel | **VoiceOS** | The material does the persuading before the feature list does. |
| Trust-heavy product (verified listings, dates, sources) | **Contra's language** | It names standards ("Verified studios") instead of claiming trust. |
| A landing page that must feel installed, not visited | **VoiceOS's material** | Glass, props, and native type imply the product already exists. |
| Editorial brand with a print soul | **Contra's tracking** | Loosening text sizes is what makes a grotesque read as print. |

Do not blend them. Glass needs air; Contra's grid needs density. Pick the world before the components.

## The contract

One attribute switches the system. Everything else is a token.

```html
<link rel="stylesheet" href="design-dna.css">
<body data-dna="contra"> ... </body>
<body data-dna="voiceos"> ... </body>
```

Primitives (the only classes you need):

| Class | Role |
|---|---|
| `.dna-display` | Hero headline |
| `.dna-title` | Section heading |
| `.dna-h3` | Card heading |
| `.dna-lede` | Lead paragraph |
| `.dna-body` | Body copy (`.dna-body--ink` for primary) |
| `.dna-eyebrow` | Uppercase label |
| `.dna-btn` / `.dna-btn--ghost` | Actions |
| `.dna-card` | Outer surface (glass shell in VoiceOS) |
| `.dna-panel` | Inner content surface |
| `.dna-chip` | Tag / status |
| `.dna-surface` / `.dna-rule` | Tint block, hairline |

Layout tokens: `--dna-container`, `--dna-gutter`, `--dna-section`, `--dna-measure`, `--dna-grid-gap`.

## Build procedure

1. **Choose the system and say why** in one sentence. If neither fits, say so instead of forcing one.
2. **Load only the free faces.** Inter Tight + DM Mono from Google Fonts; VoiceOS uses the system stack. Never self-host GT Standard, Recoleta, or SF Pro.
3. **Start from the primitives**, not from scratch. If a component is missing, add it from the deck's measured recipe, then express it in tokens.
4. **Set the rhythm before the decoration.** Container → section padding → measure → grid gap. Most "it feels off" problems are here, not in the shadow.
5. **Use the accent as a surface or a signal.** Contra's lime is never a foreground; VoiceOS's blue is never body text.
6. **Audit before showing anyone.** Run the checklist below and report the numbers.

## Component recipes

**Contra action** — 48px tall, 24px radius, `0 24px` padding, 16/600, fill `#222834`, no shadow. Hover: 1px lift, 170ms.

**Contra card** — 16px radius, 1px `#E5E7EB` border, no shadow, 12px shell padding. The grid gap is **2px**, not 16px; that is the identity.

**Contra label** — 12px, +0.1em, uppercase, `#677084`. Display tracking is negative (−0.01em). Do not flatten the two.

**VoiceOS card** — 24px radius, 12px padding, translucent white + `blur(14px) saturate(1.6)`, inset light from **below**, 24px ambient drop, blue-tinted 6px rim. Put it on sky, not on flat white.

**VoiceOS action** — 38px pill for nav, 68px glass pill for hero, 16/500–18/500. The glass variant uses `inset 0 -2px 2px rgba(255,255,255,.5)` plus `rgba(210,235,255,.25)` rim.

**VoiceOS heading** — 60–76px at line-height **1.0–1.25**, tracking −0.025 to −0.03em. Body stays at 1.5. That contrast is the whole trick.

## Audit

Run all ten; report pass/fail with numbers, not adjectives.

1. Text contrast ≥ 4.5:1; functional boundaries ≥ 3:1.
2. Decorative hairlines are marked decorative (Contra's line is 1.24:1 on purpose).
3. Display leading 1.0–1.25; body leading ≥ 1.45.
4. One radius family; pills only for actions and chips.
5. Accent never carries small body text (VoiceOS blue is 3.65:1).
6. No proprietary font file is served; each paid family has a named substitute.
7. Duration + easing come from tokens; no default `ease-in-out` on layout.
8. Ambient/looping motion is disabled under `prefers-reduced-motion`.
9. Every headline names a standard, a gesture, or a promise.
10. No platform nouns hard-coded in prose (the source page says "your Mac" beside a Windows download).

## Anti-patterns

- **A monochrome system with mixed-quality imagery.** Without colour, every inconsistency shows. The look is cheap; the editorial discipline is not.
- **Glass on a flat page.** It collapses into a grey box with a fuzzy border.
- **System type as a brand.** SF on Mac and Segoe on Windows are two different products.
- **8px labels and 1.15 body leading.** Both exist in the source; neither belongs in a content surface.
- **A second accent.** Both systems are single-accent for a reason.

## Files

| File | Use |
|---|---|
| `contra-voiceos.html` | The full reference: 22 sections, specimens, contrast tables, compare view. Read this for depth. |
| `tokens.json` | Machine-readable values, contrast ratios, substitutes, audit list. Read this for numbers. |
| `design-dna.css` | Production tokens + primitives. Ship this. |
| `demo.html` | Proof of the swap: identical markup, two systems. |
| `README.md` | Method, licensing, limitations, agent brief. |

## Licensing

GT Standard (Grilli Type) and Recoleta (Latinotype) are commercial. SF Pro is Apple-proprietary and cannot be self-hosted for the web. The substitutes — Archivo, Inter Tight, Instrument Sans, Fraunces, Newsreader, Lora, Inter, Geist — are SIL OFL. DM Mono is SIL OFL. Never state that a font is free unless this file or `tokens.json` says so.

## Honest limits

- Values are a snapshot; landing pages change. Re-measure before treating a number as permanent.
- The reference was measured logged-out; authenticated product surfaces may differ.
- Specimens preserve metrics, not letterforms.
- Two contrast defects in the sources are documented, not silently fixed: Contra's 2.56:1 chip labels and VoiceOS's 4.37:1 muted text on the mid-sky gradient.
