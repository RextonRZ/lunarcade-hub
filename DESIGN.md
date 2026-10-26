---
name: LunarCade Hub
description: Explore the Moon. Play Among the Stars. The download site's night-sky world, built from the game's own palette and type.
colors:
  bg: "#090b1f"
  surface: "#121534"
  surface-2: "#191d45"
  hairline: "rgba(214, 219, 255, 0.12)"
  hairline-strong: "rgba(214, 219, 255, 0.22)"
  ink-strong: "#f5f3ff"
  ink: "#c8cbe8"
  ink-muted: "#8a8eb6"
  accent: "#ffd36b"
  accent-hover: "#ffdc84"
  accent-ink: "#1b1530"
  cyan: "#8fe3ff"
  safe: "#7be0b0"
  rose: "#ff8fb8"
typography:
  display:
    fontFamily: "Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 4.9vw, 4.25rem)"
    fontWeight: 900
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  readout:
    fontFamily: "Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 800
    lineHeight: 1.3
  lede:
    fontFamily: "'Nunito Text', Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "clamp(1.06rem, 1.3vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "'Nunito Text', Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 800
    lineHeight: 1.3
  meta:
    fontFamily: "'Nunito Text', Nunito, 'Noto Sans SC', system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
rounded:
  focus: "6px"
  field: "10px"
  shot: "12px"
  panel: "14px"
  pill: "999px"
spacing:
  hair: "6px"
  tight: "8px"
  row: "12px"
  grid: "14px"
  field: "20px"
  panel: "26px"
  section: "32px"
  chapter: "18vh"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-ink}"
  button-ghost:
    backgroundColor: "rgba(18, 21, 52, 0.5)"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-text:
    textColor: "{colors.ink-strong}"
    padding: "0 8px"
    height: "48px"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  pill-choice:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  field-input:
    backgroundColor: "rgba(9, 11, 31, 0.55)"
    textColor: "{colors.ink-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "26px"
  panel-lit:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "26px"
  phase-readout:
    textColor: "{colors.cyan}"
    typography: "{typography.readout}"
---

# Design System: LunarCade Hub

## Overview

**Creative North Star: "One Lunar Month"**

The site is a night sky that teaches. A live, photoreal Moon (NASA LRO colour map, Lommel-Seeliger shading, earthshine on the dark limb) is the only illustration, and it changes phase as the visitor moves through the page, so reading the page is the lesson the game teaches. Everything else steps back: deep indigo ground, hairline panels, real game screenshots without device chrome, and the game's own rounded Nunito set heavy for display.

The palette is the game's: night-sky indigo, moonlight gold, Nova's cyan. Gold is light, so it lands only where the page wants a hand to move (the primary download) and where the Moon is (the active phase). Cyan is the instrument colour and appears only in the phase readout. The mood is calm, clear and a little playful: a parent should feel reassured by plain facts; a ten-year-old should still feel the sky.

Density is low. Chapters are tall, single-column on the right, with generous vertical air between them; the left column holds the Moon pinned at a steady size. On phones the Moon becomes a slim pinned strip under the header so the month keeps turning while the content scrolls.

**Key Characteristics:**
- One dark indigo ground with a single faint cyan radial; no section background changes.
- The live Moon is the hero and the only illustration; proof is real screenshots.
- Gold is rationed to the primary action and the active phase.
- Hairline borders and tonal surfaces carry structure; shadows are reserved for things that float.
- Nunito at 800-900 for every heading, label and control; Nunito Text 400/600 for reading.
- Motion follows the Moon: eased, unhurried, and fully disabled under reduced motion.

## Colors

A narrow night-sky palette: three indigo depths, three lavender-tinted inks, one gold light, and three tightly scoped signal hues.

### Primary
- **Moonlight Gold** (`accent`): the primary action fill, the selected phase ring, focus outlines, text-selection tint, underline colour on links, the gold half of the hero headline and the wordmark's "HUB". It is also the warm glow on the Windows download panel, whose strength follows how much of the Moon is lit.
- **Gold Shadow Ink** (`accent-ink`): text and icons on a gold fill. Never used elsewhere.

