---
subject: medium-format-fidelity
domain: technical-writing
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# medium-format-fidelity

A presentation subject forged on 2026-10-05 from one writing contest. It had five
techniques and two `process` applications, and no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-mff-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real. The `figures-and-tables` note's banked lead on prompt text named this
subject's code-block technique as its return condition, which made the run an event too.
`check-currency` reported nothing expired or at risk for the subject.

Three lanes ran:
- **Field lane** on `personas-web` at `01eaee60` (origin/master). It covered the same
  ten-post blog and guide pages as the four earlier passes on this bundle. Read only,
  through `git show`, `git grep` and `git archive`.
  - The Director re-read every cited line, and recomputed the contrast ratios from the
    theme file with a black-on-white control (21.00). That found a second failing light
    theme the lane had not reported (`light`, 4.30).
  - The Director replaced the lane's characters-per-line estimate with a measurement: the
    blog's 66 paragraphs wrapped in Geist Regular advance widths parsed from the font file.
    The control was i 0.244, m 0.877 and W 0.945 em.
  - All 31 anchors held under `check-anchors` in a `git archive` of the tree.
- **Counter-evidence web lane.** Sources:
  - line length: Butterick; Dyson 2004; Dyson and Haselgrove 2001; Shaikh 2005; Rello et
    al. 2016; Ling and van Schaik 2006 (summary only);
  - accessibility: WCAG 2.2 (1.4.8, 1.4.10, 1.4.3, 1.4.12) and the WCAG 3 draft of
    2026-09-10;
  - polarity: Buchner and Baumgartner 2007; Piepenbrock et al. 2013; Dobres et al. 2017;
    Legge et al. 1985 (abstract silent on polarity);
  - dark-mode share: a browser vendor's 2021 case study;
  - syntax highlighting: Hannebauer et al. 2018; Beelders and du Plessis 2016; Sarkar 2015;
  - screen sizes: StatCounter for September 2026;
  - Medium: help-centre captures in the web archive.

  The Director re-read in raw text the WCAG 1.4.8 note, Hannebauer, Dobres, Buchner, the
  22% figure and the current Medium read-time page. Two archive captures of the Medium
  editor and import pages returned no matching text on the Director's re-read, so those
  rows were not touched.
- **Training-data-only blind lane.** With no priors it reached the same results as the
  web lane:
  - no study ranks typographic factors;
  - speed and preference diverge on line length;
  - positive polarity reads better, and dark-mode share figures are unreliable;
  - syntax highlighting has mostly null results (it named Hannebauer, Sarkar and Beelders);
  - copy buttons have no evidence behind them.

  It also gave the plain-text-block treatment for prompts by analogy with code.

**Corrected:**
- **"Line length is the single largest typographic factor"** (golden path). It is refuted
  as phrased: it is the most-studied factor, not a measured largest one. The golden path
  now separates speed, comprehension and preference, and sets the column for
  understanding. WCAG 1.4.8 is Level AAA and requires a mechanism, not the author's
  default (Note 1). Web + blind.
- **"Both colour schemes are first-class. Many readers browse with a dark system scheme"**
  (golden path, light-and-dark-rendering). Restated: honour the preference, which about a
  fifth of traffic states, as a courtesy and not a reading gain, because positive polarity
  read better. "Disappears for half the audience" is gone. Web + blind.
- **Highlighting as a scanning aid** (golden path, highlighted-code-blocks). Restated: a
  reader expectation and preference, not a measured comprehension aid. Monospace,
  whitespace and copyable text carry the weight. Web + blind.
- **1440 as "a common laptop and desktop width"** (golden path, two-viewport-verification).
  It is a minor width (2.94% in StatCounter, September 2026). The wide check sits where
  the column reaches its maximum, at 1920 and then 1536 when the column grows.
- **Medium read time** (the `process` application). The current help page gives roughly
  265 WPM with an unspecified image adjustment. The per-image seconds are historical.
  `verified_on` moved to 2026-10-10; only that row was re-read.

**Conditions gained:**
- **reading-column-and-type-scale.**
  - A width class is not a count (field: 768 px holds 99 characters).
  - Raising body size shortens lines only where the cap is in px or rem.
  - A column that grows with the screen is measured at the widest common screen.
  - Skimmed text tolerates longer lines.
- **light-and-dark-rendering.**
  - A first visit never picks a theme by brand, rotation or chance.
  - With more than two themes, check every one (field: 2 of 3 light themes fail inline code).
  - A one-theme highlighter with a transparent background fails every light theme.
- **highlighted-code-blocks.**
  - Text the reader is meant to copy, prompts included, is a plain-text block even when it
    is English.
  - A renderer with no block element is the renderer's defect.
  - A copy button is a convention.
- **two-viewport-verification.**
  - A phone check covers articles only if it visits them.
  - Seed the scheme.
  - Lift a page-level clip before probing.
- **target-platform-capability-map.**
  - A feed row in the map.
  - A self-hosted site with a feed has a second platform.
- **Golden path.** Synced to all of the above, with three new failure modes: a prompt set as
  prose, a scheme picked for the reader, and a column measured on a sample string.

**Verified and left untouched:**
- Butterick's 45 to 90, verbatim.
- The 1.4.10 reflow floor (320 CSS px, two-dimensional exceptions) and the 1.4.3
  thresholds, verbatim.
- 390 as a phone width (second in the US).
- Every "when not to use it" section, except the capability map's, which now excludes a
  site with a feed.
- The `process` two-viewport application.

**Declined:**
- WCAG 1.4.12 Text Spacing as a condition (no fixed-height boxes that clip text). It was
  verified verbatim, but no field witness was checked against it.
- The lane's broadcaster figure of 20 to 25% dark preference: the mailing-list post was
  not re-read.
- A low-vision exception for dark polarity: the Legge 1985 abstract states no polarity
  result.
- Footnotes "not supported" on Medium: the capture did not reproduce on re-read.

**Banked leads:**
- WCAG 1.4.12 Text Spacing on article components (callouts, captions, code tabs). Return:
  a witness with a fixed-height text box.
- The iOS 26 screen-size reporting anomaly (US 414x896 rose from 5% to 20% in six months).
  If it is an artifact, phone-width statistics need a second source. Return: a stated
  method from the tracker, or a second tracker.
- The guide's code fence is dormant: no content uses a fence yet. Return: the first guide
  topic with a fenced block, to check the light themes.

**Notices** (personas-web, kept apart from the writing findings, not acted on):
- The RSS item cutoff is the start of today in UTC, while the page's is the current time,
  so a post dated today can show on the page before the feed.
- The feed has no entry in the page metadata (`alternates.types`), so readers find it only
  through the visible link.

## Impact

Read from each project's committed `.ai/registry-map.json` through `loadFleet()` at
`9bb39b07`. `voice-io` was the known positive and appears in 11 maps (4 to 46 hits).
`medium-format-fidelity` and `technical-writing` appear in none. `personas`, `gigs`,
`firetv`, `mage-arena-vr` and `garden-vr` have no committed map at their checked-out
HEAD. `build-registry-map --dry-run` over the tree of `3ebe2666` does not list this
subject, and lists `voice-io`. No verdict went stale, and no `/conform --stale` queue
grew. The field seams are in five `next` applications and five `applied.md` rows, and were
not applied to the site.
