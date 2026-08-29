---
subject: czech
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# czech

First touch. External-reconcile wave 2, class B. Second source for a technique that
already had a `process` application.

**Pin.** `unicode-org/cldr@release-48-2` (supplemental files byte-identical to
`release-48`, so no finding depends on the maintenance tag) + UTS #35 Part 3.
File: `spec--plural-and-count-agreement.md`. **Fate: `many` confirmed, ranges refuted.**

## Sightings

- **`many` is the visible-fraction category — and the technique's prose already says so.**
  The rule is `v != 0`. The residue is that the technique's **summary table** contradicts
  its own prose four lines later, with a `When` cell reading "any non-integer" — a
  value-based claim the rule does not make. `many` is not "non-integer", it is
  *rendered with at least one fraction digit*: `1000000,0` is `many`, `1000000` is
  `other`, and `other` carries **no `@decimal` samples at all**.
- **The control that proves it is the plausible one.** Reading `many` as a large-quantity
  category fails 42 of 47 — an obvious miss. Reading it as "any non-integer" fails on
  exactly the **eight integer-valued decimals** (0.0, 1.0, 10.0 … 1000000.0), which is
  the demonstration. A Czech `many` string must read beside *1,0* as well as *1,5*, which
  rules out any wording presuming a fraction.
- **Branch reachability is set by formatter precision, not by data.** With
  `minimumFractionDigits: 2`, **9 of 9** probe counts select `many` and `one`/`few`
  become unreachable. A currency or measure surface needs `many` even when every
  underlying count is a whole number.
- **Compact notation splits one quantity across two categories.** `cs.xml` long compact
  carries all four forms for 1000000; the reference implementation renders 1500000 as
  *1,5 milionu* (the `many` pattern) while `select()` returns `other`. A Czech string
  pairing a compact number with its own plural block disagrees with the number beside it.
- **Ranges: refuted.** The `cs pl sk` group has 14 rows and **0 overrides** — every
  result equals its end. **Verified by the director.** Not a file-wide artifact: 11 of
  22 groups in the same document *do* carry overrides. The value of the cs table is that
  end-only was *verified*, not assumed.
- Ordinals: single-category `other`, confirmed. Caveat added — invariance is in the
  category set, so the `selectordinal` construct still exists and deleting it is a
  skeleton break.

## Technique-edit candidates (banked for the cycle)

1. The summary table's `many` row: "any non-integer" → "rendered with a visible fraction
   digit (`v != 0`)". The prose is right; the table is not.
2. "`many` when non-integers are possible" → "`many` whenever the formatter can emit a
   fraction digit".
3. A ranges sentence — for `cs` the rule is "the end value's branch", **verified**.

## Cross-subject proposals

- **The range family, sighting 2** — and the one that corrected its framing. From
  [[arabic]] alone the claim would have been "range tables override the default"; `cs`
  disproves that. The transferable rule is the mechanism: a written row may **confirm or
  override**, so counting rows tells you nothing.
- **"Plural category is a property of the rendered representation, not the quantity"** —
  pairs with [[russian]] (`v = 0` guards) and [[french]]/[[spanish]] (compact notation).

## Could not verify

The technique's Czech **grammar** claim (`many` takes the genitive singular, *1,5 dne*)
is outside the CLDR pin and was deliberately left untouched rather than restated as
spec-backed. The apparent tension between §Operands (compact `1.2c6` has `v=0` after the
c-shift) and §Compact Number Formats (pattern `count` chosen from N′) is described as two
different selections, which is what the reference implementation does; no spec sentence
reconciling them was found, and no spec defect is claimed.
