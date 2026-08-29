---
subject: indonesian
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# indonesian

First touch. External-reconcile wave 1, class B.

**Pin.** `unicode-org/cldr@release-48-2` + UTS #35 Part 9 (MessageFormat) + ICU4J 78.3.
File: `spec--quantity-and-plurality.md`.
**Fate: confirmed on the data, refuted on the consequence.**

## Sightings

- `id` is genuinely single-category `other`, **cardinals and ordinals both** (43 + 21
  samples). Corpus-wide harness: 3,863 samples over 65 rulesets, 0 mismatches, with a
  constant-`other` negative control failing 1,794 of the same set.
- **The mandatory branch is `*`, not `other`.** UTS #35 Part 9 requires at least one
  variant whose keys are all the catch-all `*`; `other` is an ordinary literal key. So
  the technique's "exactly one branch, `other`" is a message that will not build —
  ICU4J rejects it at construction. The older `{count, plural, …}` generation inverts
  the vocabulary, and the technique states only that older spelling as if it were the rule.
- **"Skeleton defect at worst" is not defensible.** None of the four data-model errors
  covers an unreachable key; a stray `one` in an `id` message is inert. Read against
  [[format-skeleton-is-inviolable]], *keeping* it is the conservative move — dropping a
  branch the source carried is what changes the syntax-keyword set. Dead weight, not a defect.
- **The ordinal caveat is necessary, not vacuous** — which is the opposite of what the
  dispatch expected. Lao sits in the **same** 35-locale cardinal ruleset as `id` and
  carries `one`/`other` ordinals. Cohort membership predicts nothing.
- Exact keys (`=1`) outrank rule keywords and survive a one-category locale: one plural
  category does not mean one wording, a mechanism the technique conflates with the
  `one` category.
- Legacy `in`/`id`: CLDR aliases it, but on a JDK with `useOldISOCodes=true`,
  `new Locale("id").getLanguage()` returns `in`, and a resource path built from it misses
  an `id/` catalog. Measured both ways.

**2026-08-29 — LANDED (measured disproof).** The catch-all correction (`*` vs
`other`, generation-specific) and the removal of "skeleton defect at worst" landed in
`techniques/quantity-and-plurality.md` and in the golden path's plurality paragraph.
The exact-key escape hatch and the Lao ordinal counter-example landed with them.
Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. ID-CLDR-OTHER: make the branch sentence generation-aware — the target carries exactly
   one *catch-all* branch, spelled `*` in the current standard and `other` in the older one.
2. Drop "skeleton defect at worst"; recommend removal on translation-cost grounds only,
   and note that dropping a source branch is the move a skeleton comparator can flag.
   **The same sentence appears in the golden path** and needs the same fix.
3. Add the exact-key escape hatch.
4. Keep the ordinal parenthetical but strengthen it, with Lao as the in-cohort
   counter-example.

## Cross-subject proposals

- **The catch-all is mandatory and its spelling is generation-specific** — 1 sighting,
  and locale-independent. Applies to every plural-carrying subject in the bundle
  (`arabic`, `czech`, `russian`, `french`, `spanish`, `hindi`, `japanese`, `korean`,
  `vietnamese`, `bengali`, `chinese`). A second worker hitting it makes it a technique
  edit at two; a possible law candidate under `format-skeleton-is-inviolable`.

## Could not verify

Whether any shipping i18n runtime *lints* an unreachable variant key. ICU does not, and
a third-party linter is class-A evidence about that linter, not class-B about the standard.