### Secondary
- **Nova Cyan** (`cyan`): the phase name in the Moon readout, and the faint radial wash in the page background. Nothing else.

### Tertiary
- **Earthshine Green** (`safe`): check icons in the safety list and the review-posted confirmation. Reassurance only.
- **Heart Rose** (`rose`): review hearts, the heart picker and the "love" toggle when pressed. Nowhere outside reviews.

### Neutral
- **Night Sky Indigo** (`bg`): the page ground, the theme colour, and the knock-out ring around the active phase.
- **Deep Orbit** (`surface`): panels, the review form, download side cards, screenshot backing.
- **High Orbit** (`surface-2`): the one raised panel (Windows download) and chips.
- **Hairline** (`hairline`): every divider, panel border and list rule. **Hairline Strong** (`hairline-strong`) for interactive outlines: ghost buttons, inputs, choice pills, the header play link.
- **Starlight** (`ink-strong`): headings, names, values, link text, input text.
- **Lavender Ink** (`ink`): body copy and nav links.
- **Dusk Ink** (`ink-muted`): captions, metadata, spec labels, readout facts, icon tint inside headings.

### Named Rules
**The Moonlight Rule.** Gold is light, not decoration. It appears on the primary action, the active phase, focus, and the one panel the Moon lights. If a screen has two gold fills competing, one of them is wrong.

**The Instrument Rule.** Cyan belongs to the Moon readout. It never colours a button, link, heading or border.

**The Scoped Signal Rule.** Rose exists only inside reviews and green only for reassurance (safety facts, success). Neither becomes a general accent.

## Typography

