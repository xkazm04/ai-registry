---
subject: chinese
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# chinese

First touch. External-reconcile wave 1, class B.

**Pin.** UAX #11 *East Asian Width* rev 44 + `EastAsianWidth-17.0.0.txt` (Unicode 17.0.0,
2025-07-24). File: `spec--character-width-and-typography.md`.
**Fate: refuted in part, confirmed in part.**

## Sightings

- **Of the 46 distinct characters the technique names, 7 carry `East_Asian_Width=A`, and
  all 7 are glyphs it *prescribes* — not one glyph it bans is unsettled.** The A-class
  prescriptions are ZH-QUOTES' Simplified curly quotes `“”‘’` (4/4), ZH-ELLIPSIS' `…`,
  and ZH-DASH' `—` (plus the rival `―`). §4 ED6 makes an A character's width dependent on
  context and §5 resolves it **narrow** when context is unreliable.
- **The asymmetry nobody states.** ZH-QUOTES presents `“…”` and `「…」` as a neutral
  Simplified/Traditional variant choice. Under the property they are not neutral: the
  corner brackets are **W** (4/4, settled), the curly quotes are **A** (4/4, unsettled).
  **A zh-Hant catalog written to this rule is width-determinate; a zh-Hans one is not** —
  and the technique's own recorded `「保存」` exception buys determinism as an unclaimed
  side effect (`点击「保存」` is 6/6 W, no split).
- Confirmed with n: ZH-FULLWIDTH 16/16, ZH-ENUM 2/2, ZH-HALFWIDTH-NUM 12/12.
- **An EAW-based ZH-PANGU linter misses the boundaries that matter.** Over 8 probe
  strings the W/F-abutting-Na/H detector finds the boundary in 5 and returns empty for
  the 3 where an A glyph sits on it. §4.2 supplies the tailoring the technique lacks:
  ambiguous quotation marks resolve wide when they enclose and are adjacent to a wide
  character, narrow otherwise.
- **Vocabulary is loose but not wrong.** §4.1 makes "fullwidth"/"halfwidth" *relational*
  properties of a compatibility **pair**, not unitary labels: `。` and `、` are W not F,
  ASCII is Na not H, and the true H counterpart of `。` is `｡` U+FF61. Right glyphs,
  loose labels.
- The property is not exotic: 1,271 non-private-use code points carry A (138,739 with
  the PUA planes, which §6.1 defaults to A).
- **Hypothesis declined.** The dispatch suggested a column-count conflation; the worker
  checked, found the technique never claims one, and recorded that instead of
  manufacturing it. §2's terminal-emulator caveat is noted as a *reader's* risk.

## Technique-edit candidates (banked for the cycle)

1. ZH-QUOTES: the Simplified/Traditional choice also decides width determinism.
2. ZH-ELLIPSIS / ZH-DASH: flag `…` and `——` as A-class; a plain-text length budget
   cannot assume their width.
3. ZH-PANGU: add §4.2's resolution rule as the concrete implementation step.
4. One sentence on the relational vocabulary.
5. Gap: `·` U+00B7 (间隔号) is also A and appears in no rule.

## Cross-subject proposals

- `korean/spacing-and-typography` carries a `use_when` about full-width versus half-width
  punctuation — **and the korean worker independently confirmed the same exposure**. See
  the run note: this is a two-sighting family.
- **Law candidate, held:** *a glyph rule that prescribes a character whose rendered width
  the character does not determine is an incomplete rule.* Generalizes past CJK to
  `arabic/script-and-typography` and `vietnamese/diacritics-and-typography`. Two sightings
  now (zh + ja); four opens the law conversation.
- `East_Asian_Width` is a mechanical, versioned anchor for typography findings, which
  serves [[every-finding-cites-an-anchor]] better than a national standard can.

## Could not verify

The "full-width punctuation carries its own visual spacing" claim and clreq's quarter-em
recommendation: **not conformance-testable** against this standard — §2 says the annex
does not provide rules for font design or line layout. They need the layout-requirements
document as a separate counterpart. GB/T 15834 is paywalled and was not fetched, so the
technique's citation of it stays unreviewed.
