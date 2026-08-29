---
subject: german
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# german

First touch. External-reconcile wave 2, class B. The wave's only non-CLDR counterpart.

**Pin.** Unicode **17.0.0** UCD — `UnicodeData.txt`, `SpecialCasing.txt`,
`CaseFolding.txt`, `DerivedCoreProperties.txt` (all verified byte-identical to `latest/`),
plus core spec §3.13 and §4.2. File: `spec--capitalization-and-compounds.md`.
**Fate: confirmed on ß→SS, refuted on ẞ, not conformance-testable on the noun rule.**

## Sightings

- **ß→SS is unconditional and language-independent.** `SpecialCasing.txt:69` puts it in
  the *Unconditional* section; the file's only language-conditional entries are `lt`,
  `tr` and `az`, and **`de` appears nowhere in it. A German language tag changes
  nothing.** Verified by the director.
- **ẞ is refuted as reachable.** U+1E9E is a real character but **no default operation
  produces it** — it appears nowhere in `SpecialCasing.txt`, and `UnicodeData.txt` gives
  it a lowercase map to ß while ß has no simple uppercase map at all. The arrow runs one
  way. Core spec §3.13 lists "Uppercasing of U+00DF … to U+1E9E" among the case
  **tailorings** *not* covered by the file, beside Dutch IJ and Greek accent removal.
  Verified by the director.
- **The sharpest finding inverts the technique's own advice.** DE-ESZETT recommends
  applying uppercasing in the presentation layer, one sentence after naming ẞ the
  preferred all-caps variant. But the presentation layer is exactly where the *default*
  mappings run, and they produce `STRASSE`, never `STRAẞE`: of 67 sample strings
  containing no U+1E9E, **0** produce one under uppercase, lowercase, titlecase, full
  folding or simple folding. The correct advice is the inverse — do not uppercase German
  there unless a tailoring is wired and tested.
- **Uppercasing German is lossy and irreversible.** n = 68 strings; **20 change length
  under uppercase and the same 20 fail the upper→lower round trip** (4/23 of the
  technique's own strings, 16/45 of a realistic UI sample). Three pairs collide:
  `{Straße, STRASSE}`, `{Maße, Masse}`, `{schließen, Schließen}`.
- **No single caseless key serves German.** Full folding matches `Straße`/`STRASSE` but
  **merges `Maße`/`Masse`**; simple folding keeps that pair apart but misses
  `Straße`/`STRASSE`. A termbase lookup, a dedup key and a search index cannot all be
  right, and the technique never asks for the choice to be recorded.
- **A derived-property contradiction.** `DerivedCoreProperties.txt` lists U+00DF under
  `Changes_When_Uppercased` (derived from the *full* mappings) while its *simple* mapping
  is identity — so a guard asking "does this change?" gets `yes` and then changes nothing.
  20/68 strings differ between simple and full uppercase, each yielding `STRAßE`-shaped
  mixed-case artifacts.
- **Default titlecasing breaks two of the technique's rules at once**: `KI-gestützt →
  Ki-Gestützt`, `Persona auswählen → Persona Auswählen`.

## Honesty note carried into the document

The UCD ships **no case-conversion or case-folding conformance test** — grep-scoped
against the 17.0.0 `ucd/` listing, which carries normalization, bidi and segmentation
tests and nothing for casing. This is property classification plus an implementation of
§3.13.2 R1–R3, not a conformance run, and the application says so.

## Technique-edit candidates (banked for the cycle)

1. **DE-ESZETT: replace the presentation-layer sentence** — it reads as mitigation and is
   the failure mode.
2. DE-ESZETT gains a **caseless-key clause**: which folding a search, termbase or dedup
   key uses must be chosen per surface and written down.
3. DE-CASE gains a **titlecase prohibition**.
4. DE-CASE's noun rule states its limit — a case-based audit reads a character property;
   "every noun is capitalized" is not derivable from it.

## Cross-subject proposals

- The **simple-vs-full folding** disagreement is not German-specific (Greek final sigma,
  Turkish dotted I, the ligature entries). A folding-choice family at a second sighting.
- **`translation-pipeline-topology/source-identical-value-audit`**: an identity comparison
  over a `de` catalog that normalizes case will silently equate `Maße` and `Masse` under
  default folding. Worth a lead in that subject's note.
- **Turkish is absent from the bundle**, and `SpecialCasing.txt`'s `tr`/`az` conditional
  mappings are the sharpest language-sensitive casing data the standard ships — the
  counterpart is already pinned if a Turkish subject is ever forged.

## Could not verify

The technique's claim that the 2024 revision of the official German rule set makes
`STRAẞE` the preferred variant, and the 2017 officialization — an orthography-council
fact outside the Unicode pin, not asserted in the application. Whether CLDR ships a `de`
case tailoring mapping ß→ẞ: the core spec names CLDR as the preferred mechanism for such
tailorings but does not assert one exists. **That is the obvious next fetch** and would
close the loop.