**Display Font:** Nunito (the game's face), with Noto Sans SC and system-ui as fallbacks
**Body Font:** Nunito Text (self-hosted Nunito 400 and 600), falling back to Nunito, Noto Sans SC, system-ui

**Character:** One rounded family in two registers. Heavy Nunito (800-900) gives headings and controls the game's friendly, chunky voice; the lighter text cut keeps paragraphs calm and easy for parents with mixed English fluency. Chinese falls through to Noto Sans SC, matching the game.

### Hierarchy
- **Display** (900, clamp(2.5rem, 4.9vw, 4.25rem), 1.04, -0.025em): the single page headline. Its second sentence may be set in gold on its own line.
- **Headline** (900, clamp(1.9rem, 3.2vw, 2.75rem), 1.08, -0.02em): one per chapter, written as a short plain sentence ending in a full stop.
- **Readout** (900, clamp(1.5rem, 2.4vw, 2rem), 1.1, cyan): the current phase name under the Moon. Drops to 1.15rem in the phone strip.
- **Title** (800, 1.1rem, 1.3): panel and step headings, the review-form heading.
- **Lede** (400, clamp(1.06rem, 1.3vw, 1.2rem), 1.65): the opening paragraph only.
- **Body** (400, 1rem, 1.65; chapter paragraphs 1.06rem, max 36em): all reading text.
- **Label** (800, 0.9rem, 1.3): buttons (at 1rem), form labels and legends, nav links (700), chips (700, 0.72rem, 0.02em).
- **Meta** (400-600, 0.8-0.9rem, tabular numerals): facts line, spec rows, dates, captions, counters.

### Named Rules
**The Two Registers Rule.** Nunito heavy for anything you scan or press; Nunito Text for anything you read. Never set a paragraph in 800, never set a button in 400.

**The Real Numbers Rule.** Every version, size, count, date and day number uses tabular numerals so live values from the release feed never shift the layout.

## Layout

A two-column month on wide screens: a 5:12 sky column holding the pinned Moon and a 7:12 chapters column (`minmax(0, 5fr) minmax(0, 7fr)`, gap clamp(24px, 4vw, 72px), max width 84rem, side padding clamp(20px, 3vw, 40px)). The sky column is sticky below the 64px header and fills the viewport height; the Moon frame is `min(100%, 68vh, 600px)` square with the readout and an eight-phase dial below it.

Chapters run 40rem wide (48rem for downloads and install help), with 18vh above each and 4vh below. The opening chapter fills the first viewport and centres its content vertically. Inside a chapter, rhythm steps through 20px (paragraph after heading), 32px (actions, grids, screenshot groups), and 28-36px for closing rules and lists.

Below 900px the grid collapses to one column with a 16px gutter. The header scrolls away, and the Moon becomes a sticky strip (64px Moon beside the day and phase name, fact and dial hidden) on a blurred translucent indigo bar. Download cards stack; install steps stack. Below 520px, hero buttons go full width and the screenshot duo stacks.

### Named Rules
**The Pinned Sky Rule.** The Moon never scrolls away. On every width some form of it stays pinned and keeps reporting the day and phase.

## Elevation & Depth

Depth is mostly tonal: indigo ground, Deep Orbit panels, one High Orbit panel, all outlined in hairlines. Shadows appear only on things that sit above the sky: real screenshots and the gold primary button. Glass (translucent indigo plus 10px backdrop blur) is used only for pinned bars: the header and the phone Moon strip. The Windows panel adds a soft gold radial from its top-left corner whose opacity tracks the Moon's lit fraction.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 2px 6px rgba(0,0,0,0.25), 0 24px 60px rgba(0,0,0,0.35)`): game screenshots.
- **Lift** (`box-shadow: 0 1px 2px rgba(0,0,0,0.35), 0 8px 22px rgba(0,0,0,0.35)`): the gold primary button.
- **Focus halo** (`box-shadow: 0 0 0 3px rgba(255,211,107,0.18)`): inputs on keyboard focus, with a gold border.
- **Phase ring** (`box-shadow: 0 0 0 2px #090b1f, 0 0 0 3.5px #ffd36b`): the active phase in the dial.

### Named Rules
**The Tonal-First Rule.** Panels are flat and outlined. A shadow means the object floats over the sky (a screenshot, the main action), never that a card is important.

## Shapes

Soft and round, like the game. Every interactive control is a full pill (999px): buttons, choice pills, chips, the love toggle, the header play link. Containers use a gentle 14px corner; screenshots 12px; inputs 10px; focus outlines 6px. Circles are reserved for the Moon, the phase dial and the Nova avatar. Screenshots are always the real game at its native aspect, clipped to their corner with no device frame.

## Components

### Buttons
Rounded, confident and few.
- **Shape:** full pill (999px), minimum height 48px, 22px side padding, Nunito 800 at 1rem, icon then label with a 10px gap.
- **Primary:** Moonlight Gold fill with Gold Shadow Ink text and the Lift shadow. One per view: the Windows download, or the form submit.
- **Hover / Focus / Active:** gold brightens slightly on hover (fine pointers only); 2px gold focus outline offset 3px; pressing scales to 0.97 over 120ms.
- **Ghost:** translucent Deep Orbit fill, Hairline Strong border, Starlight text; border warms to gold at 55% on hover. Used for Android and secondary paths.
- **Text:** no border or fill, Starlight text that turns gold on hover; for "Play online" alongside the pair.

### Chips
- **Style:** High Orbit fill, hairline border, Lavender Ink, Nunito 700 0.72rem. Used for the reviewer's role.

### Choice pills and heart picker
- **Pills:** 40px tall outlined pills; checked state gets a 14% gold wash, a 60% gold border and Starlight text. The native radio is visually hidden and keeps focus, which draws a gold outline on the pill.
- **Hearts:** five 44px targets with 30px outline hearts in faded rose; chosen hearts fill solid rose.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Deep Orbit; the single featured card uses High Orbit plus the moonlit gold radial.
- **Shadow Strategy:** none (see Tonal-First Rule).
- **Border:** 1px hairline.
- **Internal Padding:** 26px for download cards, 28px for the review form (20px on small phones).
- **Spec lists:** label left in Dusk Ink, value right in Starlight 600 with tabular numerals, each row closed by a hairline.

### Inputs / Fields
- **Style:** 1px Hairline Strong border, 10px corner, translucent night fill, Starlight text in Nunito Text 1rem, gold caret, 12px 14px padding. Labels sit above in Nunito 800 0.9rem.
- **Focus:** border turns gold with the 3px Focus halo; no browser outline.
- **Limits:** a right-aligned tabular counter (for example 0/300) sits under long fields.
- **Error / Success:** errors are Starlight 600 text announced as alerts; success is Earthshine Green.

### Navigation
- **Header:** 64px sticky glass bar with a hairline bottom edge. Wordmark left (Nova avatar, "LUNARCADE" in Starlight, "HUB" in gold, Nunito 900 with 0.06em tracking); four chapter links in Lavender Ink Nunito 700 that brighten to Starlight on hover; an outlined "Play online" pill at the far right.
- **Mobile:** the header wraps, nav becomes a horizontal scroll row under the wordmark, and the header scrolls away so only the Moon strip stays pinned.
- **Footer:** hairline top, wordmark with the tagline in Dusk Ink, three links, and the NASA/LRO image credit.

### Review rows
- Open list rows divided by hairlines, not cards: name in Nunito 800, role chip, date pushed right in Dusk Ink, rose hearts, then the comment. A small outlined pill "love" toggle turns rose when pressed. The summary shows the average in Nunito 900 2.6rem beside rose hearts. With no reviews, a single muted line invites the first one; nothing is ever pre-filled.

### The Live Moon (signature)
A WebGL canvas of the real Moon that eases (exponential follow, about 5 per second) to the day of whichever chapter is in view. Under it: "Day N" and "% lit" in Starlight and Dusk Ink with tabular numerals, the phase name in cyan Readout type, and one sentence explaining the geometry. Phase name and fact swap with a 220ms fade and 3px blur. An eight-dot phase dial (each dot a tiny rendered Moon at 55% opacity, the current one full, scaled 1.18 and ringed in gold) jumps to that chapter. Under reduced motion the Moon snaps to the day and nothing swaps or blurs.

### Screenshots
Real game captures, never mockups. Arranged as a main shot with an overlapping inset (alternating sides between chapters) or as an offset duo, with a Dusk Ink caption. They reveal with a top-down clip over 900ms when they enter view, the inset 140ms later.

## Do's and Don'ts

### Do:
- **Do** keep the page on one indigo ground (#090b1f) and build hierarchy with Deep Orbit and High Orbit surfaces plus 1px hairlines.
- **Do** spend gold only on the primary action, the active phase, focus and the moonlit download panel.
- **Do** keep cyan inside the Moon readout.
- **Do** set headings, buttons and labels in Nunito 800-900 and reading text in Nunito Text 400/600.
- **Do** make every control a pill at least 40px tall (48px for buttons) with a visible 2px gold focus outline.
- **Do** use tabular numerals for every version, size, date, count and day.
- **Do** show the real game: native-aspect screenshots, 12px corners, the Float shadow, no device chrome.
- **Do** ease motion with cubic-bezier(0.22, 1, 0.36, 1) or cubic-bezier(0.23, 1, 0.32, 1), keep presses at 120ms, and turn every entrance, reveal and swap off under prefers-reduced-motion.

### Don't:
- **Don't** introduce a light theme or alternate section backgrounds; the sky is continuous.
- **Don't** use rose or green outside reviews and reassurance.
- **Don't** add illustrations, stock imagery or device mockups; the Moon and real screenshots are the only pictures.
- **Don't** put shadows on panels or cards to signal importance.
- **Don't** invent ratings, counts or testimonials to fill an empty state; empty states say so plainly.
- **Don't** give hover effects to touch devices; hover rules sit behind `(hover: hover) and (pointer: fine)`.
