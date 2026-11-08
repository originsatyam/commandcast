# Design DNA — Contra × VoiceOS

A measured extraction of two real design systems, kept in one self-contained HTML file. It exists so that "I like how that site feels" can become a list of decisions you can actually reuse: values, ratios, type ramps, materials, motion, and voice — plus free stand-ins for every font you can't legally ship.

```
design-dna/
├── contra-voiceos.html   the reference deck (open in any browser)
├── demo.html             live swap: same markup, two systems
├── design-dna.css        production tokens + primitives
├── tokens.json           machine-readable values, ratios, substitutes
├── SKILL.md              install-ready skill manifest
└── README.md             this file
```

Open [contra-voiceos.html](contra-voiceos.html). No build step, no server, no dependencies except Google Fonts for the stand-in specimens.

---

## Why these two

They answer the same brief — *make a creative or technical audience trust us* — with opposite mechanisms:

| | **Contra** | **VoiceOS** |
|---|---|---|
| Position | The work is the colour | The interface is a material |
| Hierarchy from | Value and spacing | Light, blur, and scale |
| Feels like | A printed portfolio catalogue | A native macOS app |
| Type | GT Standard L + M (paid, optical sizes) | SF Pro system stack + DM Mono |
| Risk if copied badly | Looks cheap and empty | Looks like frosted plastic |

Put side by side, they make a useful point: neither uses colour for hierarchy. One removes it, the other manufactures light. That is the kind of distinction a mood board can't teach you.

---

## What's in the file

Three views, switched in the top bar:

**Contra** — identity, colour, typography, layout, surface, components, motion, voice, steal sheet.
**VoiceOS** — the same nine sections, adapted to a material system.
**Compare** — the two positions, a measured difference table, the same card rendered in both DNAs, and a routing table for what to borrow.

Every section follows the same shape: the decision, the measured values, a live specimen, and the trap. The numbers are computed styles captured from the live pages, not estimates from screenshots.

Things worth opening directly:

- **Colour** — swatches are click-to-copy, and every pair carries its real WCAG ratio. Two genuine defects are flagged rather than hidden (Contra's 2.56:1 chip labels; VoiceOS's 4.37:1 muted text on the mid-sky gradient).
- **Typography** — the full ramp with size / line-height / weight / tracking, a specimen at the original metrics, and free stand-ins with licences and variable axes.
- **Components** — rebuilt from the extracted tokens: Contra's 48px pills, 32px chips, 2px-gutter tiles; VoiceOS's glass nav, 68px glass button, keycap, FAQ rows, window chrome.
- **Steal sheet** — a copy-paste `:root` block for each system, three moves worth taking, two traps.

The document itself has a light/dark switch (bottom right of the top bar) and prints cleanly. Specimen canvases always render in the site's native theme, so Contra stays white/black even when the doc is dark.

---

## The operational kit

The deck is for reading. These files are for building.

| File | What it is | When to reach for it |
|---|---|---|
| [design-dna.css](design-dna.css) | Tokens + 11 primitives under `[data-dna="…"]` | Drop into a project |
| [tokens.json](tokens.json) | Every measured value, contrast ratio, substitute, and audit check | Feed an agent or a build script |
| [demo.html](demo.html) | Identical markup rendered in both systems | Check the swap before trusting it |
| [SKILL.md](SKILL.md) | Install-ready skill manifest | Make the agent use it by default |

The contract is one attribute:

```html
<link rel="stylesheet" href="design-dna.css">
<body data-dna="contra">  <!-- or "voiceos" -->
  <h1 class="dna-display">Get more creative</h1>
  <a class="dna-btn">View project</a>
</body>
```

Nothing in the markup changes between systems. The primitives are `.dna-display`, `.dna-title`, `.dna-h3`, `.dna-lede`, `.dna-body`, `.dna-eyebrow`, `.dna-btn`, `.dna-card`, `.dna-panel`, `.dna-chip`, `.dna-surface`.

Two things the kit deliberately corrects: Contra's 16px body ships at **1.5 leading** here (the original 1.15 is a label setting, not a prose setting), and VoiceOS's glass is documented as **needing a background behind it** — on flat white it collapses into a grey box.

