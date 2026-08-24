---
layer: application
type: application
subject: french
technique: typography-and-spacing
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — French typography rules in two live catalogs (kp, Personas)

How two real products in the fleet operate the typography technique, verified
against their trees on 2026-08-24. The instructive part is that they made
**different house calls on the same rule** — both correct, both recorded.

## kp — anchored rules, measured non-compliance, staged sweeps

`C:\Users\kazda\kiro\kp\docs\i18n\constructions-fr.md` is the anchored rule
set this subject's IDs were migrated from. Its provenance section pins the
Microsoft French (France) Localization Style Guide (`fra-fra-StyleGuide.pdf`,
53 pp, via aka.ms/french-france-styleguide) as house authority and cites its
section numbers per rule — the pattern this bundle teaches as "authority named
per rule".

The rules arrived with **measurements, not vibes**:

- **FR-APOS**: the French landing page scored 59 of 245 keys with straight
  apostrophes and zero curly — total non-compliance. Catalog-wide,
  `review-fr.md` later counted 1466 straight vs 216 typographic and
  deliberately *kept* the straight form in a namespace-scoped pass, queueing
  the U+2019 switch as a separate whole-catalog sweep: the half-sweep-is-worse
  doctrine applied to typography.
- **FR-SPACE**: measured three-way inconsistency (9 keys U+202F, 6 plain
  breaking space, 0 U+00A0). kp's ruling: **U+202F**, normalize toward it.
- **FR-DASH**: 38 em dashes against English's 39 — the copied-not-localized
  count. kp then tightened beyond the Microsoft guide: `docs/i18n/style-fr.md`
  records that `contract.md` §5 bans the em dash outright and the en dash as a
  prose dash too (surviving only in number ranges, `3–5 jours`), and the
  2026-08-12 sweep in `review-fr.md` recast every dash-as-punctuation string
  across all four catalogs — a worked example of a house overruling its
  authority *with the ruling recorded where the rule lives*.
- **FR-UNIT's minting incident**: the same sweep found number+unit spacing
  inconsistent ("~23 h", "0 Kč", "≈ 10 $" with breaking spaces while stat1Value
  used U+202F before %) and logged: "style-fr.md documents U+202F only before
  ; : ! ? … there is no fr anchor for units — needs a documented rule before a
  sweep, otherwise it is churn." That log line is why this subject carries
  FR-UNIT. The `decisions` namespace's ~14 percent-bearing keys missing U+202F
  before % were enumerated key-by-key in `review-fr.md` for one batched fix.

## Personas — the pragmatic variant of the same rules

`C:\Users\kazda\kiro\personas\docs\i18n\style-fr.md` runs the same rule set
with two different house calls:

- **U+00A0 instead of U+202F** before `: ; ! ?` and inside guillemets — the
  wide-support pragmatic choice. The guide is explicit that the character
  matters, not its looks: "A plain space is visually identical in most editors
  but is typographically wrong."
- **Fix-on-touch for ellipses**: the shipped file held 205 real `…` against
  497 literal `...`; the rule is fix any string you touch, but "this is not a
  license to bulk-edit strings outside your task" — clean-strings discipline
  written into a typography rule.

Its Pitfalls #5 documents the classic incident this technique warns about:
`"Statut :"` with a plain space shipping because the editor renders both
spaces identically — the audit must check code points.

## The transferable procedure

1. Adopt a published authority, cite its section per rule, record where the
   house overrules it (kp's dash ban).
2. **Count before sweeping** — every kp rule above landed with a measured
   occurrence count, which is what made "normalize to U+202F" a decision
   rather than an opinion.
3. Sweep whole-catalog or not at all; namespace passes may fix meaning but
   must not half-convert typography (kp's apostrophe call).
4. When a defect recurs without an anchor, mint the anchor before the sweep
   (FR-UNIT), then batch the enumerated keys.
