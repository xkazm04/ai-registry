---
layer: application
type: application
subject: german
technique: de-anglicization-constructions
stack: process
status: forged
verified_on: 2026-08-24
---

# How the kp repo runs the German construction audit

The kp project (`C:\Users\kazda\kiro\kp`) is where the German construction
rules were minted as anchored IDs, and its i18n tree shows the full mechanism
working: rules with identifiers, review records citing them, and settled
exceptions found by over-application.

## The artifacts

- `C:\Users\kazda\kiro\kp\docs\i18n\constructions-de.md` — the rule file this
  subject's IDs were migrated from: DE-DASH, DE-LOANWORD, DE-HYPHEN,
  DE-CALQUE-PREP, DE-FORMAL, DE-PLEONASM, DE-NOMINALSTIL, DE-NBSP, DE-ANTHRO,
  DE-ONE-WORD. Each rule carries trigger/rule/source, with Microsoft German
  Localization Style Guide section numbers as provenance (§4.1.15 dashes,
  §5.4 English terminology, §4.1.13 prepositions, §2.1.2 words to avoid,
  §4.1.18 non-breaking spaces) and **(house)** marking where the rule is kp's
  own decision because Microsoft defers to Duden (DE-PLEONASM,
  DE-NOMINALSTIL). Every ✗/✓ pair is a real string from `messages/de.json`.
- `C:\Users\kazda\kiro\kp\docs\i18n\style-de.md` — the register/typography
  contract the rules sit inside. Note its dash section: kp *bans* the dash as
  prose punctuation outright (recast with full stop, colon, comma pair;
  en dash survives only in ranges like `3–5 Tage`) — a recorded house ruling
  that deliberately goes beyond DE-DASH. This is the live example of a house
  overruling the authority legitimately: the ruling is written where the rule
  lives (`contract.md` §5 is cited).
- `C:\Users\kazda\kiro\kp\docs\i18n\review-de.md` — the review ledger. Its
  2026-08-12 full-sweep section is the proof the anchor mechanism works at
  audit time: findings cite the IDs directly ("constructions-de.md
  DE-CALQUE-PREP" on `scheduleTab.transcript.readbackHeading`'s
  "Zurückgelesen" calque; DE-LOANWORD on "eine gerankte Shortlist";
  DE-NOMINALSTIL on `data.erasedBody`; DE-ONE-WORD on the
  fallbasiert/case-basiert split), while findings with **no** anchor are
  explicitly left unfixed ("No anchored rule, so leaving as-is" recurs
  verbatim) — clean-strings discipline enforced by the absence of an ID.

## Incident-shaped lessons the rules came from

- **DE-DASH by counting**: kp's German landing carried 41 em dashes against
  the English source's 39 — punctuation travelled with the copy. The count,
  not a native's ear, is what made it a finding.
- **DE-HYPHEN by counting**: 50 hyphenated compounds against English's 29;
  the surplus, inspected, was English word order preserved by punctuation
  (`Eignungs-Score` → `Eignungsscore`).
- **DE-COLLOC was minted from kp's residue**: review-de.md flags "breite
  Konfidenz" / "enge Konfidenz" (collocation calque of wide/tight
  confidence; German widens the *Konfidenzintervall*), "dünn beim
  Must-have-Stack" (calque of "thin on"), and "Eignung wird gelesen" (German
  does not "read" a score) — each annotated "no construction ID covers it,
  left as-is". A recurring finding class with no anchor is exactly the
  minting signal; this subject's DE-COLLOC closes that gap.
- **The agreement corollary is a shipped defect**: `pipeline.tab.degradedBannerBody`
  carried the English ICU branch literals `one {is} other {are}` verbatim
  inside the German value — structurally valid, linguistically English, and
  invisible to every format checker.
- **Verb-loan pain**: review-de.md documents "gemintet / das Minting"
  (English noun verbed into non-German), "sourct … neu" and "gesourct"
  (glossary loan noun dragged into conjugation), and "ranken" colliding with
  the native verb for climbing plants — the evidence behind this subject's
  "noun loans are cheap, verb loans are expensive" rule.

## The half-sweep discipline in practice

The ledger repeatedly declines correct fixes because the sibling strings sit
outside the batch: the three-value confidence band (`jobs.compare.confidence.*`),
the AI/KI split (92 AI vs 26 KI catalog-wide), the percent-spacing split
(24 spaced vs 26 unspaced), the Rolle/Position intake cluster (6+ strings).
Each entry cites the same house note: "a half-sweep is worse than none." That
is the process shape to copy: a construction audit *records* cluster-scoped
findings for a coordinated decision instead of patching the members it
happens to touch.