To install it as a skill:

```bash
cp -r design-dna ~/.claude/skills/design-dna
```

Then the agent routes on the brief — marketplace/portfolio to Contra, consumer AI/desktop to VoiceOS — and audits with the ten checks in `SKILL.md`.

---

## Use it

### 1. As a reference while designing
Open the section that matches the problem, not the site. Building a marketplace grid? Contra §04. Building a consumer AI landing? VoiceOS §05. The "traps" are the part most references leave out.

### 2. As a token source
Click any swatch to copy its hex, or take the whole set from `design-dna.css` / `tokens.json`. Replace the licensed families with the stand-ins below.

### 3. As a critique instrument
The compare view's "same card, two DNAs" is a fast test: drop your own component into both canvases. If it only works in one, you've found where its identity actually lives.

### 4. To train an agent
Paste this into a new agent thread, with the HTML attached or open:

```text
Use design-dna/contra-voiceos.html as a design reference. It contains two
measured systems: Contra (monochrome editorial catalogue) and VoiceOS
(liquid-glass native app).

Before proposing any UI, read the relevant "Steal sheet" and "Two traps"
sections. Then:

- If I say "Contra-like": monochrome UI, 2px grid gutters, 16px cards,
  24px pill buttons, display type tight and text type loose, colour only
  from imagery, no gradients in chrome, 170ms ease-out hover states.
- If I say "VoiceOS-like": sky/atmosphere behind glass, 24px cards with
  inset rim light, display type set solid (line-height 1.0), 200ms UI /
  350ms settle, one blue used as a signal not as body text.

Never claim a font is free unless the licence in the README says so. When
a paid family is requested, propose the listed stand-in and say what
changes (letterforms, widths, optical sizes).
```

The agent brief works because the file states constraints, not adjectives. "170ms ease-out" is testable; "premium feel" is not. The same brief is packaged in [SKILL.md](SKILL.md) with routing, a build procedure, and the audit list — install that once and the agent can load it without the deck.

---

## The fonts: paid, proprietary, and free

Nothing proprietary is embedded or redistributed in the file. Specimens keep the **original's measured size, weight, tracking, and line-height** and render in the closest free face, labelled as a stand-in.

| Original | Used by | Status | Free stand-ins (full families) |
|---|---|---|---|
| **GT Standard** — Grilli Type | Contra display (L) + UI (M) | **Paid.** 7 weights × 6 widths × 3 optical sizes (336 styles). Web licence is separate and tiered by monthly visitors. | **Archivo** — variable width 62.5–125%, weight 100–900, italic (OFL). Best system substitute.<br>**Inter Tight** — 100–900, italic (OFL). Closest texture.<br>**Instrument Sans** — width 75–100, weight 400–700, italic slant (OFL). Most character. |
| **Recoleta** — Latinotype | VoiceOS accent serif | **Paid.** 7 weights + Alt, no italics. Declared in the page's CSS but **not applied to any element on the landing page** — treated here as a reserved brand asset. | **Fraunces** — weight 100–900, SOFT + WONK + optical size axes (OFL). Closest character.<br>**Newsreader** — optical size 6–72, weight 200–800, italic (OFL). Quieter, better for reading.<br>**Lora** — 400–700 + italic (OFL). Safest for long copy, least retro. |
| **SF Pro** — Apple | VoiceOS primary | **Proprietary.** Free as the OS UI font, but Apple's licence does not allow self-hosting it for the web. Windows users see Segoe UI instead. | **Inter** — 100–900 + italic, optical size (OFL). Closest neutral match.<br>**Instrument Sans** — closer UI proportions.<br>**Geist** — Vercel, 100–900 (OFL). Closest Swiss/geometric premise. |
| **DM Mono** — Google | VoiceOS labels | **Free**, SIL OFL. Already shippable. | — |

Notes on the free options:

