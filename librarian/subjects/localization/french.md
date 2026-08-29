---
subject: french
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# french

First touch. External-reconcile wave 2, class B.

**Pin.** `unicode-org/cldr@48.2` + UTS #35 Part 3 (self-declares 48.2, so no spec/data
skew) + `common/rbnf/fr.xml`. File: `spec--plural-and-agreement.md`.
**Fate: confirmed**, three new sub-claims and one documented gap. FR-ZERO and FR-MANY
both hold exactly as written — no refutation was manufactured.

## Sightings

- **`one` is the half-open interval [0, 2), not "0 and 1".** The rule is `i = 0,1` on
  the *integer-digits* operand, so 0,5 → `one`, 1,5 → `one`, 1,999 → `one`, 2,0 →
  `other`. **Verified by the director.** The spec says this twice and one of them uses
  French as its worked example. The technique's "0 and 1" is true of the integers and
  misleading about the branch. New audit signature: a `one` branch that spells the
  number out or assumes exactly-one (*Un poste*, *Il reste une minute*) renders **1,5
  poste** wrong the first time a rating or an average reaches it — and the `=1`
  signature the technique already names is worse than documented, missing 0 *and* every
  non-integer below 2.
- **Ordinals are a real gap, and the technique is silent.** `fr` has an ordinal `one`
  (`n = 1`) which **disagrees with the cardinal rule at 0** — 0 is `one` as a cardinal
  and `other` as an ordinal, because the ordinal tests `n` where the cardinal tests `i`.
  Worse: CLDR's own `ordinalMinimalPairs` for `fr` are **feminine** (`{0}re` / `{0}e`,
  verified by the director), and nothing in the plural machinery distinguishes masculine
  *1er* from feminine *1re* — that gender lives in RBNF's four ordinal rulesets. **A
  `selectordinal` block for French has two branches and cannot express 1er vs 1re.**
- **`many` is selected by the formatted representation, not the magnitude.**
  `1000000` → `many`, `1000000.0` → `other` (one visible fraction digit breaks `v=0`),
  `1500000` → `other` but the same quantity compact (`1.5c6`) → `many`. A `many` branch
  cannot be tested by feeding the counter a big number — only through the formatter the
  surface uses.
- **Ranges:** `fr pt` has three rows, **0 overrides**, and **every `many` pair is
  absent** — including the compact ranges FR-MANY tells people to write. Verified by the
  director. So "a range takes its end value's category" happens to hold for `fr`, but as
  a coincidence of the defaults, portable to no other locale.
- Provenance check: `many` first appears for `fr` at CLDR release-38, so the technique's
  "since v38" is correct.

## Executed evidence

Own operand implementation and rule-grammar parser, no plural library. Cardinal 85/85,
ordinal 22/22, 0 disagreements. Six degenerate controls, all failing: over the 200
two-decimal values in [0,00–1,99] CLDR selects `one` for all 200 while an exact-value
implementation disagrees on **198** and the English rule set on **200**.

**2026-08-29 (cycle) - LANDED.** FR-ZERO restated as the half-open interval [0, 2)
with the fractional-branch requirement; FR-MANY gained the rendering-not-magnitude
clause. Two new rules: `FR-ORDINAL` (two categories, 0 differs from the cardinal, and
the gender is not selectable) and `FR-RANGE` (under-covered table, every many pair
absent). The golden path was left alone this cycle - it carries the same understatement
and is banked. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. Restate FR-ZERO's rule as the interval [0, 2), with the fractional-numeral branch
   requirement.
2. Add an FR-ORDINAL rule: two branches, 0 is `other`, and er/re is **not selectable**
   through the plural machinery.
3. FR-MANY: state that the category follows the rendering, not the magnitude.
4. Golden path `french.md` repeats "one covers 0 AND 1" and inherits the understatement.

## Cross-subject proposals

- **The range family, sighting 5.** Its phrasing of the transferable rule is the best of
  the wave and the one to land: *range selection is a pair lookup with an end-value
  default, and reusing the end value's category is a per-locale coincidence, never a
  design.* It adds a second failure mode the others did not — a table that
  **under-covers its own locale's category set**.
- **"A plural category can be a property of the rendering, not the value"** — pairs with
  [[spanish]] (plain vs compact) and [[czech]] (`v != 0`). Three sightings.

## Upstream, second independent sighting

The CLDR 48.2 `SHASUM512.txt` digest mismatch first reported by [[arabic]] was
**independently reproduced here** — this worker computed the same `de8660f5…` for the
served zip against the manifest's `4dd00bed…`, which the manifest also assigns to two
jars. Two independent computations agree; the manifest rows are wrong, not the downloads.

## Could not verify

FR-AGREE and FR-PLURAL (acronym plurals, the *(s)* form, unknown-gender policy) are
morphology and untested by this counterpart. Whether French usage prefers the singular at
1,5 was not adjudicated — the standard assigns the category, the technique owns the grammar.