- **Geist is not on Google Fonts**, so it is named but not previewed in the file. `Inter Tight` is the practical CDN stand-in.
- **Fontshare's Sentient** is often called a Recoleta alternative and is free for commercial use, but Fontshare mixes an open-source OFL track with a closed ITF Free Font Licence. The readable family pages did not state which applies, so check the shipped licence before hosting it as a webfont. It is therefore mentioned, not recommended as a drop-in.
- Replacing GT Standard with Archivo loses the three optical sizes. You can fake the intent with the width axis (display narrower, text normal) — the file's specimen does this by feel, not by formula.

---

## How this was measured

- **Live DOM, not screenshots.** Computed styles were read at **1440 × 900** and again at **584 px** (the preview pane's initial width, which conveniently exposed the fluid type behaviour).
- **CSSOM pass** over every stylesheet for custom properties and `@font-face`. VoiceOS exposes 109 custom properties (mostly Tailwind); Contra's styling is CSS-in-JS and exposes none, so its tokens were reconstructed from computed values.
- **Contrast** calculated with the WCAG 2.1 relative-luminance formula on the final rendered hex pairs. Ratios shown are for the exact pairs named, not for the nearest token.
- **Font audit** via `document.fonts` plus the `@font-face` rules, which is how the Recoleta finding surfaced.
- **Geometry** from `getBoundingClientRect()` for containers, grids, padding, and radii.
- **No pixel diff.** Screenshots could not be captured while the app window was minimised, so visual verification was done through DOM geometry and computed styles. The layout was checked at 375, 768, and 1440 px with zero horizontal overflow.
- **Firecrawl was unavailable** — its connector's base URL is missing the required API version path, and no key was present locally. **TinyFish Fetch** was used for a rendered-markdown pass of both pages, which confirmed the section inventory, navigation, and copy (and caught two places where invented sample copy had crept into rebuilt specimens). Computed tokens still come from the live DOM: it is the more precise source, and the only way to read CSS-in-JS values and computed contrast.

---

## Honest limitations

1. **Logged-out Contra.** The extraction is the public `contra.com/?view=projects` landing, not the authenticated product. The app's density, forms, and tables may use a different subset.
2. **Landing pages change.** Everything is date-stamped 29 Oct 2026. Re-measure before treating a number as permanent.
3. **Fluid values are interpolated from two widths.** VoiceOS's 63.36px section heading is 38px at 584px; the ≈`2.96vw + 20.7px` figure is a two-point fit, not the site's source formula.
4. **Specimens are metric-accurate, not letterform-accurate.** GT Standard, Recoleta, and SF Pro are shown through stand-ins or the OS font. Proportions and spacing are right; the drawings are not.
5. **Two contrast defects are inherited, not fixed.** Contra's chip labels (2.56:1) and VoiceOS's muted text on the mid-sky gradient (4.37:1) are reported as findings. If you copy those components, use the corrected values noted beside them.
6. **The serif is not part of VoiceOS's landing system.** Recoleta is loaded and unused there. It may be used on blog or brand surfaces this extraction did not cover.
7. **No dark mode on either source.** VoiceOS has one dark *section*, not a theme. The doc's dark toggle is a reading aid, not a claim about the sites.

---

## Adding a third site

The file is structured so a new system is a new `view`, not a rewrite:

1. Capture at 1440 and one narrow width: `getComputedStyle` for colours, type, radii, shadows, padding, and `document.fonts` for the families.
2. Record the **scale**, not the styles: sizes with line-heights and tracking, container widths, grid gaps, section rhythm, durations and easings.
3. Audit the font licences before previewing anything. Keep the original metrics; swap the letterforms.
4. Write the same nine sections plus a "two traps" block. If a system has nothing to say in a section, that's a finding — say so.
5. Add one row to the compare table and one card to the steal matrix.

The rule that keeps the collection useful: **every claim gets a number, and every number gets a date.**

---

*Independent reference. Not affiliated with Contra or VoiceOS. Sources: [contra.com](https://contra.com/) · [voiceos.com](https://www.voiceos.com/). Typeface licensing verified against [Grilli Type](https://www.grillitype.com/typeface/gt-standard), [Latinotype](https://www.latinotype.com/typefaces/recoleta), [Google Fonts](https://fonts.google.com/), and [Fontshare](https://www.fontshare.com/licenses).*
